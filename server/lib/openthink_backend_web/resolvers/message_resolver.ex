defmodule OpenthinkBackendWeb.MessageResolver do
  require Logger
  alias OpenthinkBackend.Repo
  alias OpenthinkBackendWeb.MessageQueries
  alias OpenthinkBackend.{Message, Room, RoomUser, User, SpaceUser}
  import Ecto.Query
  alias Absinthe.Relay.Connection

  def get_room_num_users(room, args, _context) do
    Absinthe.Resolution.Helpers.batch(
      {MessageQueries, :get_room_num_users, args},
      room.room_id,
      fn batch_results ->
        case Map.get(batch_results, room.room_id, 0) do
          nil -> {:error, "Couldn't determine number of related posts"}
          num -> {:ok, num}
        end
      end
    )
  end

  def get_message_children(%{message_id: message_id}, pagination_args, _context) do
    Absinthe.Resolution.Helpers.batch(
      {MessageQueries, :get_message_children, pagination_args},
      message_id,
      fn batch_results ->
        Map.get(batch_results, message_id, [])
        |> Connection.from_list(pagination_args)
      end
    )
  end

  def get_children_count(%{message_id: message_id}, _args, _context) do
    Absinthe.Resolution.Helpers.batch(
      {MessageQueries, :get_message_children_count},
      message_id,
      fn batch_results ->
        {:ok, Map.get(batch_results, message_id, 0)}
      end
    )
  end

  def get_room_messages(pagination_args, %{source: room}) do
    {:ok, result} = Absinthe.Relay.Connection.from_query(
      MessageQueries.get_room_messages(room.room_id),
      &Repo.all/1,
      pagination_args
    )
    {:ok, Map.put(result, :edges, (result.edges))}
  end

  def get_replying_to_id(%{replying_to: replying_to}, _, _) do
    if !!replying_to do
      {:ok, Absinthe.Relay.Node.to_global_id("Message", replying_to)}
    else
      {:ok, nil}
    end
  end

  def get_reactions(pagination_args, %{source: %{message_id: message_id}, context: context}) do
    Absinthe.Resolution.Helpers.batch(
        {MessageQueries, :get_reactions, %{user_id: Map.get(context, :user_id)}},
        message_id,
        fn batch_results ->
          Map.get(batch_results, message_id, [])
          |> Absinthe.Relay.Connection.from_list(pagination_args)
        end
      )
  end

  def get_room_pinned_messages(pagination_args, %{source: room}) do
    {:ok, result} = Absinthe.Relay.Connection.from_query(
      MessageQueries.get_room_pinned_messages(room.room_id),
      &Repo.all/1,
      pagination_args
    )
    {:ok, Map.put(result, :edges, (result.edges))}
  end

  def get_message_by_id(_root, %{message_id: message_id}, _res) do
    msg = from(m in MessageQueries.get_messages(),
    where: m.message_id == ^message_id)
    |> Repo.one
    {:ok, msg}
  end

  def get_room_by_id(_root, %{room_id: id}, info) do
    {id, _text} = Integer.parse(id)


    room = MessageQueries.get_room_by_id(id)
    if is_nil(room) do
      {:ok, room}
    else
      room = if is_nil(room.space_id) and is_nil(room.name) do # this is a room whose name may need to be manually computed based on the users within it
        users = Repo.all(
          from ru in OpenthinkBackend.RoomUser,
          where: ru.room_id == ^room.room_id,
          preload: [:user]
        )
        |> Enum.map(fn u -> u.user end)

        Map.merge(room, OpenthinkBackendWeb.RoomUtils.generate_room_name_and_icon(room, users, info.context.user_id))
      else
        room
      end

      {:ok, room}
    end
  end

  def get_rooms_by_user_ids(_root, args, %{context: %{user_id: user_id}}) do
    %{user_ids: user_ids} = args
    user_ids = [user_id | user_ids]
    room = MessageQueries.get_room_by_user_ids(user_ids, user_id)
    room = if !is_nil(room) do
      if Map.has_key?(args, :unarchive) and Map.get(args, :unarchive) do
        MessageQueries.unarchive_room(user_id, room.room_id)
      end
      Map.merge(room, OpenthinkBackendWeb.RoomUtils.generate_room_name_and_icon(room, room.users, user_id))
    else
      room
    end
    {:ok, room}
  end

  def get_room_users(pagination_args, %{source: room}) do
    Absinthe.Relay.Connection.from_query(
      MessageQueries.get_room_users(room.room_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_active_room_users(pagination_args, %{source: room}) do
    Absinthe.Relay.Connection.from_query(
      MessageQueries.get_active_room_users(room.room_id, room.space_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_inactive_room_users(pagination_args, %{source: room}) do
    Absinthe.Relay.Connection.from_query(
      MessageQueries.get_inactive_room_users(room.room_id, room.space_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def send_message(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    {:ok, message} = OpenthinkBackendWeb.MessageQueries.create_message(Map.put(input, :created_by, user_id))

    node = if !!Map.get(message, :room_id) do
      message
      |> Map.put(:room, %{room_id: message.room_id, last_message_at: DateTime.utc_now()})
      |> Map.merge(input)
    else
      message
    end


    {:ok,
      %{
        room_id: message.room_id,
        message_edge: %{
          node: node
        }
      }
    }

  end

  def send_message(_parent, _args, _resolution) do
    {:error, "Access denied"}
  end

  def delete_message(_parent, %{input: %{message_id: global_id}}, %{context: %{user_id: user_id}}) do
    case Absinthe.Relay.Node.from_global_id(global_id, OpenthinkBackendWeb.Schema) do
      {:ok, %{type: :message, id: message_id}} ->
        message = Repo.get(Message, message_id)

        if !!message.post_id do
          if from(m in Message, where: m.replying_to == ^message.message_id) |> Repo.exists? do
            {:ok, message} = message
            |> Message.delete_changeset(%{deleted: true})
            |> Repo.update

            {:ok, %{message: message, post_id: message.post_id}}
          else
            message = OpenthinkBackendWeb.MessageQueries.delete_message(message_id, user_id)
            {:ok, %{deleted_message_id: global_id, message: message, post_id: message.post_id}}
          end
        else
          message = OpenthinkBackendWeb.MessageQueries.delete_message(message_id, user_id)
          {:ok, %{deleted_message_id: global_id, message: message, room_id: message.room_id}}
        end
      _ ->
        {:error, "Id provided is invalid"}
    end
  end

  def update_message(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    {:ok, message} = OpenthinkBackendWeb.MessageQueries.update_message(input, user_id)
    {:ok, %{
        message: message
      }
    }
  end

  def update_message(_parent, _args, _resolution) do
    {:error, "Access denied"}
  end

  def pin_message(_parent, %{input: input}, %{context: %{user_id: _user_id}}) do
    {:ok, message} = OpenthinkBackendWeb.MessageQueries.pin_message(input)
    {:ok, %{
        message: message
      }
    }
  end

  def pin_message(_parent, _args, _resolution) do
    {:error, "Access denied"}
  end


  def create_room(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    {:ok, room} = OpenthinkBackendWeb.MessageQueries.create_room(Map.put(input, :created_by, user_id), user_id)

    users = Repo.all(
      from ru in RoomUser,
      where: ru.room_id == ^room.room_id and ru.user_id != ^user_id,
      preload: [:user]
    ) |> Enum.map(
      fn ru ->
        OpenthinkBackendWeb.Endpoint.broadcast("user:#{ru.user_id}", "join_room", room)
        ru.user
      end
    )

    room = room
    |> Map.put(:client_id, input.client_id)
    |> Map.merge(OpenthinkBackendWeb.RoomUtils.generate_room_name_and_icon(room, users, user_id))

    if is_nil(room.space_id) do # room is a dm so let each user except for the creator know it exists
      users |> Enum.each(fn u -> Absinthe.Subscription.publish(OpenthinkBackendWeb.Endpoint, %{room_edge: %{node: room}}, direct_messages: "user:#{u.user_id}") end)
    end

    {:ok, %{
        space_id: room.space_id, # if this is a channel this will ensure the space's channel list is updated
        room_edge: %{
          node: room
        }
      }
    }
  end

  def create_room(_parent, _args, _resolution) do
    {:error, "Access denied"}
  end

  def delete_room(_parent, %{input: %{room_id: global_id}}, %{context: %{user_id: user_id}}) do
    value = Absinthe.Relay.Node.from_global_id(global_id, OpenthinkBackendWeb.Schema)
    {:ok, %{type: :room, id: room_id}} = value
    room = OpenthinkBackendWeb.MessageQueries.delete_room(room_id, user_id)
    {:ok, %{deleted_room_id: global_id, space_id: room.space_id}}
  end

  def delete_room(_parent, _args, _resolution) do
    {:error, "Invalid arguments"}
  end

  def read_room(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    {:ok, room_user} = OpenthinkBackendWeb.MessageQueries.read_room(input, user_id)
    rooms = Repo.all(
      from ru in RoomUser,
      where: ru.user_id == ^user_id,
      preload: :room
    )
    user = rooms
    |> OpenthinkBackendWeb.UserQueries.generate_unread_vals
    |> Map.put(:user_id, user_id)


    space_user = if !is_nil(input.space_id) do
      Repo.one(
        from su in SpaceUser,
        where: su.user_id == ^user_id and su.space_id == ^input.space_id
      )
    else
      nil
    end

    {:ok, %{
        room_user: room_user,
        user: user,
        space_user: space_user
      }
    }
  end

  def read_room(_parent, _args, _resolution) do
    {:error, "Access denied"}
  end

  def update_room(_parent, %{input: input}, _resolution) do
    {:ok, room} = OpenthinkBackendWeb.MessageQueries.update_room(input)
    {:ok, %{
        room: room
      }
    }
  end

  def update_room(_parent, _args, _resolution) do
    {:error, "Access denied"}
  end

  def update_last_room_id(_parent, %{input: input}, %{context: %{user_id: user_id}}) do

    {:ok, user} = OpenthinkBackendWeb.MessageQueries.set_last_room_id(input.room_id, user_id, !is_nil(input.space_id))

    if is_nil(input.space_id) do
      {:ok,
        %{
          me: user
        }
      }
    else
      {:ok,
        %{
          space_user: user
        }
      }
    end


  end

  def update_last_room_id(_parent, _args, _resolution) do
    {:error, "Access denied"}
  end

  @doc """
  Broadcasts the message to everyone including those connected to the room/space in the background
  Invokes query to update entries in database
  """
  def set_message_notification(reply) do
    message = reply.message_edge.node
    if Map.has_key?(message, :room_id) and Map.has_key?(message, :space_id) do
      topic = "room:#{message.room_id}"

      room_graphql_id = Absinthe.Relay.Node.to_global_id("Room", message.room_id)
      space_graphql_id = Absinthe.Relay.Node.to_global_id("Space", (message.space_id))
      OpenthinkBackendWeb.Endpoint.broadcast(
        topic,
        "new_msg",
        %{room_id: message.room_id, room_graphql_id: room_graphql_id, space_graphql_id: space_graphql_id}
      )
      OpenthinkBackendWeb.MessageQueries.set_messages_notifications(message, topic) # update the database
    end

    {:ok, "Worked"}
  end

  def reorder_space_channels(_root, %{input: %{room_id: room_id, space_id: space_id, old_index: old_index, new_index: new_index}}, %{context: %{user_id: _user_id}}) do
    MessageQueries.reorder_space_channels(room_id, old_index, new_index, space_id)
  end
end

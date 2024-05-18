defmodule OpenthinkBackendWeb.MessageQueries do
  @moduledoc """
  Contains database queries to get various user information.
  """
  alias OpenthinkBackend.Repo
  alias OpenthinkBackend.{Message, Room, RoomUser, User, SpaceUser}
  alias OpenthinkBackendWeb.{QueryHelpers, SpaceQueries, Presence, ReactionQueries, NotificationQueries}
  require Logger
  import Ecto.Query

  def get_messages do
    from(m in Message, preload: [:user])
  end

  def get_message_children(_, message_ids) do
    from(m in get_messages(),
    where: m.replying_to in ^message_ids)
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn m, acc ->
        Map.put(acc, m.replying_to,[m | Map.get(acc, m.replying_to, [])])
      end
    )
  end

  def get_message_children_count(_, message_ids) do
    from(m in Message,
    select: %{replying_to: m.replying_to, children_count: count(m.message_id)},
    windows: [post: [partition_by: m.replying_to]],
    group_by: m.replying_to,
    where: m.replying_to in ^message_ids and m.message_id in ^message_ids)
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn m, acc ->
        Map.put(acc, m.replying_to, m.children_count)
      end
    )
  end

  def filter_deleted_comments(query) do
    from m in query,
    left_join: cm in Message,
    on: cm.replying_to == m.message_id and (cm.deleted == false or is_nil(cm.deleted)),
    where: (m.deleted == false or is_nil(m.deleted)) or not is_nil(cm.message_id)
  end

  @doc """
  Get a room by its id
  """
  def get_room_by_id(room_id) do
    Repo.one(
      from r in OpenthinkBackend.Room,
      where: r.room_id == ^room_id
    )
  end

  def get_room_by_user_ids(user_ids, user_id) do
    {:ok, res} = Ecto.Adapters.SQL.query(
      Repo,
      """
      select
        rooms.room_id
        from
        rooms
      left join lateral (
        select
        count(*)
        from
        room_users
        where
        room_users.room_id = rooms.room_id
      ) all_users on true
      left join lateral (
        select
        count(*)
        from
        room_users
        where
        room_users.room_id = rooms.room_id and room_users.user_id in (3, 21)
      ) matched_users on true
      left join
      room_users on room_users.room_id = rooms.room_id
      where
      room_users.user_id = #{user_id}
      and
      rooms.space_id is null
      group by matched_users.count, all_users.count, rooms.room_id
      having
      matched_users.count = all_users.count
      and
      all_users.count > 1
      """
    )

    room = res.rows
    |> Enum.at(0)
    if is_nil(room) do
      room
    else
      room_id = Enum.at(room, 0)
      Repo.one(
        from r in Room,
        where: r.room_id == ^room_id,
        preload: [:users]
      )
    end
  end

  def get_room_users(room_id) do
    from ru in OpenthinkBackend.RoomUser,
    left_join: u in OpenthinkBackend.User, on: u.user_id == ru.user_id,
    where: ru.room_id == ^room_id,
    preload: [user: u]
  end

  def get_active_room_users(room_id, space_id) do
    presences = OpenthinkBackendWeb.Presence.list("space:#{space_id}")
    from ru in OpenthinkBackend.RoomUser,
    left_join: u in OpenthinkBackend.User, on: u.user_id == ru.user_id,
    where: ru.room_id == ^room_id and u.user_id in ^Map.keys(presences),
    preload: [user: u]
  end

  def get_inactive_room_users(room_id, space_id) do
    presences = OpenthinkBackendWeb.Presence.list("space:#{space_id}")
    from ru in OpenthinkBackend.RoomUser,
    left_join: u in OpenthinkBackend.User, on: u.user_id == ru.user_id,
    where: ru.room_id == ^room_id and u.user_id not in ^Map.keys(presences),
    preload: [user: u]
  end

  def delete_message(message_id, user_id) do
    case Repo.get(Message, message_id) |> Repo.delete do
      {:error, _} -> nil
      {:ok, message} -> message
    end
  end

  def delete_room(room_id, user_id) do
    room = Repo.get!(OpenthinkBackend.Room, room_id)
    if is_nil(room.space_id) do
      room_user = Repo.one(
        from ru in RoomUser,
        where: ru.room_id == ^room_id and ru.user_id == ^user_id
      )
      RoomUser.archive_changeset(room_user, %{archived: true})
      |> Repo.update
    else
      Repo.delete(room)
    end

    room
  end


  def get_room_messages(room_id) do
    from m in OpenthinkBackend.Message,
    left_join: u in OpenthinkBackend.User, on: u.user_id == m.created_by,
    where: m.room_id == ^room_id,
    order_by: [desc: m.created_at],
    preload: [:reactions, :mentions, user: u]
  end

  def get_room_pinned_messages(room_id) do
    from m in OpenthinkBackend.Message,
    left_join: u in OpenthinkBackend.User, on: u.user_id == m.created_by,
    where: m.room_id == ^room_id and m.pinned,
    order_by: [desc: m.created_at],
    preload: [:reactions, :mentions, user: u]
  end

  def get_room_message(message_id) do
    Repo.one(
      from m in OpenthinkBackend.Message,
      left_join: u in OpenthinkBackend.User, on: u.user_id == m.created_by,
      where: m.message_id == ^message_id,
      order_by: [desc: m.created_at],
      preload: [:reactions, :mentions, user: u]
    )
  end

  def get_room_user(room_id, user_id) do
    Repo.one(
      from ru in "room_users",
      where: ru.room_id == ^room_id and ru.user_id == ^user_id,
      select: %{
        user_id: ru.user_id,
        room_id: ru.room_id,
      }
    )
  end

  def update_room_last_message(room_id) do
    Repo.get!(OpenthinkBackend.Room, room_id)
    |> Room.set_last_message_changeset(%{last_message_at: DateTime.utc_now()})
    |> Repo.update

  end

  def create_message(msg) do
    case Repo.insert(Message.changeset(%Message{}, (msg))) do
      {:ok, message} ->
        if !!Map.get(message, :post_id) do

          from(ps in OpenthinkBackend.PostSubscription,
          where: ps.post_id == ^message.post_id)
          |> Repo.all
          |> NotificationQueries.spawn_notification_generation(%{type: "post comment", post_id: message.post_id, comment_id: message.message_id}, msg.created_by)

        end
        {:ok, get_room_message(message.message_id)}
      {:error, changeset} ->
        {:error, changeset.errors}
    end
  end

  def update_message(msg, user_id) do
    message = Repo.get!(Message, msg.message_id)
    if message.created_by != user_id do
      {:error, message: "user is not authorized to alter this message"}
    else
      case Repo.update(Message.update_message_changeset(message, msg)) do
        {:ok, message} ->
          {:ok, message}
        {:error, changeset} ->
          {:error, changeset.errors}
      end
    end
  end

  def update_room(rm) do
    original_room = Repo.get!(Room, rm.room_id)
    case Repo.update(Room.update_changeset(original_room, rm)) do
      {:ok, room} ->
        if room.visibility != original_room.visibility do
          if (room.visibility == "internal" or room.visibility == "public") and original_room.visibility == "private" do
            SpaceQueries.get_space_members(room.space_id)
            |> Enum.map(fn user -> %{user_id: user.user_id, room_id: room.room_id} end)
            |> generate_room_users
          end
          if room.visibility == "private" do
            users = SpaceQueries.get_space_members(room.space_id)
            |> Enum.map(fn user -> user.user_id end)
            query = from ru in RoomUser,
            where: ru.user_id in ^users
            remove_room_users(query)
          end
        end
        {:ok, room}
      {:error, changeset} ->
        {:error, changeset.errors}
    end
  end

  def pin_message(msg) do
    message = Repo.get!(Message, msg.message_id)
    case Repo.update(Message.pin_message_changeset(message, msg)) do
      {:ok, message} ->
        {:ok, message}
      {:error, changeset} ->
        {:error, changeset.errors}
    end
  end

  def read_room(%{room_id: room_id}, user_id) do
    room_user = Repo.one(
      from ru in RoomUser,
      where: ru.room_id == ^room_id and ru.user_id == ^user_id
    )
    case Repo.update(RoomUser.read_room_changeset(room_user, %{unread_num: 0, unread: false})) do
      {:ok, room_user} ->
        {:ok, room_user}
      {:error, changeset} ->
        {:error, changeset.errors}
    end
  end

  def create_room(room, user_id) do
    if !is_nil(room.space_id) or (!is_nil(room.user_ids) and Enum.count(room.user_ids) > 0) do
      case Repo.insert(Room.changeset(%Room{}, room)) do
        {:ok, created_room} ->
          users = if !is_nil(room.space_id) do
            if room.visibility == "Private" do
              SpaceQueries.get_space_mods(room.space_id)
            else
              SpaceQueries.get_space_members_mods(room.space_id)
            end
          else
            Enum.map(
              room.user_ids,
              fn id ->
                {num, _msg} = Integer.parse(id)
                %{user_id: num, room_id: created_room.room_id}
              end
            )
          end
          users = [%{user_id: user_id, room_id: created_room.room_id} | users]
          generate_room_users(Enum.map(users, fn user -> %{user_id: user.user_id, room_id: created_room.room_id} end))
          curr_user = Repo.one(
            from ru in RoomUser,
            where: ru.user_id == ^user_id and ru.room_id == ^created_room.room_id
          )
          {:ok, Map.put(created_room, :curr_user, curr_user)} # need to add the curr_user generated for the user who created the room
        {:error, changeset} ->
          {:error, changeset.errors}
      end
    else
      {:error, %{message: "need space_id or user_ids"}}
    end
  end

  defp generate_room_users(users) do
    Repo.insert_all(RoomUser, users, on_conflict: :nothing)
    Enum.each(users, fn user -> OpenthinkBackendWeb.Endpoint.broadcast("user:#{user.user_id}", "new_room", %{room_id: user.room_id}) end)
  end

  defp remove_room_users(users) do
    Repo.delete_all(users)
  end


  def set_last_room_id(room_id, user_id, in_space) do
    # need to update to handle direct messages

    room = Repo.one(
      from r in Room,
      where: r.room_id == ^room_id
    )

    %{space_user: space_user, query: query} = if in_space do
      space_user = Repo.one(
        from su in SpaceUser,
        where: su.space_id == ^room.space_id and su.user_id == ^user_id
      )

      # update last room's presence
      OpenthinkBackendWeb.Endpoint.broadcast!("user:#{user_id}", "switch_room", %{old_room_id: space_user.last_room_id, new_room_id: room_id, user_id: user_id})

      %{space_user: space_user, query: SpaceUser.set_last_room_id_changeset(space_user, %{last_room_id: room_id})}
    else
      user = Repo.one(
        from u in User,
        where: u.user_id == ^user_id
      )

      # update last room's presence
      OpenthinkBackendWeb.Endpoint.broadcast!("user:#{user_id}", "switch_room", %{old_room_id: user.last_room_id, new_room_id: room_id, user_id: user_id})

      %{space_user: user, query: User.set_last_room_id_changeset(user, %{last_room_id: room_id})}
    end


    original_last_room_id = space_user.last_room_id


    case Repo.update(query) do
      {:ok, space_user} ->
        if !is_nil(original_last_room_id) do # set original last room's current room to false
          original_last_room = Repo.one(
            from ru in RoomUser,
            where: ru.room_id == ^original_last_room_id and ru.user_id == ^user_id
          )
          Repo.update(RoomUser.last_room_changeset(original_last_room, %{last_room: false}))
        end

        last_room = Repo.one( # set current last room's current room to false
          from ru in RoomUser,
          where: ru.room_id == ^room_id and ru.user_id == ^user_id
        )
        Repo.update(RoomUser.last_room_changeset(last_room, %{last_room: true}))

        {:ok, space_user}
      {:error, changeset} ->
        {:error, changeset.errors}
    end
  end

  def unarchive_room(user_id, room_id) do
    from(
      ru in RoomUser,
      where: ru.room_id == ^room_id
        and ru.user_id == ^user_id
    )
    |> Repo.update_all(set: [archived: false])
  end

  def set_messages_notifications(message, topic) do
    update_room_last_message(message.room_id)
    # only need to update room notifications since space and me unreads are virtual fields constructed from rooms
    # update room_users set unread = true

    # first get users who are online in the room
    in_room_ids = Presence.list(topic)
    |> Map.values
    |> Enum.filter(
      fn presence ->
        user_id = presence.user.user_id
        meta = Enum.at(presence.metas, 0)
        user_metas = Presence.get_by_key("user:#{user_id}", user_id).metas
        |> Enum.at(0)
        not (Map.has_key?(meta, :current_room) and meta.current_room and (Map.has_key?(meta, :current_page) and user_metas.current_page == "messages"))
      end
    )
    |> Enum.map(fn presence -> presence.user.user_id end)

    from(
      ru in RoomUser,
      inner_join: u in User, on: u.user_id == ru.user_id,
      where: ru.room_id == ^message.room_id
        and ru.user_id != ^message.created_by
        and ru.user_id not in ^in_room_ids
    )
    |> Repo.update_all(set: [unread: true, archived: false])


    """
    # later when mentions come along update room_users set unread_num = unread_num + 1 - look at logic for changing order
    mentioned_user_ids = Enum.map(messages.mentions, fn mention -> mention.user_id end)
    from(r in RoomUser, update: [inc: [unread_num: 1]], where: r.room_id == ^message.room_id and user_id in mentioned_user_ids))
    |> MyRepo.update_all([])
    """


    # unarchive the room for all users if its a dm
    if is_nil(message.space_id) do
      archived_users = Repo.all(
        from ru in RoomUser,
        where: ru.room_id == ^message.room_id and ru.user_id != ^message.created_by and ru.archived
      )

      if Enum.count(archived_users) > 0 do
        room = Repo.one(from r in Room, where: r.room_id == ^message.room_id, preload: [:users])
        room = Map.merge(room, OpenthinkBackendWeb.RoomUtils.generate_room_name_and_icon(room, room.users, nil))
        Enum.each(archived_users, fn u -> Absinthe.Subscription.publish(OpenthinkBackendWeb.Endpoint, %{room_edge: %{node: Map.put(room, :curr_user, u)}}, direct_messages: "user:#{u.user_id}") end)
      end
    end
  end

  def reorder_space_channels(room_id, old_index, new_index, space_id) do
    QueryHelpers.reorder_elements(
      from(r in Room, where: r.room_id == ^room_id),
      from(r in Room, where: r.space_id == ^space_id),
      Room,
      old_index,
      new_index
    )
  end

  def get_room_num_users(_, room_ids) do
    Repo.all(
      from ru in RoomUser,
      distinct: ru.room_id,
      where: ru.room_id in ^room_ids,
      windows: [room: [partition_by: ru.room_id]],
      select: %{room_id: ru.room_id, count: over(count(ru.user_id), :room)}
    )
    |> Enum.reduce(
      %{},
      fn r, acc ->
        Map.put(acc, r.room_id, r.count)
      end
    )
  end

  def get_reactions(%{user_id: user_id}, message_ids) do
    from(r in ReactionQueries.get_reaction_base,
    where: r.message_id in ^message_ids)
    |> ReactionQueries.select_current_user(user_id)
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn pv, acc ->
        Map.put(acc, pv.message_id, [pv | Map.get(acc, pv.message_id, [])])
      end
    )
  end
end

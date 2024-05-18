defmodule OpenthinkBackendWeb.Schema.MessageTypes do
  use Absinthe.Schema.Notation
  alias OpenthinkBackendWeb.MessageResolver
  import OpenthinkBackendWeb.MessageResolver
  use Absinthe.Relay.Schema.Notation, :modern
  require Logger

  object :file do
    field :url, :string
    field :type, :string
    field :file_size, :integer
    field :name, :string
  end

  object :mention do
    field :user_id, :integer
    field :message_id, :integer
    field :post_id, :integer
    field :mention_id, :integer
  end

  node object :message, id_fetcher: &message_id_fetcher/2 do
    field :message_id, non_null(:id)
    field :created_by, :id
    field :body, :string
    field :room_id, :integer
    field :post_id, :integer
    field :edited, :boolean
    field :room, :room
    field :pinned, :boolean
    field :created_at, :string
    field :deleted, :boolean
    field :updated_at, :string
    field :files, list_of(:file)
    field :replying_to, :message
    field :user, :user
    field :has_more_replies, :boolean
    field :replying_to_id, :id do
      resolve &MessageResolver.get_replying_to_id/3
    end
    field :client_id, :string
    connection field :reactions, node_type: :reaction do
      resolve &MessageResolver.get_reactions/2
    end

    field :children_count, :integer do
      resolve &MessageResolver.get_children_count/3
    end

    connection field :children, node_type: :message do
      resolve &MessageResolver.get_message_children/3
    end
  end

  defp message_id_fetcher(message, _expr) do
    to_string(message.message_id)
  end

  node object :room, id_fetcher: &room_id_fetcher/2 do
    field :name, :string
    field :room_id, :integer
    field :space_id, :integer
    field :archived, :boolean
    field :description, :string
    field :dm, :boolean
    field :created_by, :integer
    field :created_at, :string
    field :last_message_at, :datetime
    field :profilepic, :string
    field :index, :integer
    field :private, :boolean
    field :type, :string
    field :visibility, :string
    field :curr_user, :room_user

    field :num_users, :integer do
      resolve &MessageResolver.get_room_num_users/3
    end

    field :other_user, :user
    connection field :messages, node_type: :message do
      resolve &MessageResolver.get_room_messages/2
    end

    connection field :pinned_messages, node_type: :message do
      resolve &MessageResolver.get_room_pinned_messages/2
    end
    connection field :users, node_type: :room_user do
      resolve &MessageResolver.get_room_users/2
    end

    connection field :active_users, node_type: :room_user do
      resolve &MessageResolver.get_active_room_users/2
    end

    connection field :inactive_users, node_type: :room_user do
      resolve &MessageResolver.get_inactive_room_users/2
    end
  end

  defp room_id_fetcher(room, _expr) do
    to_string(room.room_id)
  end

  node object :room_user, id_fetcher: &room_user_id_fetcher/2  do
    field :user_id, :integer
    field :room_id, :integer
    field :archived, :boolean
    field :unread, :boolean
    field :role_id, :integer
    field :unread_num, :integer
    field :muted, :boolean
    field :notification_settings, :integer
    field :muted_until, :string
    field :room_user_id, :integer
    field :user, :user
    field :room, :room
  end

  defp room_user_id_fetcher(room_user, _expr) do
    case room_user do
      %{room_user_id: id} ->
        to_string(id)
      _ -> nil
      end

  end

  connection node_type: :room
  connection node_type: :message
  connection node_type: :room_user

  object :message_queries do
    @desc "Get room by an id"
    field :room, :room do
      arg :room_id, non_null(:id)
      resolve &MessageResolver.get_room_by_id/3
    end

    @desc "Get message by id"
    field :message, :message do
      arg :message_id, non_null(:integer)
      resolve &MessageResolver.get_message_by_id/3
    end

    @desc "Get direct message room by an user_ids. Optionally unarchive if option is set."
    field :room_by_users, :room do
      arg :user_ids, non_null(list_of(non_null(:id)))
      arg :unarchive, :boolean
      resolve &MessageResolver.get_rooms_by_user_ids/3
    end
  end

  input_object :mention_input do
    field :url, non_null(:string)
    field :name, :string
    field :type, :string
    field :file_size, :integer
  end

  object :message_reply_edge do
    field :message_edge, :message_edge
  end

  object :message_sub_reply do
    field :message_edge, :message_edge
    field :deleted_message_id, :id
    field :message, :message
    field :client_id, :string
  end

  object :channel_sub_reply do
    field :room_edge, :room_edge
    field :deleted_room_id, :id
    field :room, :room
    field :client_id, :string
  end

  object :room_edge_edge do
    field :room_edge, :room_edge
  end

  input_object :send_message_input do
    field :body, non_null(:string)
    field :delta, :string
    field :post_id, :integer
    field :replying_to, :integer
    field :room_id, :integer
    field :space_id, :integer
    field :mentions, list_of(:mention_input)
    field :client_id, :string
  end

  input_object :delete_message_input do
    field :message_id, non_null(:id)
  end

  input_object :delete_comment_input do
    field :comment_id, non_null(:integer)
  end

  input_object :delete_room_input do
    field :room_id, non_null(:id)
  end

  input_object :update_message_input do
    field :message_id, non_null(:id)
    field :body, non_null(:string)
  end

  input_object :set_last_room_id_input do
    field :room_id, non_null(:id)
    field :space_id, :id
  end

  input_object :update_room_input do
    field :room_id, non_null(:id)
    field :name, non_null(:string)
    field :description, :string
    field :type, non_null(:string)
    field :visibility, non_null(:string)
  end

  input_object :pin_message_input do
    field :message_id, non_null(:id)
    field :pinned, non_null(:boolean)
  end

  input_object :read_room_input do
    field :room_id, non_null(:id)
    field :space_id, :id
  end

  object :message_delete_edge do
    field :deleted_message_id, :id
    field :message, :message
    field :room_id, :id
  end

  object :room_delete_edge do
    field :deleted_room_id, :id
  end

  object :message_update_reply do
    field :message, :message
  end
  object :room_update_reply do
    field :room, :room
  end

  object :set_last_room_id_reply do
    field :space_user, :space_user
    field :me, :user
  end

  object :read_room_output do
    field :room_user, :room_user
    field :user, :user
    field :space_user, :space_user
  end

  input_object :create_room_input do
    field :space_id, :integer # if channel
    field :user_ids, list_of(:string) # if DM
    field :name, :string
    field :type, :string
    field :dm, :boolean
    field :visibility, :string
    field :index, :integer
    field :client_id, :string
  end

  input_object :message_sub_input do
    field :room_id, :integer
    field :post_id, :integer
    field :client_id, :string
  end

  input_object :channel_sub_input do
    field :space_id, :integer
    field :client_id, :string
  end

  input_object :channel_order_change do
    field :space_id, :integer
    field :room_id, :integer
    field :old_index, :integer
    field :new_index, :integer
  end

  object :message_mutations do
    @desc "Send a message"
    field :send_message, type: :message_reply_edge do
      arg :input, :send_message_input
      resolve &OpenthinkBackendWeb.MessageResolver.send_message/3
    end

    @desc "Delete a message"
    field :delete_message, type: :message_delete_edge do
      arg :input, non_null(:delete_message_input)
      resolve &OpenthinkBackendWeb.MessageResolver.delete_message/3
    end

    @desc "Update a message"
    field :update_message, type: :message_update_reply do
      arg :input, non_null(:update_message_input)
      resolve &OpenthinkBackendWeb.MessageResolver.update_message/3
    end

    @desc "Pin or unpin a message"
    field :pin_message, type: :message_update_reply do
      arg :input, non_null(:pin_message_input)
      resolve &OpenthinkBackendWeb.MessageResolver.pin_message/3
    end

    @desc "Create a room"
    field :create_room, type: :room_edge_edge do
      arg :input, :create_room_input
      resolve &OpenthinkBackendWeb.MessageResolver.create_room/3
    end

    @desc "Delete a room"
    field :delete_room, type: :room_delete_edge do
      arg :input, :delete_room_input
      resolve &OpenthinkBackendWeb.MessageResolver.delete_room/3
    end

    @desc "Read a room"
    field :read_room, type: :read_room_output do
      arg :input, non_null(:read_room_input)
      resolve &OpenthinkBackendWeb.MessageResolver.read_room/3
    end

    @desc "Update a room"
    field :update_room, type: :room_update_reply do
      arg :input, non_null(:update_room_input)
      resolve &OpenthinkBackendWeb.MessageResolver.update_room/3
    end

    @desc "Set last room id"
    field :set_last_room_id, type: :set_last_room_id_reply do
      arg :input, non_null(:set_last_room_id_input)
      resolve &OpenthinkBackendWeb.MessageResolver.update_last_room_id/3
    end

    @desc "Reorder channels in a space"
    field :reorder_space_channels, type: :room do
      arg :input, :channel_order_change
      resolve &OpenthinkBackendWeb.MessageResolver.reorder_space_channels/3
    end
  end

  object :message_subscriptions do
    @desc "Sync messages up with the the room"
    field :room_messages, :message_sub_reply do
      arg :input, non_null(:message_sub_input)
      config fn args, _ ->
        if !Map.get(args.input, :room_id) do
          {:ok, topic: "post:#{args.input.post_id}"}
        else
          {:ok, topic: "room:#{args.input.room_id}"}
        end
      end

      trigger :send_message, topic: fn reply ->
        OpenthinkBackendWeb.MessageResolver.set_message_notification(reply);
        if !Map.get(reply, :room_id) do
          "post:#{reply.message_edge.node.post_id}"
        else
          "room:#{reply.room_id}"
        end
      end

      trigger :delete_message, topic: fn reply ->
        if !Map.get(reply, :room_id) do
          "post:#{reply.post_id}"
        else
          "room:#{reply.room_id}"
        end
      end

      trigger :update_message, topic: fn reply ->
        if !Map.get(reply, :room_id) do
          "post:#{reply.message.post_id}"
        else
          "room:#{reply.message.room_id}"
        end
      end


      resolve fn message_change, _, _ ->
        {:ok, message_change}
      end
    end

    @desc "Sync channels up with the the space"
    field :space_channels, :channel_sub_reply do
      arg :input, non_null(:channel_sub_input)
      config fn args, _ ->
        {:ok, topic: "space:#{args.input.space_id}"}
      end

      trigger :create_room, topic: fn reply ->
        "space:#{reply.space_id}"
      end

      trigger :delete_room, topic: fn reply ->
        "space:#{reply.space_id}"
      end

      trigger :update_room, topic: fn reply ->
        "space:#{reply.room.space_id}"
      end

      resolve fn room_change, _, _ ->
        {:ok, room_change}
      end
    end
  end

end

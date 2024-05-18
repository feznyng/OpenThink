defmodule OpenthinkBackendWeb.Schema.UserTypes do
  use Absinthe.Schema.Notation
  alias OpenthinkBackendWeb.{UserResolver, NotificationResolver}
  require Logger
  use Absinthe.Relay.Schema.Notation, :modern
  import OpenthinkBackendWeb.UserResolver

  node object :user, id_fetcher: &user_id_fetcher/2 do
    interface :image_item
    field :user_id, non_null(:integer)
    field :firstname, :string
    field :lastname, :string
    field :email, :string
    field :profilepic, :string
    field :admin, :boolean
    field :bannerpic, :string
    field :phonenumber, :integer
    field :address, :string
    field :city, :boolean
    field :state, :boolean
    field :longitude, :float
    field :latitude, :float
    field :current_page, :string
    field :profession, :string
    field :pronouns, :string
    field :bio, :string
    field :created_at, :string
    field :updated_at, :string
    field :birthdate, :string
    field :unread_messages, :boolean
    field :unread_messages_num, :integer
    field :notifications_num, :integer do
      arg :read, :boolean
      resolve &NotificationResolver.get_notifications_num/3
    end
    field :unread_direct_messages, :boolean
    field :unread_direct_messages_num, :integer
    field :google_id, :string
    field :default_banner, :string
    field :space_user_id, :integer
    field :type, :string
    field :dark_mode, :boolean
    field :productivity_view, :boolean
    field :last_room_id, :integer
    field :connection, :connection do
      resolve &UserResolver.get_connection/3
    end

    connection field :notifications, node_type: :notification do
      arg :read, :boolean
      arg :type, :string
      resolve &NotificationResolver.get_notifications/2
    end

    field :space_user, :space_user

    field :post_user, :post_user

    field :active, :boolean do
      resolve &UserResolver.get_active_status/2
    end


    connection field :interests, node_type: :topic do
      resolve &UserResolver.get_user_interests/2
    end

    connection field :skills, node_type: :skill do
      resolve &UserResolver.get_user_skills/2
    end

    connection field :spaces, node_type: :space do
      arg :sort_by, :string
      arg :filters, :space_filters
      resolve &UserResolver.get_user_spaces/2
    end

    connection field :direct_messages, node_type: :room do
      resolve &UserResolver.get_user_direct_messages/2
    end

    connection field :posts, node_type: :post do
      arg :filter_types, list_of(:string)
      arg :include_assigned, :boolean
      arg :sort_by, :string
      resolve &UserResolver.get_user_posts/2
    end

    connection field :favorites, node_type: :favorite do
      arg :type, :string
      resolve &UserResolver.get_favorites/2
    end

    connection field :connections, node_type: :user do
      arg :exclude_space_id, :integer
      arg :exclude_requested, :boolean
      resolve &UserResolver.get_connections/2
    end

    connection field :search_connections, node_type: :user do
      arg :query, non_null(:string)
      arg :exclude_space_id, :integer
      arg :exclude_requested, :boolean
      resolve &UserResolver.search_connections/2
    end

  end

  connection node_type: :user

  defp user_id_fetcher(user, _expr) do
    to_string(user.user_id)
  end

  node object :skill, id_fetcher: &skill_id_fetcher/2 do
    field :value, :string
  end

  defp skill_id_fetcher(skill, _expr) do
    to_string(skill.value)
  end

  connection node_type: :skill

  node object :topic, id_fetcher: &topic_id_fetcher/2 do
    field :value, :string
  end

  defp topic_id_fetcher(topic, _expr) do
    to_string(topic.value)
  end

  connection node_type: :topic

  node object :connection, id_fetcher: &connection_id_fetcher/2 do
    field :user1_id, :integer
    field :user2_id, :integer
    field :connection_id, :integer
    field :created_at, :datetime
    field :accepted, :boolean
    field :follower, :boolean
  end

  defp connection_id_fetcher(connection, _expr) do
    to_string(connection.user1_id) <> ":" <> to_string(connection.user2_id)
  end

  node object :favorite, id_fetcher: &favorite_id_fetcher/2 do
    field :favorite_id, :integer
    field :space_id, :integer
    field :space_post_id, :integer
    field :index, :integer
    field :space, :space
    field :post, :post
  end

  defp favorite_id_fetcher(favorite, _expr) do
    to_string(favorite.favorite_id)
  end

  connection node_type: :favorite

  connection node_type: :connection


  object :user_queries do
    @desc "Get all users"
    connection field :users, node_type: :user do
      resolve &UserResolver.all_users/2
    end

    @desc "Search for users"
    connection field :search_users, node_type: :user do
      arg :query, non_null(:string)
      arg :exclude_space_id, :integer
      resolve &UserResolver.search_all_users/2
    end

    @desc "Get a single user by id"
    field :user, :user do
      arg :user_id, non_null(:id)
      resolve &UserResolver.get_user_by_id/3
    end

    @desc "Get current signed in user information"
    field :me, :user do
      resolve &UserResolver.get_current_user/3
    end

    @desc "Get users by user_id"
    field :users_by_ids, list_of(:user) do
      arg :user_ids, non_null(list_of(non_null(:id)))
      resolve &UserResolver.get_users_by_ids/3
    end

    @desc "Get feed"
    connection field :feed, node_type: :post do
      arg :filter_types, list_of(:string)
      arg :sort_by, :string
      resolve &UserResolver.get_feed/2
    end


    @desc "Generate auth token for websocket connections"
    field :socket_auth, type: :auth do
      resolve &socket_auth/3
    end
  end

  input_object :space_order_change do
    field :space_id, :integer
    field :old_index, :integer
    field :new_index, :integer
  end


  input_object :current_page_input do
    field :current_page, :string
  end

  input_object :create_connection_input do
    field :user1_id, non_null(:integer)
    field :user2_id, non_null(:integer)
    field :follower, :boolean
  end

  input_object :delete_connection_input do
    field :user_id, non_null(:integer)
  end

  input_object :change_prefs_input do
    field :dark_mode, :boolean
    field :productivity_view, :boolean
  end

  input_object :temp_sign_in_input do
    field :name, :string
    field :ip_address, :string
    field :anonymous, non_null(:boolean)
  end

  input_object :favorite_space_input do
    field :space_id, non_null(:integer)
    field :favorite, non_null(:boolean)
  end

  object :favorite_space_output do
    field :space, :space
    field :deleted_favorite_id, :id
    field :favorite_space_edge, :favorite_edge
  end

  input_object :update_connection_input do
    field :connection_id, :integer
    field :accepted, :boolean
  end

  input_object :sign_in_input do
    field :email, non_null(:string)
    field :password, non_null(:string)
  end

  input_object :google_sign_in_input do
    field :access_token, non_null(:string)
  end

  input_object :sign_up_input do
    field :email, non_null(:string)
    field :password, non_null(:string)
    field :name, non_null(:string)
  end

  object :auth do
    field :token, :string
  end


  object :user_mutations do


    @desc "Reorder user's spaces in a list"
    field :reorder_user_spaces, type: :space_user do
      arg :input, :space_order_change
      resolve &reorder_user_spaces/3
    end

    @desc "Reorder user's favorite spaces"
    field :reorder_space_favorites, type: :space_user do
      arg :input, :space_order_change
      resolve &reorder_favorite_spaces/3
    end

    @desc "Set current page for tracking"
    field :set_current_page, type: :user do
      arg :input, :current_page_input
      resolve &set_current_page/3
    end

    @desc "Create connection"
    field :create_connection, type: :user do
      arg :input, :create_connection_input
      resolve &create_connection/3
    end

    @desc "Update connection"
    field :update_connection, type: :connection do
      arg :input, :update_connection_input
      resolve &update_connection/3
    end

    @desc "Delete or reject connection"
    field :delete_connection, type: :connection do
      arg :input, :delete_connection_input
      resolve &delete_connection/3
    end

    @desc "Change user preferences"
    field :change_preferences, type: :user do
      arg :input, :change_prefs_input
      resolve &change_prefs/3
    end

    @desc "Favorite space"
    field :toggle_favorite_space, type: :favorite_space_output do
      arg :input, :favorite_space_input
      resolve &favorite_space/3
    end

    @desc "Temp sign in"
    field :temp_sign_in, type: :user do
      arg :input, :temp_sign_in_input
      resolve &temp_sign_in/3
    end

    @desc "Sign in"
    field :sign_in, type: :user do
      arg :input, :sign_in_input
      resolve &sign_in/3
      middleware &maybe_generate_token/2
    end

    @desc "Sign up"
    field :sign_up, type: :user do
      arg :input, :sign_up_input
      resolve &sign_up/3
      middleware &maybe_generate_token/2
    end

    @desc "Sign in/up using Google"
    field :google_sign_in, type: :user do
      arg :input, :google_sign_in_input
      resolve &google_sign_in/3
      middleware &maybe_generate_token/2
    end

    @desc "Sign out"
    field :sign_out, type: :user do
      resolve &sign_out/3
      middleware &maybe_remove_user_id/2
    end
  end

  input_object :user_dm_sub_input do
    field :user_id, :integer
    field :client_id, :string
  end

  object :user_subscriptions do
    @desc "Sync channels up with the the space"
    field :direct_messages, :channel_sub_reply do
      arg :input, non_null(:user_dm_sub_input)
      config fn args, _ ->
        {:ok, topic: "user:#{args.input.user_id}"}
      end

      resolve fn room_change, _, _ ->
        {:ok, room_change}
      end
    end
  end
end

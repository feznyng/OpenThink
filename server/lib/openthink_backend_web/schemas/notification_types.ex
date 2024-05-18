defmodule OpenthinkBackendWeb.Schema.NotificationTypes do
  use Absinthe.Schema.Notation
  alias OpenthinkBackendWeb.NotificationResolver
  require Logger
  use Absinthe.Relay.Schema.Notation, :modern


  node object :notification, id_fetcher: &notification_id_fetcher/2 do
    field :user_id, :integer
    field :comment_id, :integer
    field :user_notification_id, :integer
    field :created_by, :integer
    field :type, :string
    field :created_at, :string
    field :description, :string
    field :read, :boolean
    field :space_user_id, :integer
    field :space_id, :integer
    field :connection_id, :integer
    field :space_post_id, :integer
    field :post, :post
    field :post2, :post
    field :space, :space
    field :space_user, :space_user
    field :comment, :message
    field :post_user, :post_user
    field :connection, :connection
    field :user, :user
    field :post_subscription, :post_subscription
  end

  defp notification_id_fetcher(notification, _expr) do
    to_string(notification.user_notification_id)
  end

  connection node_type: :notification

  node object :post_subscription, id_fetcher: &post_subscription_id_fetcher/2 do
    field :post_subscription_id, :integer
    field :post_id, :integer
    field :user_id, :integer
  end

  def post_subscription_id_fetcher(post_subscription, _expr \\ nil) do
    to_string(post_subscription.post_id) <> ":" <> to_string(post_subscription.user_id)
  end

  connection node_type: :post_subscription

  input_object :notification_read_input do
    field :read, non_null(:boolean)
    field :notification_id, non_null(:integer)
  end

  input_object :notification_read_all_input do
    field :read, :boolean
  end

  object :notification_edge_output do
    field :edge, :notification_edge
  end

  input_object :subscribe_post_input do
    field :post_id, non_null(:integer)
  end

  input_object :new_notifications_sub_input do
    field :user_id, non_null(:integer)
  end

  input_object :delete_notification_input do
    field :notification_id, non_null(:integer)
  end

  object :delete_notification_output do
    field :deleted_notification_id, non_null(:id)
  end

  object :notification_mutations do
    @desc "Subscribe to a post"
    field :subscribe_post, :post_subscription do
      arg :input, non_null(:subscribe_post_input)
      resolve &NotificationResolver.subscribe_post/3
    end

    @desc "Unsubscribe from a post"
    field :unsubscribe_post, :post_subscription do
      arg :input, non_null(:subscribe_post_input)
      resolve &NotificationResolver.unsubscribe_post/3
    end

    @desc "Read notification"
    field :read_notification, :notification do
      arg :input, non_null(:notification_read_input)
      resolve &NotificationResolver.read_notification/3
    end

    @desc "Read all"
    field :read_all_notifications, :string do
      arg :input, non_null(:notification_read_all_input)
      resolve &NotificationResolver.read_all_notification/3
    end

    @desc "Delete notification"
    field :delete_notification, :delete_notification_output do
      arg :input, non_null(:delete_notification_input)
      resolve &NotificationResolver.delete_notification/3
    end
  end

  object :notification_subscriptions do

    @desc "Sync new notifications"
    field :new_notification, :notification_edge_output do
      arg :input, non_null(:new_notifications_sub_input)
      config fn %{input: %{user_id: user_id}}, _ ->
        {:ok, topic: "user:#{user_id}"}
      end
    end
  end
end

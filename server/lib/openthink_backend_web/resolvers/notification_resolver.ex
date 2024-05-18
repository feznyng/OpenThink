defmodule OpenthinkBackendWeb.NotificationResolver do
  alias OpenthinkBackendWeb.NotificationQueries
  alias OpenthinkBackend.{Repo}
  alias Absinthe.Relay.Node
  require Logger

  def subscribe_post(_root, %{input: %{post_id: post_id}}, %{context: %{user_id: user_id}}) do
    NotificationQueries.subscribe_post(post_id, user_id)
  end

  def unsubscribe_post(_root, %{input: %{post_id: post_id}}, %{context: %{user_id: user_id}}) do
    case NotificationQueries.unsubscribe_post(post_id, user_id) do
      {:ok, subscription} ->
        {:ok, %{user_id: user_id, post_id: subscription.post_id}}
      err ->
        err
    end

  end

  def get_post_subscriptions(%{post_id: post_id}, _args, %{context: %{user_id: user_id}}) do
    Absinthe.Resolution.Helpers.batch(
      {NotificationQueries, :get_post_subscriptions, user_id},
      post_id,
      fn batch_results ->
        {:ok, Map.get(batch_results, post_id, %{user_id: user_id, post_id: post_id})}
      end
    )
  end

  def get_notifications(pagination_args, %{context: %{user_id: user_id}}) do
    Absinthe.Relay.Connection.from_query(
      NotificationQueries.get_notifications(user_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_notifications_num(%{user_id: user_id}, args, _res) do
    {:ok, NotificationQueries.get_notifications_num(user_id, args)}
  end

  def delete_notification(_root, %{input: %{notification_id: id}}, %{context: %{user_id: _user_id}}) do
    {:ok, notification} = NotificationQueries.delete_notification(id)
    {:ok, %{deleted_notification_id: Node.to_global_id("Notification", notification.user_notification_id)}}
  end

  def read_notification(_root, %{input: %{notification_id: id, read: read}}, %{context: %{user_id: _user_id}}) do
    NotificationQueries.read_notification(id, read)
  end

  def read_all_notification(_root, _args, %{context: %{user_id: user_id}}) do
    NotificationQueries.read_all_notification(user_id)
    {:ok, "read all notifications"}
  end
end

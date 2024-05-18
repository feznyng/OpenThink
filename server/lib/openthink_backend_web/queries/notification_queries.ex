defmodule OpenthinkBackendWeb.NotificationQueries do
  @moduledoc """
  Contains database queries to get various user information.
  """
  alias OpenthinkBackend.{Repo, Notification, PostSubscription, Connection, Post, Space, SpaceUser, Message, PostUser, User}
  import Ecto.Query
  require Logger
  @types ["post invite", "post edit", "post comment", "post new post", "space invite", "space invite accept", "space request", "space request invite", "space new subspace", "space new post", "connection request", "connection accept"]

  def subscribe_post(post_id, user_id) do
    %PostSubscription{}
    |> PostSubscription.changeset(%{post_id: post_id, user_id: user_id})
    |> Repo.insert
  end

  def spawn_notification_generation(users, notification, user_id) do
    spawn(
      __MODULE__,
      :create_notifications,
      [
        users,
        notification,
        user_id,
      ]
    )
  end

  def unsubscribe_post(post_id, user_id) do
    subscription = from(ps in PostSubscription, where: ps.post_id == ^post_id and ps.user_id == ^user_id)
    |> Repo.one
    Repo.delete(subscription)
  end

  def get_post_subscriptions(user_id, post_ids) do
    from(ps in PostSubscription, where: ps.user_id == ^user_id and ps.post_id in ^post_ids)
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn ps, acc ->
        acc |> Map.put(ps.post_id, ps)
      end
    )
  end

  def get_notifications_base_query() do
    from n in Notification,
    order_by: [desc: n.created_at],
    left_join: p in Post, on: p.post_id == n.post_id,
    left_join: p2 in Post, on: p2.post_id == n.post2_id,
    left_join: s in Space, on: s.space_id == n.space_id,
    left_join: su in SpaceUser, on: su.space_id == n.space_id and su.user_id == n.user_id,
    left_join: pu in PostUser, on: pu.user_id == n.user_id and pu.type == n.post_user_type,
    left_join: m in Message, on: m.message_id == n.comment_id,
    left_join: ps in PostSubscription, on: ps.post_id == n.post_id and ps.user_id == n.user_id,
    left_join: u in User, on: u.user_id == n.created_by,
    left_join: c in Connection, on: (c.user1_id == n.user_id and c.user2_id == n.created_by) or (c.user2_id == n.user_id and c.user1_id == n.created_by),
    select_merge: %{n | post: p, post2: p2, space: s, space_user: su, post_user: pu, comment: m, post_subscription: ps, user: u, connection: c}
  end

  def get_notifications(user_id, opts) do
    from(n in get_notifications_base_query(),
      where: n.user_id == ^user_id
    )
    |> filter_notifications(opts)
    |> filter_read(opts)
  end

  def filter_notifications(query, opts) do
    case Map.get(opts, :type) do
      "Posts" ->
        from n in query,
        where: ilike(n.type, "post%")
      "Groups" ->
        from n in query,
        left_join: s in Space, on: s.space_id == n.space_id,
        where: is_nil(s.project) or s.project != true and ilike(n.type, "space%")
      "Projects" ->
        from n in query,
        left_join: s in Space, on: s.space_id == n.space_id,
        where: s.project and ilike(n.type, "space%")
      "Connections" ->
        from n in query,
        left_join: s in Space, on: s.space_id == n.space_id,
        where: s.project and ilike(n.type, "connection%")
      _ -> query
    end
  end

  defp filter_read(query, opts) do
    case Map.get(opts, :read) do
      true -> from n in query, where: n.read == true
      false -> from n in query, where: n.read == false or is_nil(n.read)
      _ -> query
    end
  end

  def get_notifications_num(user_id, args \\ %{}) do
    from(n in Notification, where: n.user_id == ^user_id, select: count(n.user_notification_id))
    |> filter_read(args)
    |> Repo.one
  end

  def create_notifications(users, notification, user_id) do
    if @types |> Enum.member?(Map.get(notification, :type, "")) do
      notification_ids = users
      |> Enum.filter(fn %{user_id: id} -> id != user_id end)
      |> Enum.map(
        fn user ->
          id = Map.get(user, :user_id)
          space_id = Map.get(user, :space_id)

          case %Notification{}
          |> Notification.changeset(%{created_by: user_id, user_id: id, space_id: space_id} |> Map.merge(notification))
          |> Repo.insert do
            {:ok, %{user_notification_id: notification_id}} -> notification_id
            _ -> nil
          end
        end
      )

      Repo.all(from n in get_notifications_base_query(), where: n.user_notification_id in ^notification_ids)
      |> Enum.each(
        fn note ->
          Absinthe.Subscription.publish(
            OpenthinkBackendWeb.Endpoint,
            %{edge: %{node: note}},
            new_notification: "user:#{note.user_id}"
          )
        end
      )
    else
      raise "Type not in accepted notification types"
    end
  end

  def read_notification(notification_id, read) do
    Repo.get(Notification, notification_id)
    |> Notification.read_changeset(%{read: read})
    |> Repo.update
  end

  def read_all_notification(user_id) do
    from(n in Notification, where: n.user_id == ^user_id)
    |> Repo.update_all(set: [read: true])
  end

  def delete_notification(notification_id) do
    notification = Repo.get(Notification, notification_id)
    Repo.delete notification
  end
end

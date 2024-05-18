defmodule OpenthinkBackend.Notification do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:user_notification_id, :id, autogenerate: true}

  schema "user_notifications" do
    field :user_id, :integer
    field :created_by, :integer
    field :created_at, :utc_datetime
    field :read, :boolean
    field :type, :string
    field :space_id, :integer
    field :post_id, :integer
    field :post2_id, :integer
    field :comment_id, :integer
    field :post_user_type, :string

    has_one :post, OpenthinkBackend.Post, foreign_key: :post_id
    has_one :post2, OpenthinkBackend.Post, foreign_key: :post2_id
    has_one :space, OpenthinkBackend.Space, foreign_key: :space_id
    has_one :space_user, OpenthinkBackend.SpaceUser, foreign_key: :space_id
    has_one :post_user, OpenthinkBackend.PostUser, foreign_key: :space_id
    has_one :connection, OpenthinkBackend.Connection
    has_one :comment, OpenthinkBackend.Messsage, foreign_key: :comment_id
    has_one :post_subscription, OpenthinkBackend.PostSubscription
    has_one :user, OpenthinkBackend.User, foreign_key: :created_by

  end

  @required_field [:user_id, :type]
  def changeset(notification, params \\ %{}) do
    notification
    |> cast(params, @required_field ++ [:space_id, :created_by, :post2_id, :post_user_type, :comment_id, :post_id])
    |> validate_required(@required_field)
  end

  def read_changeset(notification, params \\ %{}) do
    notification
    |> cast(params, [:read])
    |> validate_required([:read])
  end
end

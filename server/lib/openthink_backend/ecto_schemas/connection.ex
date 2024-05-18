defmodule OpenthinkBackend.Connection do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:connection_id, :id, autogenerate: true}

  schema "user_connections" do
    field :user1_id, :integer
    field :user2_id, :integer
    field :created_at, :utc_datetime
    field :accepted, :boolean
    field :follower, :boolean
    has_one :user1, OpenthinkBackend.User, references: :user1_id, foreign_key: :user_id
    has_one :user2, OpenthinkBackend.User, references: :user2_id, foreign_key: :user_id
    has_one :user, OpenthinkBackend.User
  end

  def changeset(connection, params \\ %{}) do
    connection
    |> cast(params, [:user1_id, :user2_id, :follower])
    |> validate_required([:user1_id, :user2_id])
  end
  def update_changeset(connection, params \\ %{}) do
    connection
    |> cast(params, [:accepted])
    |> validate_required([:accepted])
  end
end

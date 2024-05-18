defmodule OpenthinkBackend.SpaceUser do
  use Ecto.Schema
  import Ecto.Changeset
  require Logger
  @primary_key {:space_user_id, :id, autogenerate: true}

  schema "space_users" do
    field :user_id, :integer
    field :space_id, :integer
    field :type, :string
    field :index, :integer
    field :request, :boolean
    field :accepted, :boolean
    field :request_type, :string
    field :last_room_id, :integer
    many_to_many :roles, OpenthinkBackend.Role, join_through: "space_user_roles", join_keys: [space_user_id: :space_user_id, role_id: :role_id]
    has_one :user, OpenthinkBackend.User, foreign_key: :user_id
    has_one :space, OpenthinkBackend.Space, foreign_key: :space_id
  end

  @valid_user_types ["Follower", "Member", "Moderator", "Creator"]

  def changeset(space_user, params \\ %{}) do
    space_user
    |> cast(params, [:user_id, :space_id, :type, :request, :accepted, :request_type])
    |> validate_required([:user_id, :space_id, :type])
    |> validate_user_type
  end

  def validate_user_type(changeset) do
    validate_change(changeset, :type, fn field, value ->
      case value in @valid_user_types do
        true ->
          []
        false ->
          [{field, "user type is incorrect"}]
      end
    end)
  end

  def set_last_room_id_changeset(space_user, attrs \\ %{}) do
    space_user
    |> cast(attrs, [
      :last_room_id,
      ])
    |> validate_required([
      :last_room_id,
    ])
  end

  def set_index_changeset(space_user, params \\ %{}) do
    space_user
    |> cast(params, [:index])
    |> validate_required([:index])
  end


  def update_changeset(space_user, params \\ %{}) do
    space_user
    |> cast(params, [:accepted, :type, :request, :space_user_id, :request_type])
  end
end

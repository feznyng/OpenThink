defmodule OpenthinkBackend.Room do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:room_id, :id, autogenerate: true}

  schema "rooms" do
    field :name, :string
    field :space_id, :integer
    field :archived, :boolean
    field :description, :string
    field :dm, :boolean
    field :created_by, :integer
    field :created_at, :date
    field :last_message_at, :utc_datetime
    field :profilepic, :string
    field :index, :integer
    field :type, :string
    field :visibility, :string
    has_many :messages, OpenthinkBackend.Message, foreign_key: :room_id
    has_many :room_users, OpenthinkBackend.RoomUser, foreign_key: :room_id
    many_to_many :users, OpenthinkBackend.User, join_through: "room_users", join_keys: [room_id: :room_id, user_id: :user_id]
    has_one :curr_user, OpenthinkBackend.RoomUser, foreign_key: :room_id
  end

  def changeset(room, params \\ %{}) do
    room
    |> cast(params, [:name, :type, :created_by, :visibility, :space_id, :dm, :index])
    |> validate_required([:created_by])
  end

  def update_changeset(room, params \\ %{}) do
    room
    |> cast(params, [:name, :type, :created_by, :visibility, :space_id, :description])
    |> validate_required([:name, :type, :created_by, :visibility])
  end

  def set_last_message_changeset(room, params \\ %{}) do
    room
    |> cast(params, [:last_message_at])
    |> validate_required([:last_message_at])
  end

  def archive_changeset(room, params \\ %{}) do
    room
    |> cast(params, [:archived])
    |> validate_required([:archived])
  end

  def set_index_changeset(room, params \\ %{}) do
    room
    |> cast(params, [:index])
    |> validate_required([:index])
  end
end

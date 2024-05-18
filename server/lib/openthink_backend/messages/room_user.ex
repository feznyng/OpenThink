defmodule OpenthinkBackend.RoomUser do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:room_user_id, :id, autogenerate: true}

  schema "room_users" do
    field :user_id, :integer
    field :room_id, :integer
    field :archived, :boolean
    field :unread, :boolean
    field :role_id, :integer
    field :unread_num, :integer
    field :last_room, :boolean
    field :muted, :boolean
    field :notification_settings, :integer
    field :muted_until, :utc_datetime
    has_one :user, OpenthinkBackend.User, references: :user_id, foreign_key: :user_id
    has_one :room, OpenthinkBackend.Room, references: :room_id, foreign_key: :room_id
  end

  def changeset(room_user, params \\ %{}) do
    room_user
    |> cast(params, [:user_id, :room_id])
    |> validate_required([:user_id, :room_id])
  end

  def read_room_changeset(room_user, attrs \\ %{}) do
    room_user
    |> cast(attrs, [
      :unread_num,
      :unread
      ])
    |> validate_required([
      :unread_num,
      :unread
    ])
  end

  def last_room_changeset(room_user, attrs \\ %{}) do
    room_user
    |> cast(attrs, [
        :last_room
      ])
    |> validate_required([
      :last_room
    ])
  end

  def archive_changeset(room, params \\ %{}) do
    room
    |> cast(params, [:archived])
    |> validate_required([:archived])
  end
end

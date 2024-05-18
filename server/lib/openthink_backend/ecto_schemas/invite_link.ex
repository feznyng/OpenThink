defmodule OpenthinkBackend.InviteLink do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:url, :string, []}

  schema "invite_links" do
    field :space_id, :integer
    field :room_id, :integer
    field :invited_by, :integer
    field :type, :string
    field :created_at, :utc_datetime
    field :num_uses, :integer
    field :expires_at, :utc_datetime

    has_one :space, OpenthinkBackend.Space, foreign_key: :space_id
    has_one :room, OpenthinkBackend.Room, foreign_key: :room_id
    has_one :user, OpenthinkBackend.User, foreign_key: :user_id, references: :invited_by
  end

  def changeset(link, params \\ %{}) do
    link
    |> cast(params, [:url, :space_id, :room_id, :type, :invited_by, :created_at, :num_uses, :expires_at])
    |> validate_required([:url, :space_id, :type])
    |> validate_num_uses
  end

  def use_link_changeset(link) do
    change(link, num_uses: link.num_uses - 1)
    |> validate_num_uses
  end

  def validate_num_uses(changeset) do
    validate_change(changeset, :num_uses, fn field, value ->
      case value do
        0 ->
          [{field, "Num uses must be null or greater than 0"}]
        _ ->
          []
      end
    end)
  end
end

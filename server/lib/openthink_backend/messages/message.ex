defmodule OpenthinkBackend.Message do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:message_id, :id, autogenerate: true}

  schema "messages" do
    field :created_by, :integer
    field :body, :string
    field :room_id, :integer
    field :post_id, :integer
    field :delta, :string
    field :edited, :boolean
    field :pinned, :boolean
    field :created_at, :utc_datetime
    field :updated_at, :utc_datetime
    field :deleted, :boolean
    field :replying_to, :integer
    has_one :user, OpenthinkBackend.User, foreign_key: :user_id, references: :created_by
    has_many :reactions, OpenthinkBackend.Reaction, foreign_key: :message_id
    has_many :mentions, OpenthinkBackend.Mention, foreign_key: :message_id
  end

  def changeset(message, params \\ %{}) do
    message
    |> cast(params, [:body, :created_by, :room_id, :post_id, :delta, :replying_to])
    |> validate_required([:body, :created_by])
  end

  def delete_changeset(message, params \\ %{}) do
    message
    |> cast(params, [:deleted])
    |> validate_required([:deleted])
  end

  def update_message_changeset(message, attrs \\ %{}) do
    message
    |> cast(attrs, [
      :body
      ])
    |> validate_required([
      :body
    ])
  end

  def pin_message_changeset(message, attrs \\ %{}) do
    message
    |> cast(attrs, [
      :pinned
      ])
    |> validate_required([
      :pinned
    ])
  end
end

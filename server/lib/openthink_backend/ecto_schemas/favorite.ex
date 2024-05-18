defmodule OpenthinkBackend.Favorite do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:favorite_id, :id, autogenerate: true}

  schema "favorites" do
    field :user_id, :integer
    field :space_post_id, :integer
    field :space_id, :integer
    field :index, :integer
    has_one :space, OpenthinkBackend.Space, foreign_key: :space_id, references: :space_id
    has_one :space_post, OpenthinkBackend.SpacePost, foreign_key: :space_post_id, references: :space_post_id
    has_one :post, through: [:space_post, :post]
  end

  def changeset(connection, params \\ %{}) do
    connection
    |> cast(params, [:user_id, :space_post_id, :space_id])
    |> validate_required([:user_id])
  end

  def set_index_changeset(connection, params \\ %{}) do
    connection
    |> cast(params, [:index])
    |> validate_required([:index])
  end

end

defmodule OpenthinkBackend.SpacePost do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:space_post_id, :id, autogenerate: true}

  schema "space_posts" do
    field :space_id, :integer
    field :post_id, :integer
    field :deleted, :boolean
    field :pinned, :boolean
    field :index, :integer
    field :hidden, :boolean
    field :parent_post_id, :integer
    field :path, :string
    field :created_by, :integer
    field :deleted_at, :utc_datetime
    field :created_at, :utc_datetime
    has_one :space, OpenthinkBackend.Space, foreign_key: :space_id, references: :space_id
    has_one :post, OpenthinkBackend.Post, foreign_key: :post_id, references: :post_id
  end

  def changeset(space_post, params \\ %{}) do
    space_post
    |> cast(params, [:space_id, :post_id, :hidden, :index, :parent_post_id, :path, :created_by])
    |> validate_required([:created_by, :space_id, :post_id])
  end

  def delete_changeset(post, params \\ %{}) do
    post
    |> cast(params, [:deleted, :deleted_at])
    |> validate_required([:deleted, :deleted_at])
  end

  def update_path_changeset(post, params \\ %{}) do
    post
    |> cast(params, [:path, :parent_post_id])
    |> validate_required([:path, :parent_post_id])
  end

  def pin_changeset(post, params \\ %{}) do
    post
    |> cast(params, [:pinned])
    |> validate_required([:pinned])
  end
end

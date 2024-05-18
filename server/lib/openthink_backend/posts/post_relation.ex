defmodule OpenthinkBackend.PostRelation do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:relation_id, :id, autogenerate: true}

  schema "post_relations" do
    field :post1_id, :integer
    field :post2_id, :integer
    field :space_id, :integer
    field :index, :integer
    field :pinned, :boolean
    field :created_at, :utc_datetime
    field :user_id, :integer
    field :deleted, :boolean
  end

  def changeset(post_relation, params \\ %{}) do
    post_relation
    |> cast(params, [:post1_id, :post2_id, :space_id, :index, :user_id])
    |> validate_required([:post1_id, :post2_id, :user_id])
  end

  def delete_changeset(post_relation, params \\ %{}) do
    post_relation
    |> cast(params, [:deleted])
    |> validate_required([:deleted])
  end

  def pin_changeset(post_relation, params \\ %{}) do
    post_relation
    |> cast(params, [:pinned])
    |> validate_required([:pinned])
  end
end

defmodule OpenthinkBackend.PostUser do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:post_user_id, :id, autogenerate: true}

  schema "post_users" do
    field :post_id, :integer
    field :user_id, :integer
    field :type, :string
    field :relations, :boolean
    field :edits, :boolean
    field :comments, :boolean
    has_one :user, OpenthinkBackend.User, foreign_key: :user_id, references: :user_id
  end

  def changeset(post_relation, params \\ %{}) do
    post_relation
    |> cast(params, [:post_id, :user_id, :type, :relations, :edits, :comments])
    |> validate_required([:post_id, :user_id, :type])
  end

  def update_changeset(post_relation, params \\ %{}) do
    post_relation
    |> cast(params, [:type, :relations, :edits, :comments])
  end
end

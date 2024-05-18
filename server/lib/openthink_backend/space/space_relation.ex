defmodule OpenthinkBackend.SpaceRelation do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:space_relation_id, :id, autogenerate: true}

  schema "space_relations" do
    field :space1_id, :integer
    field :space2_id, :integer
    field :accepted, :boolean
    field :request, :boolean
    has_one :space1, OpenthinkBackend.Space, references: :space1_id, foreign_key: :space_id
    has_one :space2, OpenthinkBackend.Space, references: :space2_id, foreign_key: :space_id
  end

  def changeset(space_relation, params \\ %{}) do
    space_relation
    |> cast(params, [:space1_id, :space2_id, :accepted, :request])
    |> validate_required([:space1_id, :space2_id])
  end
end

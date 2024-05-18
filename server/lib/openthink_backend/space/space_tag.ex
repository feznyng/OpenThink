defmodule OpenthinkBackend.SpaceTag do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:space_tag_id, :id, autogenerate: true}

  schema "space_tags" do
    field :space_id, :integer
    field :tag, :string
  end

  def changeset(space_tag, params \\ %{}) do
    space_tag
    |> cast(params, [:space_id, :tag])
    |> validate_required([:space_id, :tag])
  end
end

defmodule OpenthinkBackend.Tag do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:tag_id, :id, autogenerate: true}

  schema "tags" do
    field :info, :string
  end

  def changeset(tag, params \\ %{}) do
    tag
    |> cast(params, [:info])
    |> validate_required([:info])
  end
end

defmodule OpenthinkBackend.Skill do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:value, :string, []}
  schema "skills" do
  end

  def changeset(skill, params \\ %{}) do
    skill
    |> cast(params, [:value])
    |> validate_required([:value])
  end
end

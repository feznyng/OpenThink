defmodule OpenthinkBackend.UserSkill do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:user_skill_id, :id, autogenerate: true}

  schema "user_skills" do
    field :user_id, :integer
    field :skill, :string
  end

  def changeset(user_tag, params \\ %{}) do
    user_tag
    |> cast(params, [:user_id, :skill])
    |> validate_required([:user_id, :skill])
  end
end

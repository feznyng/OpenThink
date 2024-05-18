defmodule OpenthinkBackend.UserTag do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:user_tag_id, :id, autogenerate: true}

  schema "user_tags" do
    field :user_id, :integer
    field :tag, :string
  end

  def changeset(user_tag, params \\ %{}) do
    user_tag
    |> cast(params, [:user_id, :tag])
    |> validate_required([:user_id, :tag])
  end
end

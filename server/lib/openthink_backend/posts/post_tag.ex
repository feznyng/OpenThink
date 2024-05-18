defmodule OpenthinkBackend.PostTag do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:post_tag_id, :id, autogenerate: true}

  schema "post_tags" do
    field :post_id, :integer
    field :tag, :string
    field :post_count, :integer, virtual: true
    field :pinned, :boolean, virtual: true
  end

  def changeset(post_tag, params \\ %{}) do
    post_tag
    |> cast(params, [:post_id, :tag])
    |> validate_required([:post_id, :tag])
  end
end

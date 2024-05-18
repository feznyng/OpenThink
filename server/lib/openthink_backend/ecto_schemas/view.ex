defmodule OpenthinkBackend.View do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:view_id, :id, autogenerate: true}

  schema "views" do
    field :name, :string
    field :entry_ids, {:array, :integer}
    field :group_ids, {:array, :string}
    field :post_id, :integer
    field :space_id, :integer
    field :purpose, :string
    field :default_view, :boolean
    field :type, :string
  end

  def changeset(view, params \\ %{}) do
    view
    |> cast(params, [:name, :purpose, :entry_ids, :type, :default_view, :group_ids, :space_id, :post_id])
  end
end

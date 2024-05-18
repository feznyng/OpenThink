defmodule OpenthinkBackend.Reaction do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:reaction_id, :id, autogenerate: true}
  schema "reactions" do
    field :emoji, :string
    field :unified, :string
    field :created_by, :integer
    field :message_id, :integer
    field :post_id, :integer
    field :space_id, :integer
    field :name, :string
    field :count, :integer, virtual: true
  end

  def post_reaction_changeset(reaction, params \\ %{}) do
    reaction
    |> cast(params, [:emoji, :unified, :post_id, :message_id, :created_by, :message_id, :post_id, :space_id, :name])
    |> validate_required([:created_by, :emoji, :name, :space_id])
  end
end

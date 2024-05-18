defmodule OpenthinkBackend.SpaceTopic do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:space_topic_id, :id, autogenerate: true}

  schema "space_topics" do
    field :space_id, :integer
    field :topic, :string
  end

  def changeset(space_topic, params \\ %{}) do
    space_topic
    |> cast(params, [:space_id, :topic])
    |> validate_required([:space_id, :topic])
  end
end

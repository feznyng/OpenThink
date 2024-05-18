defmodule OpenthinkBackend.UserTopic do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:user_topic_id, :id, autogenerate: true}

  schema "user_topics" do
    field :user_id, :integer
    field :topic, :string
  end

  def changeset(user_tag, params \\ %{}) do
    user_tag
    |> cast(params, [:user_id, :topic])
    |> validate_required([:user_id, :topic])
  end
end

defmodule OpenthinkBackend.PostVote do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:post_vote_id, :id, autogenerate: true}
  schema "post_votes" do
    field :post_id, :integer
    field :upvote, :boolean
    field :vote, :integer
    field :space_id, :integer
    field :user_id, :integer
  end

  def changeset(post_vote, params \\ %{}) do
    post_vote
    |> cast(params, [:post_id, :upvote, :space_id, :vote, :user_id])
    |> validate_required([:post_id, :upvote, :user_id, :vote])
  end
end

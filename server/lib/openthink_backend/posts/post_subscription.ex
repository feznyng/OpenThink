defmodule OpenthinkBackend.PostSubscription do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:post_subscription_id, :id, autogenerate: true}

  schema "post_subscriptions" do
    field :post_id, :integer
    field :user_id, :integer
    field :space_id, :integer
  end

  def changeset(post_relation, params \\ %{}) do
    post_relation
    |> cast(params, [:post_id, :user_id])
    |> validate_required([:post_id, :user_id])
  end
end

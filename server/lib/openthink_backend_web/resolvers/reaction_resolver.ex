defmodule OpenthinkBackendWeb.ReactionResolver do
  alias OpenthinkBackendWeb.ReactionQueries
  alias Absinthe.Relay.Connection
  require Logger

  def get_reaction_users(pagination_args, %{source: reaction}) do
    Absinthe.Resolution.Helpers.batch(
        {ReactionQueries, :get_reaction_users, pagination_args},
        reaction,
        fn batch_results ->
          Map.get(batch_results, reaction.emoji)
          |> Connection.from_list(pagination_args)
        end
      )
  end
end

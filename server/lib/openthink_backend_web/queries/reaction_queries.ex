defmodule OpenthinkBackendWeb.ReactionQueries do
  @moduledoc """
  Contains database queries to get various user information.
  """
  alias OpenthinkBackend.{Repo, Reaction}
  require Logger
  import Ecto.Query

  def get_reaction_users(args, reactions) do
    emojis = Enum.each(reactions, fn r -> r.emoji end)
    query = from r in Reaction,
    where: r.emoji in ^emojis
    if Enum.count(reactions) > 0 do
      first_reaction = Enum.at(reactions, 0)
      query = if is_nil(first_reaction.post_id) do
        message_ids = Enum.each(reactions, fn r -> r.message_id end)
        from r in query,
        where: r.message_id in ^message_ids
      else
        post_ids = Enum.each(reactions, fn r -> r.post_id end)
        from r in query,
        where: r.post_id in ^post_ids
      end
      query
      |> Repo.all
      |> Enum.reduce(
        %{},
        fn e, acc ->
          reactions = Map.get(acc, e.emoji, [])
          Map.put(acc, e.emoji, [e | reactions])
        end
      )
    else
      []
    end
  end


  def get_reaction_base do
    from r in Reaction,
    distinct: [r.emoji],
    select_merge: r,
    select_merge: %{count: over(count(r.reaction_id), :emoji)},
    windows: [emoji: [partition_by: r.emoji]]
  end

  def select_current_user(query, user_id) do
    if !is_nil(user_id) do
      from r in query,
      order_by: fragment("abs(?)", (r.created_by - ^user_id))
    else
      query
    end
  end
end

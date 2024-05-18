defmodule OpenthinkBackendWeb.Schema.ReactionTypes do
  use Absinthe.Schema.Notation
  require Logger
  use Absinthe.Relay.Schema.Notation, :modern
  import OpenthinkBackendWeb.ReactionResolver

  node object :reaction, id_fetcher: &reaction_id_fetcher/2 do
    field :emoji, :string
    field :unified, :string
    field :created_by, :integer
    field :reaction_id, :integer
    field :message_id, :integer
    field :post_id, :integer
    field :space_id, :integer
    field :name, :string
    field :count, :integer
    connection field :users, node_type: :user do
      resolve &get_reaction_users/2
    end
  end

  connection node_type: :reaction
  def reaction_id_fetcher(reaction, _expr) do
    if !!Map.get(reaction, :post_id) do
      to_string(reaction.post_id) <> to_string(reaction.emoji)
    else
      to_string(reaction.message_id) <> to_string(reaction.emoji)
    end
  end
end

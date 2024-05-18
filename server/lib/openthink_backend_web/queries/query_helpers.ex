defmodule OpenthinkBackendWeb.QueryHelpers do
  @moduledoc """
  Contains common query helpers.
  """
  alias OpenthinkBackend.Repo
  require Logger
  import Ecto.Query

  @doc """
  Given a map of basic parameters add and limit a select query.
  """
  def process_common_options(query, opts \\ %{}) do
    (Enum.reduce(opts, query, fn
      {:limit, limit}, query -> from a in query, limit: ^limit
      {:offset, offset}, query -> from a in query, offset: ^offset
      _, query -> query
    end))
  end
  def to_struct(attrs) do
    Enum.reduce Map.to_list(%{}), %{}, fn {k, _}, acc ->
      case Map.fetch(attrs, k) do
        {:ok, v} ->
          %{acc | k => v}
        :error -> acc
      end
    end
  end

  def prefix_search(term), do: String.replace(term, ~r/\W/u, "") <> ":*"

  @doc """
  Given a schema and item being reordered, update all requisite items
  """
  def reorder_elements(item_query, items_query, schema, old_index, new_index) do
    item = Repo.one(
      item_query
    )

    schema.set_index_changeset(item, %{index: nil})
    |> Repo.update

    if old_index > new_index do
      from(item in items_query, update: [inc: [index: 1]], where: item.index <= ^old_index and item.index >= ^new_index)
    else
      from(item in items_query, update: [inc: [index: -1]], where: item.index <= ^new_index and item.index >= ^old_index)
    end
    |> Repo.update_all([])


    schema.set_index_changeset(item, %{index: new_index})
    |> Repo.update
  end

end

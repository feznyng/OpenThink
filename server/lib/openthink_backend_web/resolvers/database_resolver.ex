defmodule OpenthinkBackendWeb.DatabaseResolver do
  require Logger
  alias OpenthinkBackendWeb.DatabaseQueries
  alias OpenthinkBackend.{View}
  import Ecto.Query

  def reorder_view_entries(
        _root,
        %{input: %{view_id: view_id, entry_id: entry_id, index: index}},
        %{context: %{user_id: _user_id}}
      ) do
    case from(v in View, where: v.view_id == ^view_id)
         |> DatabaseQueries.reorder_entry_ids(entry_id, index) do
      %{delete_entry: _update, insert_entry: {_num, view}} -> {:ok, view}
      _ -> {:error, "update failed"}
    end
  end

  def reorder_view_groups(
        _root,
        %{input: %{view_id: view_id, group_id: group_id, index: index}},
        %{context: %{user_id: _user_id}}
      ) do
    case from(v in View, where: v.view_id == ^view_id)
         |> DatabaseQueries.reorder_group_ids(group_id, index) do
      %{delete_group: _update, insert_group: {_num, view}} -> {:ok, view}
      _ -> {:error, "update failed"}
    end
  end

  def remove_entry(_root, %{input: %{view_id: view_id, entry_id: entry_id}}, %{
        context: %{user_id: _user_id}
      }) do
    {num, val} =
      from(v in View, where: v.view_id == ^view_id)
      |> DatabaseQueries.remove_entry_id(entry_id)

    if num == 0 do
      {:error, "unable to update view with that id"}
    else
      {:ok, Enum.at(val, 0)}
    end
  end

  def remove_group(_root, %{input: %{view_id: view_id, group_id: group_id}}, %{
        context: %{user_id: _user_id}
      }) do
    from(v in View, where: v.view_id == ^view_id)
    |> DatabaseQueries.remove_entry_id(group_id)
  end

  def create_view(_root, %{input: view}, %{context: %{user_id: _user_id}}) do
    DatabaseQueries.create_view(view)
  end
end

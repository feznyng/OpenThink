defmodule OpenthinkBackendWeb.DatabaseQueries do
  alias OpenthinkBackend.{SpacePost, Post, User, PostTag, View, Attribute, AttributeValue, Tag, Message, PostUser, PostRelation, Reaction, Repo, PostVote}
  alias OpenthinkBackendWeb.{QueryHelpers, DatabaseQueries}
  require Logger
  import Ecto.Query
  alias Ecto.Multi

  def reorder_entry_ids(query, entry_id, index) do
    if !!index do
      Multi.new()
      |> Multi.update_all(:delete_entry, from(v in query, update: [set: [entry_ids: fragment("array_remove(?, ?)", v.entry_ids, ^entry_id)]]), [])
      |> Multi.update_all(:insert_entry, from(v in query, select: v, update: [set: [entry_ids: fragment("?[:?] || ?::int[] || ?[(? + 1):]", v.entry_ids, ^index, [^entry_id], v.entry_ids, ^index)]]), [])
      |> Repo.transaction()
    else
      from(v in query,
      update: [set: [entry_ids: fragment("array_append(array_remove(?, ?), ?)", v.entry_ids, ^entry_id, ^entry_id)]])
      |> Repo.update_all([])
    end
  end


  def remove_entry_id(query, entry_id) do
    from(v in query,
    select: v,
    update: [set: [entry_ids: fragment("array_remove(?, ?)", v.entry_ids, ^entry_id)]])
    |> Repo.update_all([])
  end

  def add_entry_id(query, entry_id, index \\ nil) do
    if !!index do
      from(v in query, update: [set: [entry_ids: fragment("?[:?] || ?::int[] || ?[(? + 1):]", v.entry_ids, ^index, [^entry_id], v.entry_ids, ^index)]])
    else
      from(v in query,
      update: [set: [entry_ids: fragment("array_append(?, ?)", v.entry_ids, ^entry_id)]])
    end
    |> Repo.update_all([])
  end

  def add_group_id(query, group_id, index \\ nil) do
    if !!index do
      from(v in query, update: [set: [group_ids: fragment("?[:?] || ?::int[] || ?[(? + 1):]", v.group_ids, ^index, [^group_id], v.group_ids, ^index)]])
    else
      from(v in query,
      update: [set: [group_ids: fragment("array_append(?, ?)", v.group_ids, ^(to_string(group_id)))]])
    end
    |> Repo.update_all([])
  end

  def remove_group_id(query, group_id) do
    from(v in query,
    update: [set: [group_ids: fragment("array_remove(?, ?)", v.group_ids, ^(to_string(group_id)))]])
    |> Repo.update_all([])
  end



  def reorder_group_ids(query, group_id, index) do
    if !!index do
      Multi.new()
      |> Multi.update_all(:delete_group, from(v in query, update: [set: [group_ids: fragment("array_remove(?, ?)", v.group_ids, ^group_id)]]), [])
      |> Multi.update_all(:insert_group, from(v in query, select: v, update: [set: [group_ids: fragment("?[:?] || ?::text[] || ?[(? + 1):]", v.group_ids, ^index, [^group_id], v.group_ids, ^index)]]), [])
      |> Repo.transaction()
    else
      from(v in query,
      update: [set: [group_ids: fragment("array_append(array_remove(?, ?), ?)", v.group_ids, ^group_id, ^group_id)]])
      |> Repo.update_all([])
    end
  end

  def filter_purpose(query, opts) do
    purpose = Map.get(opts, :purpose)
    if !!purpose do
      from v in query,
      where: v.purpose in ^purpose
    else
      query
    end
  end

  def filter_default(query, opts) do
    default_view = Map.get(opts, :default_view)
    if !!default_view do
      from v in query,
      where: v.default_view
    else
      query
    end
  end

  def create_view(view) do
    %View{}
    |> View.changeset(view)
    |> Repo.insert
  end
end

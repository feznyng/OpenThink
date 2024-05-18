defmodule OpenthinkBackendWeb.TagResolver do
  require Logger
  alias OpenthinkBackendWeb.TagQueries
  alias OpenthinkBackend.Repo

  def get_topics(pagination_args, _res) do
    Absinthe.Relay.Connection.from_query(
      TagQueries.get_topics(pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_skills(pagination_args, _res) do
    Absinthe.Relay.Connection.from_query(
      TagQueries.get_skills(pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_tag_posts(pagination_args, _res) do
    Absinthe.Relay.Connection.from_query(
      TagQueries.get_tag_posts_query(pagination_args.tag, extract_space_id(pagination_args)),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_num_tag_posts(_root, args, _info) do
    {:ok, TagQueries.get_num_tag_posts(args.tag, extract_space_id(args))}
  end

  defp extract_space_id(args) do
    space_id = Map.get(args, :space_id)
    if !is_nil(space_id) && space_id >= 0 do space_id else nil end
  end

  def get_user_tag(_root, %{tag: tag}, %{context: %{user_id: user_id}}) do
    {:ok, TagQueries.get_user_tag(user_id, tag)}
  end

  def search_tags(pagination_args, _res) do
    Absinthe.Relay.Connection.from_query(
      TagQueries.search_tags(pagination_args.query),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_tags(pagination_args, _res) do
    Absinthe.Relay.Connection.from_query(
      TagQueries.get_tags,
      &Repo.all/1,
      pagination_args
    )
  end

  def toggle_subscribe_tag(_root, %{input: %{tag: tag}}, %{context: %{user_id: user_id}}) do
    TagQueries.toggle_subscribe_tag(user_id, tag)
  end

  def change_topics(_root, %{input: %{items: items}}, %{context: %{user_id: user_id}}) do
    {:ok, TagQueries.change_topics(user_id, items)}
  end

  def change_skills(_root, %{input: %{items: items}}, %{context: %{user_id: user_id}}) do
    TagQueries.change_skills(user_id, items)
    {:ok, TagQueries.change_topics(user_id, items)}
  end

end

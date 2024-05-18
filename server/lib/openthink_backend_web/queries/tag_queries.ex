defmodule OpenthinkBackendWeb.TagQueries do
  alias OpenthinkBackendWeb.{PostQueries, QueryHelpers}
  alias OpenthinkBackend.{Topic, Skill, Post, Tag, PostTag, UserSkill, UserTopic, SpacePost, UserTag}
  import Ecto.Query
  alias OpenthinkBackend.Repo
  require Logger
  def get_topics() do
    from t in Topic,
    select: t.value
  end

  def get_topics(%{query: query}) when byte_size(query) > 0 do
    term = QueryHelpers.prefix_search(query)
    from t in get_topics(),
    order_by: fragment("info <-> ?", ^term)
  end


  def get_topics(_) do
    get_topics()
  end

  def get_skills() do
    from s in Skill,
    select: s.value
  end

  def get_skills(%{query: query}) when byte_size(query) > 0 do
    term = QueryHelpers.prefix_search(query)
    from t in get_skills(),
    order_by: fragment("info <-> ?", ^term)
  end

  def get_skills(_) do
    get_skills()
  end

  def search_tags(query) do
    term = QueryHelpers.prefix_search(query)
    from t in get_tags(),
    order_by: fragment("info <-> ?", ^term)
  end

  def get_all_topic_values() do
    get_topics()
    |> Repo.all
  end

  def get_posts_by_tag(query, tag, space_id) do
    query = from p in query,
    right_join: pt in PostTag,
    on: p.post_id == pt.post_id,
    where: pt.tag == ^tag

    if (space_id) do
      from p in query,
      inner_join: sp in SpacePost,
      on: sp.post_id == p.post_id,
      where: sp.space_id == ^space_id
    else
      query
    end
  end

  def get_tag_posts_query(tag, space_id \\ nil) do
    from(p in PostQueries.get_post_base_query)
    |> get_posts_by_tag(tag, space_id)
  end

  def get_num_tag_posts(tag, space_id \\ nil) do
    from(p in Post)
    |> get_posts_by_tag(tag, space_id)
    |> select([p], count(p.post_id))
    |> Repo.one
  end

  def get_user_tags_query(user_id) do
    from ut in UserTag,
    where: ut.user_id == ^user_id
  end

  def get_user_tag(user_id, tag) do
    user_tag = from(ut in get_user_tags_query(user_id),
    where: ut.tag == ^tag)
    |> Repo.one


    if is_nil(user_tag) do
      %{user_id: user_id, tag: tag}
    else
      user_tag
    end
  end

  def get_tags do
    from t in Tag,
    select: t.info
  end

  def toggle_subscribe_tag(user_id, tag) do
    user_tag = Repo.one(
      from ut in UserTag,
      where: ut.user_id == ^user_id and ut.tag == ^tag
    )

    if is_nil(user_tag) do
      UserTag.changeset(%UserTag{}, %{user_id: user_id, tag: tag})
      |> Repo.insert
    else

      {:ok, tag} = Repo.delete(user_tag)
      {:ok, Map.put(tag, :user_tag_id, nil)}
    end
  end

  def change_skills(user_id, items) do
    from(us in UserSkill, where: us.user_id == ^user_id and us.skill not in ^items)
    |> Repo.delete_all

    {_num, entries} = Repo.insert_all(
      UserSkill,
      items |> Enum.map(fn item -> %{user_id: user_id, skill: item} end),
      on_conflict: :nothing,
      returning: true
    )
    entries
    |> Enum.map(fn %{skill: skill} -> skill end)
  end

  def change_topics(user_id, items) do
    from(us in UserTopic, where: us.user_id == ^user_id and us.topic not in ^items)
    |> Repo.delete_all

    {_num, entries} = Repo.insert_all(
      UserTopic,
      items |> Enum.map(fn item -> %{user_id: user_id, topic: item} end),
      on_conflict: :nothing,
      returning: true
    )
    entries
    |> Enum.map(fn %{topic: topic} -> topic end)

  end
end

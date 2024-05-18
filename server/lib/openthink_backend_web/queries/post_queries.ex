defmodule OpenthinkBackendWeb.PostQueries do
  @moduledoc """
  Contains database queries to get various user information.
  """
  alias OpenthinkBackend.{SpacePost, Post, User, PostTag, Filter, FilterGroup, Sort, Space, View, Attribute, AttributeValue, SpaceUser, Tag, Message, PostUser, PostRelation, Reaction, Repo, PostVote}
  alias OpenthinkBackendWeb.{ReactionQueries, MessageQueries, QueryHelpers, NotificationQueries, DatabaseQueries}
  require Logger
  import Ecto.Query
  alias NimbleCSV.RFC4180, as: CSV

  @post_user_types ["Assignee", "Requestee", "Invitee"]
  @user_facing_post_types ["Task", "Event", "Topic", "Goal", "Idea", "Folder", "Action", "Concern", "Wiki", "Group", "Link", "Information", "Media", "Poll", "Question", "Stream", "File", "Custom", "Database"]
  @all_post_types ["Task Section", "Wiki Section", "Folder", "Calendar"] ++ @user_facing_post_types


  def get_user_facing_post_types do
    @user_facing_post_types
  end

  def get_all_post_types do
    @all_post_types
  end

  def get_attribute_values(%{post_id: post_id}, post_ids) do
    from(av in AttributeValue,
      left_join: a in Attribute,
      on: a.attribute_id == av.attribute_id,
      where: a.post_id == ^post_id and av.post_id in ^post_ids
    )
    |> Repo.all
    |> Enum.reduce(
        %{},
        fn av, acc ->
          Map.put(acc, av.post_id, [av | Map.get(acc, av.post_id, [])])
        end
      )
  end

  def get_attribute_values(%{space_id: space_id}, post_ids) do
    from(av in AttributeValue,
      left_join: a in Attribute,
      on: a.attribute_id == av.attribute_id,
      where: a.space_id == ^space_id and av.post_id in ^post_ids
    )
    |> Repo.all
    |> Enum.reduce(
        %{},
        fn av, acc ->
          Map.put(acc, av.post_id, [av | Map.get(acc, av.post_id, [])])
        end
      )
  end
  def get_spaces(user_id, post_ids) do
    from(sp in SpacePost,
      preload: :space,
      left_join: su in SpaceUser,
      on: sp.space_id == su.space_id and su.user_id == ^user_id,
      where: sp.post_id in ^post_ids,
      order_by: su.space_user_id
    )
    |> Repo.all
    |> Enum.reduce(
        %{},
        fn s, acc ->
          post_id = s.post_id
          Map.put(acc, post_id, [s.space | Map.get(acc, post_id, [])])
        end
      )
  end

  def get_post_base_query(opts \\ %{}) do
    from(p in subquery(
      from p in Post,
      left_lateral_join: pv in subquery(
        from pv in PostVote,
        select: %{
          post_id: pv.post_id,
          vote_value: over(sum(pv.vote), :post),
          num_upvotes: count(pv.post_vote_id) |> filter(pv.vote > 0) |> over(:post),
          num_downvotes: count(pv.post_vote_id) |> filter(pv.vote < 0) |> over(:post)
        },
        windows: [post: [partition_by: pv.post_id]]
      ),
      on: p.post_id == pv.post_id,
      left_lateral_join: c in subquery(
        from c in Message,
        select: %{post_id: c.post_id, count: over(count(c.message_id), :post), },
        windows: [post: [partition_by: c.post_id]],
        where: not is_nil(c.post_id) and (c.deleted == false or is_nil(c.deleted))
      ),
      on: p.post_id == c.post_id,
      select_merge: p,
      select_merge: %{vote_value: pv.vote_value, num_upvotes: pv.num_upvotes, num_downvotes: pv.num_downvotes, num_comments: c.count},
      distinct: p.post_id
    ),
    preload: [:author, :attributes])
    |> filter_types(opts)
    |> filter_post_ids(opts)
    |> exclude_parent_types(opts)
  end

  def filter_post_ids(query, opts) do
    case Map.get(opts, :exclude_post_ids) do
      nil -> query
      post_ids -> from p in query, where: p.post_id not in ^post_ids
    end
  end

  def filter_types(query, opts) do
    filter_types = Map.get(opts, :filter_types)
    if !is_nil(filter_types) do
      # inner join to allow for space posts query to be passed in
      from p in query, inner_join: p2 in Post, on: p.post_id == p2.post_id, where: p2.type in ^filter_types
    else
      query
    end
  end


  def sort_posts_query(query, opts) do
    gravity = 1.8
    case Map.get(opts, :sort_by) do
      "New" -> from p in query, order_by: [desc: p.created_at]
      "Controversial" -> from p in query, order_by: fragment("abs(?)", p.vote_value)
      "Active" ->
        from p in query,
        distinct: p.post_id,
        left_join: c in subquery(
          from m in Message,
          distinct: m.post_id,
          order_by: [m.post_id, desc_nulls_last: m.created_at]
        ),
        on: p.post_id == c.post_id,
        left_join: pr in subquery(
          from pr in PostRelation,
          distinct: pr.post1_id,
          order_by: [pr.post1_id, desc_nulls_last: pr.created_at]
        ),
        on: p.post_id == pr.post1_id,
        order_by: [c.created_at, p.updated_at]
      "Trending" ->
        from p in query,
        order_by: [desc_nulls_last: p.vote_value / fragment("power(?, ?)", fragment("(EXTRACT(EPOCH FROM current_timestamp) - EXTRACT(EPOCH FROM ?))/3600", p.created_at) + 2, ^gravity)]
      "Best" ->  from p in query, order_by: [desc_nulls_last: p.vote_value, desc: p.created_at]
      _ -> query
    end
  end

  def get_post_by_id(post_id) do
    from(p in get_post_base_query(),
    where: p.post_id == ^post_id)
    |> Repo.one
  end

  def get_views(post_id, _opts \\ %{}) do
    from(v in View, where: v.post_id == ^post_id)
  end

  def get_related_posts(post_id, opts \\ %{}) do
    query = from(p in get_post_base_query(opts),
    inner_join: pr in PostRelation,
    on: pr.post2_id == p.post_id,
    select_merge: %{p | parent_relation: pr},
    where:
      pr.post1_id == ^post_id
      and p.type in ^@user_facing_post_types
      and (is_nil(p.deleted) or p.deleted == false)
      and (is_nil(pr.deleted) or pr.deleted == false),
      order_by: [desc: fragment("coalesce(?, false)", pr.pinned)]
    )
    |> sort_posts_query(opts)
    |> join_space_posts(opts)

    view_purpose = Map.get(opts, :view_purpose)
    if !view_purpose do
      query
    else
      from p in query,
      left_join: v in fragment(
      """
      select
      id::int,
      nr
      from
      views,
      unnest(entry_ids) WITH ORDINALITY a(id, nr)
      where
      purpose = ?
      and
      post_id = ?
      """, ^view_purpose, ^post_id),
      on: p.post_id == v.id,
      order_by: v.nr
    end
  end

  def join_space_posts(query, opts) do
    case Map.get(opts, :space_id) do
      nil -> query
      space_id ->
        from p in query,
        left_join: sp in SpacePost,
        on: (sp.post_id == p.post_id and sp.space_id == ^space_id) or sp.post_id == p.post_id,
        select_merge: %{p | space_post: sp}
    end
  end

  def get_num_related_posts(args, post_ids) do
    from(p in Post,
    distinct: true,
    inner_join: pr in PostRelation,
    on: pr.post2_id == p.post_id,
    select: %{post_id: pr.post1_id, post_count: over(count(pr.post2_id), :post)},
    windows: [post: [partition_by: pr.post1_id]],
    where: pr.post1_id in ^post_ids and (is_nil(p.deleted) or p.deleted == false) and (is_nil(pr.deleted) or pr.deleted == false) and p.type in @user_facing_post_types)
    |> filter_types(args)
    |> exclude_parent_types(args)
    |> filter_completed(args)
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn p, acc ->
        Map.put(acc, p.post_id, p.post_count)
      end
    )
  end

  defp filter_completed(query, args) do
    case Map.get(args, :completed) do
      nil -> query
      false -> from p in query, where: p.completed == false or is_nil(p.completed)
      true -> from p in query, where: p.completed == true
    end
  end

  def create_post(new_post, user_id) do
    case %Post{} |> Post.changeset(Map.put(new_post, :created_by, user_id)) |> Repo.insert do
      {:ok, post} ->
        locations = add_spaces(post.post_id, user_id, new_post.spaces)
        current_location = locations |> Enum.find(fn %{current: current} -> current end)
        if Map.has_key?(new_post, :tags) do
          add_tags(post.post_id, Map.get(new_post, :tags))
        end

        files = Map.get(new_post, :attachments)
        if !!files do
          Enum.each(files, fn file -> create_file(post.post_id, user_id, new_post.spaces, file) end)
        end
        case post.type do
          "Task" -> create_task(post.post_id, new_post, user_id)
          "Task Section" -> create_task_section(post.post_id, new_post)
          "Question" -> add_post_users(Map.get(new_post, :requestees), post.post_id, "Requestee", user_id)
          "Event" -> add_post_users(Map.get(new_post, :invitees), post.post_id, "Invitee", user_id)
          "Poll" -> new_post.poll |> Map.merge(%{poll: true, post_id: post.post_id}) |> create_attribute
          _ -> nil
        end

        post = from(p in get_post_base_query(),
        where: p.post_id == ^post.post_id)
        |> Repo.one
        {:ok, Map.merge(post, %{
          parent_relation: if !is_nil(current_location) do current_location.relation end,
          space_post: if !is_nil(current_location) do current_location.space_post end
        })}
      err -> err
    end
  end

  def create_file(parent_post_id, user_id, spaces, file) do
    {:ok, post} = %Post{}
    |> Post.changeset(%{
      created_by: user_id,
      link: file.link,
      title: file.title,
      body: file.description,
      subtype: file.type,
      type: "File",
      file_size: file.size,
      file_format: file.format
    })
    |> Repo.insert

    %{post_id: post_id} = post
    # create space post(s)
    spaces
    |> Enum.each(
      fn %{space_id: space_id} ->
        %SpacePost{}
        |> SpacePost.changeset(%{post_id: post_id, space_id: space_id, created_by: user_id})
        |> Repo.insert
      end
    )

    # create post relation post
    %PostRelation{}
    |> PostRelation.changeset(%{post1_id: parent_post_id, post2_id: post_id, user_id: user_id})
    |> Repo.insert

    post
  end

  def create_task_section(post_id, new_post) do
    # create section for task
    %View{}
    |> View.changeset(%{post_id: post_id, purpose: "Task", default_view: true})
    |> Repo.insert

    # add section to space views
    space_ids = Enum.map(new_post.spaces, fn space -> space.space_id end)

    from(v in View, where: v.space_id in ^space_ids)
    |> DatabaseQueries.add_group_id(to_string(post_id))
  end

  def create_task(post_id, new_post, user_id) do
    add_post_users(Map.get(new_post, :assignees), post_id, "Assignee", user_id)
    %View{}
    |> View.changeset(%{post_id: post_id, purpose: "Task", default_view: true})
    |> Repo.insert

    Enum.each(
      new_post.spaces,
      fn space ->
        parent_post_id = Map.get(space, :parent_post_id)
        index = Map.get(space, :index)
        if parent_post_id do
          parent_post = Repo.get(Post, parent_post_id)
          if parent_post.type == "Task Section" or parent_post.type == "Task" do
            from v in View, where: v.post_id == ^parent_post_id and v.default_view and v.purpose == "Task"
          else
            from v in View, where: v.space_id == ^space.space_id
          end
        else
          from v in View, where: v.space_id == ^space.space_id
        end
        |> DatabaseQueries.add_entry_id(post_id, index)
      end
    )
  end

  def add_tags(post_id, tags) do
    if !is_nil(tags) do
      Enum.each(
        tags,
        fn tag ->
          %Tag{}
          |> Tag.changeset(%{info: tag})
          |> Repo.insert(on_conflict: :nothing)

          %PostTag{}
          |> PostTag.changeset(%{tag: tag, post_id: post_id})
          |> Repo.insert(on_conflict: :nothing)
        end
      )
    end
  end


  def create_attribute(attribute) do
    %Attribute{}
    |> Attribute.changeset(attribute)
    |> Repo.insert
  end


  def create_attribute(attribute, unique: true) do
    existing_attr = cond do
      !is_nil(Map.get(attribute, :post_id)) ->
        from a in Attribute, where: a.post_id == ^attribute.post_id and a.name == ^attribute.name, limit: 1
      !is_nil(Map.get(attribute, :space_id)) ->
        from a in Attribute, where: a.space_id == ^attribute.space_id and a.name == ^attribute.name, limit: 1
      true -> from a in Attribute
    end
    |> Repo.one

    if is_nil(existing_attr) do
      create_attribute(attribute)
    else
      {:ok, existing_attr}
    end
  end

  def add_post_users(user_ids, post_id, type, user_id) do
    if !is_nil(user_ids) do
      Enum.each(
        user_ids,
        fn user_id ->
          %PostUser{}
          |> PostUser.changeset(%{user_id: user_id, post_id: post_id, type: type})
          |> Repo.insert(on_conflict: :nothing)
        end
      )
      user_ids
      |> Enum.map(fn id -> %{user_id: id} end)
      |> NotificationQueries.spawn_notification_generation(%{type: "post invite", post_id: post_id, post_user_type: type}, user_id)
    end
  end

  def add_spaces(post_id, user_id, spaces) do
    space_ids = Enum.map(spaces, fn %{space_id: space_id} -> space_id end)

    from(su in SpaceUser,
    where: su.space_id in ^space_ids)
    |> Repo.all
    |> NotificationQueries.spawn_notification_generation(%{type: "space new post", post_id: post_id}, user_id)

    Enum.map(
      spaces,
      fn space ->
        parent_post_id = Map.get(space, :parent_post_id)
        space_id = Map.get(space, :space_id)

        location = if !is_nil(parent_post_id) do
          parent_space_post = from(sp in SpacePost,
          where: sp.post_id == ^parent_post_id and sp.space_id == ^space_id,
          limit: 1)
          |> Repo.one

          if !is_nil(parent_space_post) do
            {:ok, relation} = %PostRelation{}
            |> PostRelation.changeset(%{post1_id: parent_post_id, post2_id: post_id, space_id: space_id, user_id: user_id})
            |> Repo.insert(on_conflict: :nothing)
            path = Map.get(parent_space_post, :path)
            path = if is_nil(path) or String.length(path) == 0 do
              "#{parent_post_id}"
            else
              path <> ".#{parent_post_id}"
            end
            %{
              path: path,
              relation: relation
            }
          else
            %{path: "", relation: nil}
          end
        else
          %{path: "", relation: nil}
        end

        {:ok, val} = %SpacePost{}
        |> SpacePost.changeset(%{space_id: space_id, parent_post_id: parent_post_id, created_by: user_id, post_id: post_id} |> Map.merge(location))
        |> Repo.insert(on_conflict: :nothing)

        Map.merge(location, %{space_post: val, current: !!Map.get(space, :current)})
      end
    )
  end

  def update_post_main(edited_post) do
    edited_post_fields = %Post{}
    |> Post.update_changeset(edited_post)
    |> Map.get(:changes)
    |> Keyword.new
    from(p in Post, where: p.post_id == ^edited_post.post_id, select: p, update: [set: ^edited_post_fields])
    |> Repo.update_all([])
  end

  def delete_post_relations(post_ids) do
    from(pr in PostRelation, where: pr.post1_id in ^post_ids, update: [set: [deleted: true]])
    |> Repo.update_all([])
  end

  def update_attribute(attr, updated_attribute) do
    attr
    |> Attribute.changeset(updated_attribute)
    |> Repo.update
  end

  def update_post(edited_post, user_id) do
    post = Repo.get(Post, edited_post.post_id)
    if !!Map.get(edited_post, :tags) do
      from(pt in PostTag, where: pt.post_id == ^post.post_id) |> Repo.delete_all
      add_tags(post.post_id, edited_post.tags)
    end


    update_post_users_by_type(post, edited_post, user_id)

    if edited_post.type == "Poll" and !!Map.get(edited_post, :poll) do
      existing_poll = from(a in Attribute, where: a.post_id == ^edited_post.post_id and a.poll)
      |> Repo.one
      if !!existing_poll do
        update_attribute(existing_poll, Map.get(edited_post, :poll))
      end
    end

    {num, _} = update_post_main(edited_post)



    existing_space_ids = from(sp in SpacePost,
      where: sp.post_id == ^post.post_id,
      select: sp.space_id
    )
    |> Repo.all


    spaces = Map.get(edited_post, :spaces)
    if !is_nil(spaces) do
      space_post_ids_to_delete = existing_space_ids -- Enum.map(spaces, fn sp -> sp.space_id end)

      from(
        sp in SpacePost,
        where: sp.space_id in ^space_post_ids_to_delete and sp.post_id == ^post.post_id
      )
      |> Repo.delete_all

      add_spaces(post.post_id, post.created_by, spaces)
    end


    if !!Map.get(edited_post, :attachments) do
      remaining_file_ids = edited_post.attachments |> Enum.filter(fn file -> !!Map.get(file, :post_id) end) |> Enum.map(fn %{post_id: id} -> id end)
      from(
        p in Post,
        where: p.post_id not in ^remaining_file_ids and p.type == "File" and p.post_id in subquery(
          from pr in PostRelation,
          select: pr.post2_id,
          where: pr.post1_id == ^post.post_id
        )
      )
      |> Repo.delete_all

      edited_post.attachments
      |> Enum.filter(fn file -> !Map.get(file, :post_id) end)
      |> Enum.each(fn file ->
          create_file(
            post.post_id,
            post.created_by,
            existing_space_ids |> Enum.map(fn id -> %{space_id: id} end),
            file
          )
        end
      )
    end

    tags = Map.get(edited_post, :tags)

    if !!tags do
      from(pt in PostTag, where: pt.tag not in ^tags)
      |> Repo.delete_all

      Repo.insert_all(PostTag, tags |> Enum.map(fn tag -> %{post_id: post.post_id, tag: tag} end), on_conflict: :nothing)
    end


    if num > 0 do

      query = from p in get_post_base_query(),
      where: p.post_id == ^edited_post.post_id

      space_id = Map.get(edited_post, :space_id)

      query = if !!space_id do
        from p in query,
        left_join: sp in SpacePost,
        on: p.post_id == sp.post_id and sp.space_id == ^space_id,
        select: %{p | space_post: sp}
      else
        query
      end

      updated_post = query
      |> Repo.one

      from(ps in OpenthinkBackend.PostSubscription,
      where: ps.post_id == ^edited_post.post_id)
      |> Repo.all
      |> NotificationQueries.spawn_notification_generation(%{type:  "post edit", post_id: edited_post.post_id}, user_id)

      {:ok, updated_post}
    else
      {:error, "No post to update with that id"}
    end
  end

  def update_attributes(attributes) do
    attributes
    |> Enum.each(
      fn attr ->
        attr_list = Keyword.new(attr)
        from(u in Attribute, update: [set: ^attr_list])
        |> Repo.update_all([])
      end
    )
  end

  def update_attribute_values(attributes) do
    attributes
    |> Enum.each(
      fn attr ->
        attr_list = Keyword.new(attr)
        from(u in AttributeValue, update: [set: ^attr_list])
      end
    )
  end

  def update_post_users_by_type(post, edited_post, user_id) do
    case post.type do
      "Task" -> update_post_users_of_type(post, "Assignee", Map.get(edited_post, :assignees), user_id)
      "Event" -> update_post_users_of_type(post, "Invitee", Map.get(edited_post, :invitees), user_id)
      "Question" -> update_post_users_of_type(post, "Requestee", Map.get(edited_post, :requestees), user_id)
      _ -> nil
    end
  end

  def update_post_users_of_type(post, type, new_user_ids, user_id) do
    if !is_nil(new_user_ids) do
      post_user_ids = from(pu in PostUser,
        where: pu.post_id == ^post.post_id and pu.type == ^type,
        select: pu.user_id
      )
      |> Repo.all

      post_user_ids_to_delete = post_user_ids -- new_user_ids

      from(
        pu in PostUser,
        where: pu.user_id in ^post_user_ids_to_delete and pu.post_id == ^post.post_id and pu.type == ^type
      )
      |> Repo.delete_all
      add_post_users(new_user_ids, post.post_id, type, user_id)
    end
  end

  def delete_post(post_id) do
    query = from(v in View,
      where: v.space_id in subquery(
          from sp in SpacePost,
          select: sp.space_id,
          where: sp.post_id == ^post_id
        )
        or v.post_id in subquery(
          from pr in PostRelation,
          select: pr.post1_id,
          where: pr.post2_id == ^post_id
        )
    )

    Repo.transaction(
      fn ->
        query |> DatabaseQueries.remove_entry_id(post_id)
        query |> DatabaseQueries.remove_group_id(post_id)

        Repo.get(Post, post_id)
        |> Post.delete_changeset(%{deleted: true, deleted_at: DateTime.utc_now})
        |> Repo.update
      end
    )
  end

  def batch_delete_post(post_ids) do
    deleted_at = DateTime.utc_now
    {_, entries} = from(p in Post, where: p.post_id in (^post_ids), select: p, update: [set: [deleted: true, deleted_at: ^deleted_at]])
    |> Repo.update_all([])

    {:ok, entries}
  end

  def reorder_related_post_of_type(space_id, post_id, relation_id, type, old_index, new_index) do
    QueryHelpers.reorder_elements(
      from(
        pr in PostRelation,
        where: pr.relation_id == ^relation_id
      ),
      from(
        pr in PostRelation,
        left_join: p in Post,
        on: p.post_id == pr.post2_id,
        where: pr.post1_id == ^post_id and pr.space_id == ^space_id and p.type == ^type
      ),
      Post,
      old_index,
      new_index
    )
  end

  def reorder_space_post_of_type(post_id, space_id, type, old_index, new_index) do
    QueryHelpers.reorder_elements(
      from(
        sp in SpacePost,
        where: sp.post_id == ^post_id and sp.space_id == ^space_id
      ),
      from(
        sp in SpacePost,
        left_join: p in Post,
        on: p.post_id == sp.post_id,
        where: p.type == ^type and sp.space_id == ^space_id
      ),
      SpacePost,
      old_index,
      new_index
    )
  end

  def get_comments(post_id) do
    from(m in Message,
    distinct: m.message_id,
    where: m.post_id == ^post_id and is_nil(m.replying_to),
    preload: [:user])
    |> MessageQueries.filter_deleted_comments
  end

  def get_reactions(%{user_id: user_id}, post_ids) do
    from(r in ReactionQueries.get_reaction_base,
    where: r.post_id in ^post_ids)
    |> ReactionQueries.select_current_user(user_id)
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn pv, acc ->
        Map.put(acc, pv.post_id, [pv | Map.get(acc, pv.post_id, [])])
      end
    )
  end

  def get_tags(_, post_ids) do
    Repo.all(
      from r in PostTag,
      where: r.post_id in ^post_ids
    )
    |> Enum.reduce(
      %{},
      fn pv, acc ->
        Map.put(acc, pv.post_id, [pv | Map.get(acc, pv.post_id, [])])
      end
    )
  end

  def get_my_vote(user_id, post_ids) do
    Repo.all(
      from r in PostVote,
      where: r.user_id == ^user_id and r.post_id in ^post_ids
    )
    |> Enum.reduce(
      %{},
      fn r, acc ->
        Map.put(acc, r.post_id, r)
      end
    )
  end

  def change_post_vote(user_id, post_id, space_id, upvote) do
    curr_vote = Repo.one(
      from pv in PostVote,
      where: pv.user_id == ^user_id and pv.post_id == ^post_id
    )

    new_vote = %{
      user_id: user_id,
      post_id: post_id,
      space_id: space_id,
      upvote: upvote,
      vote: if upvote do 1 else -1 end,
    }

    if is_nil(curr_vote) do
      %PostVote{}
      |> PostVote.changeset(new_vote)
      |> Repo.insert
    else
      curr_vote
      |> PostVote.changeset(new_vote)
      |> Repo.update
    end
  end

  def delete_post_vote(post_vote_id) do
    case Repo.get(PostVote, post_vote_id) do
      nil -> {:error, "Already removed post vote"}
      post_vote -> Repo.delete(post_vote)
    end
  end

  def add_reaction(user_id, id, space_id, name, emoji, type \\ "Post") do
    new_reaction = %{created_by: user_id, space_id: space_id, name: name, emoji: emoji}

    new_reaction = if type == "Post" do
      new_reaction |> Map.put(:post_id, id)
    else
      new_reaction |> Map.put(:message_id, id)
    end

    %Reaction{}
    |> Reaction.post_reaction_changeset(new_reaction)
    |> Repo.insert(on_conflict: :nothing)
  end

  def delete_reaction(reaction_id) do
    Reaction
    |> Repo.get(reaction_id)
    |> Repo.delete
  end

  def get_users(%{user_types: user_types}, post_ids) do
    types = if !is_nil(user_types) do
      user_types
    else
      @post_user_types
    end
    Repo.all(
      from u in User,
      inner_join: pu in PostUser,
      on: pu.user_id == u.user_id,
      where: pu.post_id in ^post_ids and (is_nil(pu.type) or pu.type in ^types),
      preload: [post_user: pu]
    )
    |> Enum.reduce(
      %{},
      fn a, acc ->
        Map.put(acc, a.post_user.post_id, [a | Map.get(acc, a.post_user.post_id, [])])
      end
    )
  end



  def exclude_deleted(query) do
    from i in query,
    where: not i.deleted
  end

  def filter_hierarchy(query, opts) do
    if !!Map.get(opts, :hierarchy) do
      from p in query,
      inner_join: sp in SpacePost,
      on: sp.post_id == p.post_id,
      where: is_nil(sp.parent_post_id)
    else
      query
    end
  end

  def exclude_parent_types(query, opts) do
    exclude_parent_types = Map.get(opts, :exclude_parent_types)
    if !!exclude_parent_types do
      from p in query,
      where: p.post_id not in subquery(
        from p in Post,
        select: p.post_id,
        inner_join: pr in PostRelation,
        on: pr.post2_id == p.post_id,
        inner_join: par in Post,
        on: par.post_id == pr.post1_id,
        where: par.type in ^exclude_parent_types
        and (par.deleted == false or is_nil(par.deleted))
        and (pr.deleted == false or is_nil(pr.deleted))
      )
    else
      query
    end
  end

  def order_by_space_view_purpose(query, space_id, opts) do
    if !!Map.get(opts, :view_purpose) do
      from p in query,
      left_join: v in fragment(
      """
      select
      id::int,
      nr
      from
      views,
      unnest(entry_ids) WITH ORDINALITY a(id, nr)
      where
      purpose = ?
      and
      space_id = ?
      """, ^Map.get(opts, :view_purpose), ^space_id),
      on: p.post_id == v.id,
      order_by: v.nr
    else
      query
    end
  end

  def get_poll(user_id, post_ids) do
    from(a in Attribute,
    left_lateral_join: av in subquery(
      from av in subquery(
        from av in AttributeValue,
        select: %{
          attribute_id: av.attribute_id,
          post_id: av.post_id,
          created_by: av.created_by,
          attribute_value_id: av.attribute_value_id,
          value: fragment("unnest(?)", av.multi_text_value)
        }
      ),
      distinct: [av.value, av.attribute_id],
      select: %{
        value: av.value,
        attribute_id: av.attribute_id,
        votes: over(count(av.attribute_value_id), :attribute_value),
        total: over(count(av.attribute_value_id), :attribute)
      },
      windows: [attribute_value: [partition_by: [av.attribute_id, av.value]], attribute: [partition_by: [av.attribute_id]]]
    ),
    on: av.attribute_id == a.attribute_id,
    left_join: mv in subquery(
      from av in AttributeValue,
      select: %{
        value: av.text_value,
        values: av.multi_text_value,
        attribute_id: av.attribute_id
      },
      where: av.created_by == ^user_id
    ),
    on: mv.attribute_id == a.attribute_id,
    select: %{
      attribute: a,
      selected_option: mv.value,
      selected_options: mv.values,
      total: av.total,
      options: fragment(
        """
        json_agg(json_build_object(
          'votes', ?,
          'value', ?
        ))
        """, av.votes, av.value)
    },
    where: a.post_id in ^post_ids and a.poll,
    group_by: [a.attribute_id, av.total, mv.value, mv.values]
    )
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn poll, acc ->
        options = poll.options
        |> Enum.map(
          fn option ->
            option
            |> Map.new(fn {k, v} -> {String.to_atom(k), v} end)
          end
        )
        Map.put(acc, poll.attribute.post_id, Map.put(poll, :options, options))
      end
    )
  end

  def create_relation(post1_id, post2_id, user_id, space_id, opts \\ %{}) do
    opts = Keyword.new(opts)
    case Repo.transaction(fn ->
      view_id = Keyword.get(opts, :view_id)
      index = Keyword.get(opts, :index)
      if !!view_id && !!index do
        from(v in View,
        where: v.view_id == ^view_id)
        |> DatabaseQueries.add_entry_id(post2_id, index)
        from(v in View,
        where: v.view_id != ^view_id and v.post_id == ^post1_id)
      else
        from(v in View,
        where: v.post_id == ^post1_id)
      end
      |> DatabaseQueries.add_entry_id(post1_id) # add to all other views that belong to the parent post
      if !!space_id do
        parent_space_post = Repo.one(
          from sp in SpacePost,
          where: sp.post_id == ^post1_id and sp.space_id == ^space_id,
          limit: 1
        )
        if !!parent_space_post do
          path = if is_nil(parent_space_post.path) do "" else parent_space_post.path <> "." end
          location = %{parent_post_id: post1_id, path: path <> to_string(parent_space_post.parent_post_id)}
          %SpacePost{}
          |> SpacePost.changeset(%{space_id: space_id, created_by: user_id, post_id: post2_id} |> Map.merge(location))
          |> Repo.insert(on_conflict: :nothing)
        end
      end
      %PostRelation{}
      |> PostRelation.changeset(%{post1_id: post1_id, post2_id: post2_id, user_id: user_id, space_id: space_id})
      |> Repo.insert(on_conflict: [set: [deleted: false]], conflict_target: [:post1_id, :post2_id, :space_id])
    end) do
      {:ok, relation} ->
        from(ps in OpenthinkBackend.PostSubscription, where: ps.post_id == ^post1_id)
        |> Repo.all
        |> NotificationQueries.spawn_notification_generation(%{type: "post new post", space_id: space_id, post_id: post1_id, post2_id: post2_id}, user_id)

        relation
      val -> val
    end
  end

  def delete_relation(relation_id) do
    case Repo.transaction(fn ->
      relation = Repo.get(PostRelation, relation_id)
      if !!relation do
        if relation.post1_id do
          from(v in View, where: v.post_id == ^relation.post1_id)
          |> DatabaseQueries.remove_entry_id(relation.post2_id)
        end
        relation
        |> PostRelation.delete_changeset(%{deleted: true})
        |> Repo.update
      else
        {:error, "Relation to delete not found"}
      end
    end) do
      {:ok, val} -> val
      {_, error} -> error
    end
  end


  def get_path(post_id, space_id, opts) do
    path = from(sp in SpacePost, where: sp.post_id == ^post_id and sp.space_id == ^space_id, select: sp.path, limit: 1)
    |> Repo.one()

    if is_nil(path) do
      from(p in Post, where: is_nil(p.post_id))
    else
      post_ids = String.split(path, ".")
      |> Enum.map(fn id -> with {num, _} <- Integer.parse(id) do num end end)

      case Map.get(opts, :reverse) do
        true -> from(p in Post,
        inner_join: v in fragment(
        """
        select
        id::int,
        nr
        from
        unnest(?::int[]) WITH ORDINALITY a(id, nr)
        """, ^post_ids),
        on: p.post_id == v.id,
        order_by: [desc: v.nr])
        _ -> from(p in Post,
        inner_join: v in fragment(
        """
        select
        id::int,
        nr
        from
        unnest(?::int[]) WITH ORDINALITY a(id, nr)
        """, ^post_ids),
        on: p.post_id == v.id,
        order_by: v.nr)
      end
    end
  end

  def vote_post(post_id, attribute_id, type, value, user_id) do
    # get attribute value based on post_id and user_id
    av = Repo.one(
      from av in AttributeValue,
      inner_join: a in Attribute,
      on: a.attribute_id == av.attribute_id,
      where: a.post_id == ^post_id and a.poll and av.created_by == ^user_id
    )

    if is_nil(av) do
      # if none exists create one
      %AttributeValue{}
      |> AttributeValue.changeset(%{attribute_id: attribute_id, multi_text_value: [value], created_by: user_id})
      |> Repo.insert
    else
      if type == "Multi-select" do
        if Enum.member?(av.multi_text_value, value) do
          # remove it
          av
          |> AttributeValue.changeset(%{multi_text_value: Enum.filter(av.multi_text_value, fn val -> val != value end)})
        else
          # add it
          av
          |> AttributeValue.changeset(%{multi_text_value: [value | av.multi_text_value]})
        end
      else
        if Enum.member?(av.multi_text_value, value) do
          # remove it
          av
          |> AttributeValue.changeset(%{multi_text_value: []})
        else
          # add it
          av
          |> AttributeValue.changeset(%{multi_text_value: [value]})
        end
      end
      |> Repo.update
    end
  end

  @event_user_types ["Invitee", "Going", "Not Going", "Maybe", "RSVP"]

  def get_event_user_types do @event_user_types end

  def get_invite(user_id, post_ids) do
    types = @event_user_types
    from(
      pu in PostUser,
      where: pu.user_id == ^user_id and pu.type in ^types and pu.post_id in ^post_ids
    )
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn pu, acc ->
        Map.put(acc, pu.post_id, pu)
      end
    )
  end

  def multi_complete_task(post_id, user_id, post_user \\ nil) do
    if is_nil(post_user) do
      %PostUser{}
      |> PostUser.changeset(%{post_id: post_id, user_id: user_id, type: "Completed"})
      |> Repo.insert
    else
      post_user
      |> Repo.delete
    end
  end

  @default_fields %{"label" => :title, "description" => :body, "type" => :type, "image" => :icon, "from" => :from, "to" => :to}

  def process_post_headers(headers, space_id, post_id) do
    headers
    |> Enum.map(
      fn element ->
        case Map.get(@default_fields, String.downcase(element)) do
          nil -> {:custom, %{type: "Text", name: element, space_id: space_id, post_id: post_id}}
          val -> {:default, val}
        end
      end
    )
  end

  def process_edge_headers(headers) do
    headers
    |> Enum.with_index
    |> Enum.reduce([], fn ({e, i}, acc) ->
      case String.downcase(e) do
        "from" -> [i, Enum.at(acc, 1)]
        "to" -> [Enum.at(acc, 0), i]
        _ -> acc
      end

    end)
  end

  def is_importing_edges(headers) do
    headers = headers |> Enum.map(fn col -> String.downcase(col) end)
    Enum.member?(headers, "from") && Enum.member?(headers, "to")
  end

  def import_post_file(user_id, file, space_id, post_id \\ nil) do
    space = Repo.get(Space, space_id)

    case String.split(file.filename, ".") |> Enum.at(1) do
      "csv" ->
        headers = file.path
        |> File.stream!
        |> CSV.parse_stream(skip_headers: false)
        |> Stream.take(1)
        |> Enum.to_list
        |> Enum.at(0)

        if is_importing_edges(headers) do # import edges
          [from_index, to_index] = headers |> process_edge_headers

          rows = file.path
          |> File.stream!
          |> CSV.parse_stream
          |> Stream.map(fn row ->
            from = Enum.at(row, from_index)
            to = Enum.at(row, to_index)
            %{from: from, to: to}
          end)
          |> Enum.to_list


          titles = rows
          |> Enum.reduce(MapSet.new(), fn (e, acc) ->
            acc
            |> MapSet.put(Map.get(e, :from))
            |> MapSet.put(Map.get(e, :to))
          end)
          |> MapSet.to_list

          query = from(p in Post,
          select: %{title: p.title, post_id: p.post_id},
          inner_join: sp in SpacePost,
          on: sp.space_id == ^space_id and sp.post_id == p.post_id,
          where: p.title in ^titles
          )

          query = if !!post_id do
            from p in query,
            inner_join: pr in PostRelation,
            on: pr.post1_id == ^post_id and pr.post2_id == p.post_id
          else
            query
          end

          post_map = query
          |> Repo.all
          |> Enum.reduce(%{}, fn (%{post_id: post_id, title: title}, acc) ->
            Map.put(acc, title, post_id)
          end)

          rows
          |> Enum.each(fn %{from: from, to: to} ->
            %PostRelation{}
            |> PostRelation.changeset(%{post1_id: Map.get(post_map, from), post2_id: Map.get(post_map, to), space_id: space_id, user_id: user_id})
            |> Repo.insert(on_conflict: :nothing)
          end)

        else # import nodes
          headers = headers
          |> process_post_headers(space_id, post_id)
          |> Enum.map(
            fn {type, attr} ->
              if type == :default do
                {type, attr}
              else
                {:ok, attr} = create_attribute(attr, unique: true)
                {type, attr}
              end
            end
          )

          post_type = case space.project_type do
            "Solidarity" -> "Group"
            _ -> "Custom"
          end

          posts = file.path
          |> File.stream!
          |> CSV.parse_stream
          |> Stream.map(
            fn row ->
              headers
              |> Enum.with_index(fn element, index -> {index, element} end)
              |> Enum.reduce(
                %{created_by: user_id, type: post_type},
                fn ({index, {type, attr}}, acc) ->
                  if type == :default do
                    Map.put(acc, attr, Enum.at(row, index))
                  else
                    Map.put(acc, :attributes, [%{text_value: Enum.at(row, index), attribute_id: attr.attribute_id} | Map.get(acc, :attributes, [])])
                  end
                end
              )
            end
          )
          |> Enum.to_list
          generate_posts_from_row(posts, space_id, user_id, post_id)
        end

        {:ok, "successful"}
      _ -> {:error, "unsupported file format"}
    end
  end

  def generate_posts_from_row(posts, space_id, user_id, post_id \\ nil) do
    titles = posts |> Enum.map(fn %{title: title} -> title end)

    query = from(
      p in Post,
      inner_join: sp in SpacePost,
      on: p.post_id == sp.post_id and sp.space_id == ^space_id,
      where: p.title in ^titles
    )

    query = if !post_id do
      query
    else
      from p in query,
      inner_join: pr in PostRelation,
      on: pr.post1_id == ^post_id and pr.post2_id == p.post_id
    end

    post_map_by_title = query
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn p, acc ->
        Map.put(acc, p.title, p)
      end
    )

    posts
    |> Enum.each(fn post ->
      existing_post = Map.get(post_map_by_title, post.title)

      val = if !!existing_post do
        existing_post
        |> Post.update_changeset(post)
        |> Repo.update
      else
        result = %Post{}
        |> Post.changeset(post)
        |> Repo.insert

        case result do
          {:ok, val} ->
            location = if !!post_id do
              %PostRelation{}
              |> PostRelation.changeset(%{post1_id: post_id, post2_id: val.post_id, space_id: space_id, user_id: user_id})
              |> Repo.insert
              %{parent_post_id: post_id, path: to_string(post_id)}
            else
              %{}
            end

            %SpacePost{}
            |> SpacePost.changeset(%{space_id: space_id, post_id: val.post_id, created_by: user_id} |> Map.merge(location))
            |> Repo.insert

          _ -> nil
        end

        result
      end


      case val do
        {:ok, created_post} ->
          from(av in AttributeValue, where: av.post_id == ^created_post.post_id) |> Repo.delete_all

          post.attributes
          |> Enum.each(fn attribute ->
            %AttributeValue{}
            |> AttributeValue.changeset(Map.merge(attribute, %{post_id: created_post.post_id}))
            |> Repo.insert
          end)
        _ ->
          {:error, "Could not create"}
      end
    end)
  end

  def rsvp_post(post_id, user_id, type) do
    types = @event_user_types
    rsvp = from(
      pu in PostUser,
      where: pu.user_id == ^user_id and pu.post_id == ^post_id and pu.type in ^types,
      limit: 1
    )
    |> Repo.one

    if is_nil(rsvp) do
      # create the rsvp
      %PostUser{}
      |> PostUser.changeset(%{post_id: post_id, user_id: user_id, type: type})
      |> Repo.insert(on_conflict: :nothing)

    else
      # update it
      rsvp
      |> PostUser.update_changeset(%{type: type})
      |> Repo.update
    end
  end

  def pin_related_post(%{relation_id: relation_id, pinned: pinned}) do
    Repo.get(PostRelation, relation_id)
    |> PostRelation.pin_changeset(%{pinned: pinned})
    |> Repo.update
  end

  def get_attachments(_, post_ids) do
    from(
      p in Post,
      inner_join: pr in PostRelation,
      on: pr.post2_id == p.post_id,
      where: p.type == "File",
      order_by: p.subtype,
      preload: [parent_relation: pr],
      where: pr.post1_id in ^post_ids
    )
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn file, acc ->
        post_id = file.parent_relation.post1_id
        Map.put(acc, post_id, [file | Map.get(acc, post_id, [])])
      end
    )
  end

  def get_space_referenced(_, post_ids) do
    Repo.all(
      from p in Post,
      inner_join: s in Space,
      on: s.space_id == p.space_referenced_id,
      where: p.post_id in ^post_ids,
      select: %{p | referenced_space: s}
    )
    |> Enum.reduce(
      %{},
      fn post, acc ->
        Map.put(acc, post.post_id, Map.get(post, :referenced_space))
      end
    )
  end

  def get_space_users(space_id, post_ids) do
    Repo.all(
      from p in Post,
      left_join: su in SpaceUser,
      on: su.space_id == ^space_id and su.user_id == p.created_by,
      where: p.post_id in ^post_ids,
      select: %{p | space_author: su}
    )
    |> Enum.reduce(
      %{},
      fn p, acc ->
        Map.put(acc, p.post_id, p.space_author)
      end
    )
  end

  def get_posts_space(space_id, post_ids) do
    Repo.all(
      from sp in SpacePost,
      where: sp.post_id in ^post_ids and sp.space_id == ^space_id
    )
    |> Enum.reduce(
      %{},
      fn sp, acc ->
        Map.put(acc, sp.post_id, sp)
      end
    )
  end


  def search_posts(search_term) do
    term = QueryHelpers.prefix_search(search_term)
    from p in get_post_base_query(),
    where: fragment(
      "title ilike ? or title % ?",
      ^(search_term <> "%"), ^term
    ),
    order_by: fragment("title <-> ?", ^term)
  end

  def get_subtree_query(post_id, opts) do
    path = "*." <> to_string(post_id) <> ".*"

    from(p in get_post_base_query(opts),
    where: p.post_id in subquery(
      from sp in SpacePost,
      select: sp.post_id,
      where: fragment("? ~ ?", sp.path, ^path) or sp.post_id == ^post_id
    ))
    |> filter_deleted
    |> exclude_parent(post_id, opts)
  end

  def exclude_parent(query, post_id, %{exclude_parent: true}) do
    from p in query,
    where: p.post_id != ^post_id
  end

  def exclude_parent(query, _post_id, _args) do
      query
  end

  def get_subtree(post_id, opts \\ %{}) do
    get_subtree_query(post_id, opts)
    |> apply_view(opts)
    |> Repo.all
  end


  def apply_view(query, %{view: view}) do
    all_filters = from(
      f in Filter,
      where: f.view_id == ^view.view_id,
      preload: [:attribute]
    )
    |> Repo.all

    standalone_filters = all_filters |> Enum.filter(fn %{filter_group_id: id} -> is_nil(id) end)
    group_filters = all_filters |> Enum.filter(fn %{filter_group_id: id} -> !is_nil(id) end)

    filter_groups = from(
      fg in FilterGroup,
      where: fg.view_id == ^view.view_id
    )
    |> Repo.all

    sorts = from(
      s in Sort,
      left_join: a in Attribute,
      on: a.attribute_id == s.attribute_id,
      where: s.view_id == ^view.view_id,
      preload: [attribute: a]
    )
    |> Repo.all

    query
    |> process_filters(standalone_filters)
    |> process_filter_groups(filter_groups, group_filters)
    |> process_sorts(sorts)
  end

  def apply_view(query, %{view_id: nil}) do
    query
  end

  def apply_view(query, %{view_id: view_id} = opts) do
    view = Repo.get(View, view_id)
    apply_view(query, opts |> Map.put(:view, view))
  end

  def apply_view(query, _) do
    query
  end

  def process_filters(query, _filters) do
    query
  end

  # map each attribute type to value
  def process_sorts(query, sorts) do
    Enum.reduce(sorts, query, fn (%{attribute_id: aid, attribute: a, ascending: asc}, query) ->
      case a.type do
        "Multi-select" ->
          query
        type ->
          case Map.get(AttributeValue.type_to_field, type) do
            nil -> query
            field ->
              direction = if asc do :asc else :desc end

              from p in query,
              left_join: av in AttributeValue,
              on: av.post_id == p.post_id and av.attribute_id == ^aid,
              order_by: {^direction, field(av, ^field)}
          end
      end
    end)
  end

  def process_filter_groups(query, _filter_groups, _group_filters) do
    query
  end

  def get_relations_query(post_ids, opts) do
    base = from pr in PostRelation
    if Keyword.get(opts, :both) do
      from pr in base,
      where: pr.post1_id in ^post_ids and pr.post2_id in ^post_ids
    else
      from pr in base,
      where: pr.post1_id in ^post_ids or pr.post2_id in ^post_ids
    end
  end

  def get_relations(post_ids, opts \\ []) do
    get_relations_query(post_ids, opts)
    |> Repo.all
  end

  def filter_deleted(query) do
    from p in query,
    where: is_nil(p.deleted) or p.deleted == false
  end
end

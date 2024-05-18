defmodule OpenthinkBackendWeb.SpaceQueries do
  @moduledoc """
  Contains database queries to get various user information.
  """
  alias OpenthinkBackend.{Space, Room, RoomUser, View, Attribute, InviteLink, User, PostTag, SpaceTag, Repo, SpaceTopic, SpaceUser, Post, PostRelation, SpaceRelation, SpacePost}
  alias OpenthinkBackendWeb.{QueryHelpers, PostQueries, DatabaseQueries, NotificationQueries}
  require Logger
  import Ecto.Query

  @doc """
  Gets all spaces
  """
  def get_all_spaces(opts) do
    query = from s in Space
    Repo.all(QueryHelpers.process_common_options(query, opts))
  end

  def get_space_post_space(_, space_ids) do
    from(
      s in Space,
      where: s.space_id in ^space_ids
    )
    |> Repo.all
    |> Enum.reduce(%{},
      fn space, acc ->
        Map.put(acc, space.space_id, space)
      end
    )
  end

  def get_all_projects() do
    from s in Space,
    where: s.project
  end

  def get_all_groups() do
    from s in Space,
    where: not s.project
  end

  def get_all_parent_groups() do
    from s in Space,
    where: not s.project and is_nil(s.parent_space_id)
  end

  def get_space_by_id(space_id) do
    Repo.one(
      from s in Space,
      where: s.space_id == ^space_id
    )
  end

  def recommended_groups(user_id) do
    get_spaces(user_id, %{member_of: false})
  end

  def get_spaces(user_id \\ nil, args \\ %{}) do
    from(s in Space, order_by: [s.project_type, s.space_type])
    |> filter_projects(args)
    |> filter_visible(user_id)
    |> member_of(user_id, args)
    |> match_causes(args)
    |> exclude_children(args)
    |> filter_visibility(args)
    |> filter_access(args)
    |> search_spaces(args)
    |> filter_by_parent(args)
  end

  def get_spaces_by_id(space_ids, user_id \\ nil, args \\ %{}) do
    from s in get_spaces(user_id, args),
    where: s.space_id in ^space_ids
  end

  def filter_has_location(query, args) do
    case Map.get(args, :has_location) do
      true -> from s in query, where: not is_nil(s.latitude) and not is_nil(s.longitude)
      _ -> query
    end
  end

  def member_of(query, user_id, args) do
    space_users_query = case Map.get(args, :accepted, true) do
      true ->
        from su in SpaceUser,
        where: su.user_id == ^user_id and su.accepted,
        select: su.space_id
      false ->
        from su in SpaceUser,
        where: su.user_id == ^user_id and is_nil(su.accepted) or su.accepted == false,
        select: su.space_id
    end

    case Map.get(args, :member_of) do
      true ->
        from s in query,
        where: s.space_id in subquery(space_users_query)
      false ->
        from s in query,
        where: s.space_id not in subquery(space_users_query)
      nil -> query
    end
  end

  def filter_visible(query, user_id) do
    from s in query,
    left_join: su in SpaceUser,
    on: su.space_id == s.space_id and su.user_id == ^user_id,
    where: s.type == "Public" or not is_nil(su.space_user_id)
  end


  def filter_by_parent(query, params) do
    case Map.get(params, :parent_space_id) do
      nil -> query
      space_id ->
        query = from s in query,
        select: s.space_id,
        left_join: sr in SpaceRelation,
        on: sr.space2_id == s.space_id,
        where: ((sr.space1_id == ^space_id and sr.accepted == true) or s.parent_space_id == ^space_id) and (is_nil(s.archived) or s.archived == false)

        from su in OpenthinkBackend.Space,
        where: su.space_id in subquery(query)
    end
  end

  def search_spaces(query, params) do
    case Map.get(params, :query) do
      nil -> query
      "" -> query
      search_text ->
        term = QueryHelpers.prefix_search(search_text)
        query = from s in query,
        where: fragment(
          "name ilike ? or (name || ' ' || description) % ? or (name) % ? or (description) % ?",
          ^(term <> "%"), ^term, ^term, ^term
        ),
        order_by: fragment("(name || ' ' || description) <-> ?", ^term)
        query
    end
  end

  def filter_projects(query, params) do
    case Map.get(params, :project) do
      true -> from s in query, where: s.project == true
      false -> from s in query, where: s.project == false or is_nil(s.project)
      _ -> query
    end
  end

  def filter_visibility(query, params) do
    visibility = Map.get(params, :visibility)
    if !!visibility do
      from s in query,
      where: s.type in ^visibility
    else
      query
    end
  end

  def filter_access(query, params) do
    access = Map.get(params, :access_type)
    if !!access do
      from s in query,
      where: s.type in ^access
    else
      query
    end
  end

  def exclude_children(query, params) do
    if !!Map.get(params, :exclude_children) do
      from s in query,
      where: is_nil(s.parent_space_id)
    else
      query
    end
  end

  def match_causes(query, args) do
    case Map.get(args, :causes) do
      nil -> query
      topics -> if is_list(topics) do
        from s in query,
        distinct: s.space_id,
        left_join: st in SpaceTopic,
        on: st.space_id == s.space_id,
        where: st.topic in ^topics,
        select: s
      else
        query
      end
    end

  end

  def get_space_user_by_id(user_id, space_id) do
    Repo.one(
      from su in SpaceUser,
      where: su.space_id == ^space_id and su.user_id == ^user_id
    )
  end

  def get_space_users(space_id, types, params) do
    case params do
      %{accepted_only: true} ->
        from u in User,
        inner_join: su in SpaceUser, on: u.user_id == su.user_id,
        where: su.space_id == ^space_id and su.type in ^types and su.accepted,
        preload: [space_user: su]
      %{unaccepted_only: true} ->
        from u in User,
        inner_join: su in SpaceUser, on: u.user_id == su.user_id,
        where: su.space_id == ^space_id and su.type in ^types and (su.accepted == false or is_nil(su.accepted)),
        preload: [space_user: su]
      _ ->
        from u in User,
        inner_join: su in SpaceUser, on: u.user_id == su.user_id,
        where: su.space_id == ^space_id and su.type in ^types,
        preload: [space_user: su]
    end
  end

  def get_num_space_users_query(space_id, types) do
    from su in SpaceUser,
    select: count(su.space_user_id),
    where: su.space_id == ^space_id and su.accepted and su.type in ^types
  end

  def get_num_members(space_id, _params) do
    get_num_space_users_query(space_id, ["Member"])
    |> Repo.one
  end
  def get_num_followers(space_id, _params) do
    get_num_space_users_query(space_id, ["Follower"])
    |> Repo.one
  end

  def get_num_moderators(space_id, _params) do
    get_num_space_users_query(space_id, ["Moderator", "Creator"])
    |> Repo.one
  end

  def get_num_invitees(space_id, _params) do
    from(su in SpaceUser,
    select: count(su.space_user_id),
    where: su.space_id == ^space_id and not su.accepted)
    |> Repo.one
  end

  def get_views(space_id, opts) do
    from(v in View,
      where: v.space_id == ^space_id
    )
    |> DatabaseQueries.filter_default(opts)
    |> DatabaseQueries.filter_purpose(opts)
  end

  def search_users(space_id, query) do
    term = QueryHelpers.prefix_search(query)
    space_users_subquery = from su in SpaceUser,
    select: su.user_id,
    where: su.space_id == ^space_id

    from u in User,
    where: fragment(
      "(firstname || ' ' || lastname) % ? or (firstname) % ? or (lastname) % ?",
      ^term, ^term, ^term
    ) and u.user_id in subquery(space_users_subquery),
    order_by: fragment("(firstname || ' ' || lastname) <-> ?", ^term),
    preload: [user: u]
  end

  def get_space_relations(space_id, _opts \\ %{}) do
    from pr in PostRelation,
    where: pr.space_id == ^space_id
  end


  def get_space_posts_query(space_id, opts \\ %{}) do
    from(
      p in PostQueries.get_post_base_query(opts),
      inner_join: sp in SpacePost,
      on: sp.post_id == p.post_id,
      select_merge: p,
      select_merge: %{
        space_post: sp
      },
      where: sp.space_id == ^space_id and (sp.deleted == false or is_nil(sp.deleted)),
      order_by: [desc: fragment("coalesce(?, false)", sp.pinned)]
    )
    |> PostQueries.exclude_deleted
    |> PostQueries.filter_hierarchy(opts)
    |> PostQueries.exclude_parent_types(opts)
    |> PostQueries.order_by_space_view_purpose(space_id, opts)
    |> PostQueries.sort_posts_query(opts)
    |> filter_default(opts)
  end

  def get_space_posts(space_id, opts \\ %{}) do
    get_space_posts_query(space_id, opts)
    |> Repo.all
  end

  def filter_default(query, opts) do
    if !Map.get(opts, :include_all_types) do
      from p in query, where: p.type in ^PostQueries.get_user_facing_post_types()
    else
      query
    end
  end

  def get_num_posts(opts, space_ids) do
    query = from(sp in SpacePost,
    left_join: p in Post, on: p.post_id == sp.post_id,
    where: sp.space_id in ^space_ids and (sp.deleted == false or is_nil(sp.deleted)) and (p.deleted == false or is_nil(p.deleted)))
    |> PostQueries.filter_hierarchy(opts)
    |> PostQueries.exclude_parent_types(opts)
    |> PostQueries.filter_types(opts)

    Repo.all(
      from sp in subquery(query),
      distinct: true,
      select: %{space_id: sp.space_id, post_count: over(count(sp.space_id), :space)},
      windows: [space: [partition_by: sp.space_id]]
    )
    |> Enum.reduce(
      %{},
      fn s, acc ->
        Map.put(acc, s.space_id, s.post_count)
      end
    )
  end

  def get_num_users(_, space_ids) do
    Repo.all(
      from su in SpaceUser,
      distinct: true,
      select: %{space_id: su.space_id, user_count: over(count(su.space_id), :space)},
      windows: [space: [partition_by: su.space_id]],
      where: su.space_id in ^space_ids
    )
    |> Enum.reduce(
      %{},
      fn s, acc ->
        Map.put(acc, s.space_id, s.user_count)
      end
    )
  end

  def get_space_favorite(_, space_ids) do
    Repo.all(
      from f in OpenthinkBackend.Favorite,
      where: f.space_id in ^space_ids
    )
    |> Enum.reduce(
      %{},
      fn f, acc ->
        Map.put(acc, f.space_id, true)
      end
    )
  end


  def get_num_subspaces(params, space_ids) do
    Repo.all(
      from s in get_spaces(params.user_id, params),
      distinct: s.space_id,
      select: %{parent_space_id: s.parent_space_id, space_count: over(count(s.parent_space_id), :space)},
      windows: [space: [partition_by: s.parent_space_id]],
      where: s.parent_space_id in ^space_ids and (is_nil(s.archived) or s.archived == false)
    )
    |> Enum.reduce(
      %{},
      fn s, acc ->
        Map.put(acc, s.parent_space_id, s.space_count)
      end
    )
  end

  def get_num_subgroups(_, space_ids) do
    Repo.all(
      from s in Space,
      distinct: s.space_id,
      select: %{parent_space_id: s.parent_space_id, subgroup_count: over(count(s.parent_space_id), :space)},
      windows: [space: [partition_by: s.parent_space_id]],
      where: s.parent_space_id in ^space_ids and (s.project == false or is_nil(s.project))
    )
    |> Enum.reduce(
      %{},
      fn s, acc ->
        Map.put(acc, s.parent_space_id, s.subgroup_count)
      end
    )
  end

  def get_num_projects(_, space_ids) do
    Repo.all(
      from s in Space,
      distinct: s.space_id,
      select: %{parent_space_id: s.parent_space_id, project_count: over(count(s.parent_space_id), :space)},
      windows: [space: [partition_by: s.parent_space_id]],
      where: s.parent_space_id in ^space_ids and s.project and (is_nil(s.archived) or s.archived == false)
    )
    |> Enum.reduce(
      %{},
      fn s, acc ->
        Map.put(acc, s.parent_space_id, s.project_count)
      end
    )
  end

  def space_invite_users(space_id, user_ids, user_id) do
    user_ids
    |> Enum.map(fn id -> %{user_id: id, space_id: space_id, type: "Member", request: false} end)
    |> send_invites(user_id)
  end

  def get_curr_user(user_id, space_ids) do
    Repo.all(
      from su in SpaceUser,
      where: su.space_id in ^space_ids and su.user_id == ^user_id
    )
    |> Enum.reduce(
      %{},
      fn su, acc ->
        Map.put(acc, su.space_id, su)
      end
    )
  end

  def get_space_roles(space_id) do
    from r in OpenthinkBackend.Role,
    where: r.space_id == ^space_id
  end

  def get_space_role_by_id(role_id, space_id) do
    from r in OpenthinkBackend.Role,
    where: r.space_id == ^space_id and r.role_id == ^role_id
  end

  def get_role_users(role_id, space_id) do
    from sur in OpenthinkBackend.SpaceUserRole,
    left_join: u in OpenthinkBackend.User, on: u.user_id == sur.user_id,
    left_join: su in OpenthinkBackend.SpaceUser, on: su.space_user_id == sur.space_user_id,
    where: su.space_id == ^space_id and sur.role_id == ^role_id,
    select: %{user_id: u.user_id, firstname: u.firstname, space_user_id: su.space_user_id}
  end

  def get_user_permissions(%{space_id: space_id, type: visibility, parent_space_id: parent_space_id, access_type: access}, user_id) do
    post_types = PostQueries.get_user_facing_post_types
    signed_in = !is_nil(user_id) && user_id >= 0
    all_permissions = %{
      can_post: post_types,
      edit_user_types: ["Moderator", "Creator", "Member", "Follower"],
      can_invite: true,
      can_create_rooms: true,
      can_create_sections: true,
      can_create_groups: true,
      can_create_projects: true,
      can_view: true,
      can_edit_settings: true,
      can_pin_posts: true,
      can_edit_any_post: true,
      can_delete_posts: true,
      can_delete_space: true,
      can_import_posts: true,
      can_edit: true
    }

    user = Repo.get(User, user_id)
    if !is_nil(user) and user.admin do
      all_permissions
    else
      case from(
        su in OpenthinkBackend.SpaceUser,
        where: su.user_id == ^user_id and su.space_id == ^space_id,
        select:  su.type,
        limit: 1
      ) |> Repo.one do
      "Creator" -> all_permissions
      "Moderator" ->
        %{
          can_post: post_types,
          edit_user_types: ["Moderator", "Member", "Follower"],
          can_create_rooms: true,
          can_create_sections: true,
          can_create_groups: true,
          can_create_projects: true,
          can_view: true,
          can_invite: true,
          can_edit_settings: true,
          can_pin_posts: true,
          can_import_posts: true,
          can_edit: true
        }
      "Member" ->
        %{
          can_post: post_types,
          edit_user_types: [],
          can_create_rooms: false,
          can_create_sections: true,
          can_create_groups: true,
          can_create_projects: true,
          can_invite: true,
          can_view: true,
          can_edit_settings: false,
          can_pin_posts: false,
          can_import_posts: true
        }
      other ->
        base_perms = %{
          can_post: if access == "Open" and signed_in do post_types else [] end,
          edit_user_types: [],
          can_create_rooms: false,
          can_create_sections: false,
          can_create_groups: false,
          can_create_projects: false,
          can_edit_settings: true,
          can_pin_posts: true,
          can_view: true
        }

        cond do
          visibility == "Public" or other == "Follower" -> base_perms
          visibility == "Closed" and !is_nil(parent_space_id) ->
            if from(
              su in SpaceUser,
              where: su.user_id == ^user_id and su.space_id == ^parent_space_id
            )
            |> Repo.one
            |> is_nil do
              Map.put(base_perms, :can_view, true)
            else
              Map.put(base_perms, :can_view, false)
            end
          true -> Map.put(base_perms, :can_view, false)
        end
      end
    end
  end

  def get_space_user_rooms(user_id, space_id) do
    from su in OpenthinkBackend.SpaceUser,
    where: su.user_id == ^user_id and su.space_id == ^space_id,
    preload: [:roles]
  end

  def get_attributes(space_id) do
    from(a in Attribute, where: a.space_id == ^space_id)
  end

  def get_space_rooms(space_id, user_id) do
    from r in Room,
    left_join: ru in RoomUser, on: r.room_id == ru.room_id,
    where: ru.user_id == ^user_id and r.space_id == ^space_id,
    preload: [curr_user: ru],
    order_by: r.index
  end

  def get_space_rooms(space_id) do
    from r in Room,
    where: r.space_id == ^space_id
  end

  def get_space_unread_messages_num(user_id, space_ids) do
    Repo.all(
      from ru in RoomUser,
      left_join: r in Room, on: r.room_id == ru.room_id,
      where: r.space_id in ^space_ids and ru.user_id == ^user_id,
      preload: [room: r]
    )
    |> Enum.reduce(
      %{},
      fn ru, acc ->
        unread = if is_nil(Map.get(ru, :unread_num)), do: 0, else: Map.get(ru, :unread_num)
        space_id = ru.room.space_id
        if Map.has_key?(acc, space_id) do
          Map.put(acc, space_id, Map.get(acc, space_id) + unread)
        else
          Map.put(acc, space_id, unread)
        end
      end
    )
  end

  def get_space_unread_messages(user_id, space_ids) do
    Repo.all(
      from ru in RoomUser,
      left_join: r in Room, on: r.room_id == ru.room_id,
      where: r.space_id in ^space_ids and ru.user_id == ^user_id,
      preload: [room: r]
    )
    |> Enum.reduce(
      %{},
      fn ru, acc ->
        if !is_nil(Map.get(ru, :unread)) do
          Map.put(acc, ru.room.space_id, Map.get(ru, :unread) or Map.get(acc, ru.room.space_id))
        else
          acc
        end
      end
    )
  end

  def get_space_mods(space_id) do
    get_space_users(space_id, ["Moderator", "Creator"], %{accepted_only: true})
    |> Repo.all
  end

  def get_space_members_mods(space_id) do
    Repo.all(
      get_space_users(space_id, ["Member", "Moderator", "Creator"], %{accepted_only: true})
    )
  end

  def get_space_members(space_id) do
    Repo.all(
      get_space_users(space_id, ["Member"], %{accepted_only: true})
    )
  end

  def search_space_rooms(space_id, user_id, search_text) do
    term = QueryHelpers.prefix_search(search_text)
    from r in Room,
    distinct: r.room_id,
    left_join: ru in RoomUser,
    where: ru.user_id == ^user_id,
    preload: [curr_user: ru],
    where: fragment(
      "(name) % ?",
      ^term
    )
    and r.space_id == ^space_id and (r.visibility == "Internal" or not is_nil(ru.user_id)),
    order_by: fragment(
      "(name) % ?",
      ^term
    )
  end

  def get_space_causes(space_id) do
    Repo.all(
      from st in SpaceTopic,
      where: st.space_id == ^space_id
    )
    |> Enum.map(fn cause -> cause.topic end)
  end

  def get_space_users_query(space_id) do
    from su in SpaceUser, where: su.space_id == ^space_id
  end

  def create_space(space) do
    {:ok, space} = %Space{}
    |> Space.changeset(space)
    |> Repo.insert

    parent_space_id = !!Map.get(space, :parent_space_id)

    if !!parent_space_id do
      from(su in get_space_users_query(space.space_id))
      |> Repo.all
      |> NotificationQueries.spawn_notification_generation(%{type: "space new subspace", space_id: space.space_id}, space.created_by)
    end

    %View{}
    |> View.changeset(%{space_id: space.space_id, purpose: "Task", default_view: true})
    |> Repo.insert

    {:ok, space}
  end

  def add_space_pinned_tags(space, tags, _opts \\ []) do
    tag_sets = tags
    |> Enum.map(fn tag -> %{space_id: space.space_id, topic: tag} end)
    Repo.insert_all(SpaceTopic, tag_sets)

    Map.put(space, :topics, get_space_causes(space.space_id))
  end

  def invite_parent_space_users(space, parent_space_id, user_id) do
    if !is_nil(parent_space_id) do
      Repo.all(
        from su in SpaceUser,
        where: su.space_id == ^parent_space_id
      )
      |> Enum.map(fn su -> %{space_id: space.space_id, accepted: nil, request: nil, index: nil, user_id: su.user_id, type: su.type} end)
      |> send_invites(user_id)
      space
    end

  end

  def invite_users(space, user_ids, user_id, opts \\ []) do
    space_user_opts = get_space_user_opts(opts)
    Enum.map(user_ids, fn user_id -> Map.merge(%{space_id: space.space_id, user_id: user_id}, space_user_opts) end)
    |> send_invites(user_id)
    space
  end

  def send_invites(space_users, user_id) do
    space_id = case space_users |> Enum.at(0) do
      %{space_id: space_id} -> space_id
      val -> val
    end
    result = if !!space_id do
      {_num, result} = Repo.insert_all(SpaceUser, space_users, on_conflict: :nothing, returning: true)

      space_users
      |> NotificationQueries.spawn_notification_generation(%{type: "space invite", space_id: space_id}, user_id)

      result
    end
    result
  end

  def user_join_space(space, user_id, opts \\ []) do
    space_user_opts = get_space_user_opts(opts)
    Map.put(space_user_opts, :request_type, Map.get(space_user_opts, :type))

    space_user_opts = if space.access_type == "Open" or space_user_opts.type == "Follower" do
      space_user_opts
      |> Map.put(:accepted, true)
      |> Map.put(:type, "Member")
    else
      get_space_mods(space.space_id)
      |> NotificationQueries.spawn_notification_generation(%{type: "space request", space_id: space.space_id}, user_id)
    end

    input = Map.merge(%{user_id: user_id, space_id: space.space_id}, space_user_opts)

    {:ok, space_user} = SpaceUser.changeset(%SpaceUser{}, input)
    |> Repo.insert

    Map.put(space, :curr_user, space_user)
  end


  defp get_space_user_opts(opts) do
    type = Keyword.get(opts, :type, "Member")
    accepted = Keyword.get(opts, :accepted, false)

    %{type: type, accepted: accepted}
  end


  defp get_space_relation_opts(opts) do
    accepted = Keyword.get(opts, :type, false)
    request = Keyword.get(opts, :request, false)
    %{request: request, accepted: accepted}
  end

  def add_project_groups(space, space_ids) do
    Repo.insert_all(SpaceRelation, Enum.map(space_ids, fn id -> %{space1_id: id, space2_id: space.space_id} end))
    space
  end


  def space_join_space(space, joining_space_id, opts) do
    space_relation = %{space2_id: space.space_id, space1_id: joining_space_id}
    |> Map.merge(get_space_relation_opts(opts))



    SpaceRelation.changeset(%SpaceRelation{}, space_relation)
    |> Repo.insert
  end

  def get_task_sections_query(space_id) do
    from p in Post,
    inner_join: sp in SpacePost,
    on: p.post_id == sp.post_id,
    left_join: v in fragment(
      """
      select
      id::int,
      nr
      from
      views,
      unnest(group_ids) WITH ORDINALITY a(id, nr)
      where
      purpose = 'Task'
      and
      space_id = ?
      """, ^space_id),
    on: v.id == p.post_id,
    where: sp.space_id == ^space_id and p.type == "Task Section" and not p.deleted,
    order_by: v.nr
  end

  def get_wiki_topics_query(space_id) do
    from p in Post,
    inner_join: sp in SpacePost,
    on: p.post_id == sp.post_id,
    where: sp.space_id == ^space_id and p.type == "Wiki Section" and is_nil(sp.parent_post_id)
  end

  def get_space_tags(space_id) do
    query = from pt in PostTag,
    distinct: pt.tag,
    left_lateral_join: sp in subquery(
      from sp in SpacePost,
      inner_join: pt in PostTag,
      on: pt.post_id == sp.post_id,
      where: sp.space_id == ^space_id and (sp.deleted != true or is_nil(sp.deleted)),
      group_by: pt.tag,
      select: %{count: count(sp.space_post_id), tag: pt.tag}
    ),
    on: sp.tag == pt.tag,
    where: pt.post_id in subquery(
      from sp in SpacePost,
      select: sp.post_id,
      where: sp.space_id == ^space_id and (sp.deleted != true or is_nil(sp.deleted))
    ),
    select_merge: %{
      tag: pt.tag,
      post_count: sp.count
    }

    from pt in subquery(query),
    left_join: st in subquery(
      from st in SpaceTag,
      where: st.space_id == ^space_id
    ),
    on: st.tag == pt.tag,
    order_by: [desc_nulls_last: st.space_tag_id, desc_nulls_last: pt.post_count],
    select_merge: %{
      pinned: not is_nil(st.tag),
    }
  end

  def pin_space_post(%{space_post_id: space_post_id, pinned: pinned}) do
    Repo.get(SpacePost, space_post_id)
    |> SpacePost.pin_changeset(%{pinned: pinned})
    |> Repo.update
  end

  def get_num_rooms(_, space_ids) do
    Repo.all(
      from r in Room,
      distinct: r.space_id,
      where: r.space_id in ^space_ids,
      windows: [space: [partition_by: r.space_id]],
      select: %{space_id: r.space_id, count: over(count(r.room_id), :space)}
    )
    |> Enum.reduce(
      %{},
      fn r, acc ->
        Map.put(acc, r.space_id, r.count)
      end
    )
  end

  def join_space(space_user) do
    space = Repo.get(Space, space_user.space_id)

    space_user = %{space_id: space.space_id, user_id: space_user.user_id, type: space_user.type, request_type: space_user.type, request: true}

    space_user = if space.access_type == "Open" do
      space_user
      |> Map.put(:accepted, true)
      |> Map.put(:type, "Member")
    else
      space_user
    end

    %SpaceUser{}
    |> SpaceUser.changeset(space_user)
    |> Repo.insert
  end

  def update_space_user(space_user, user_id) do
    existing_su = Repo.get(SpaceUser, space_user.space_user_id)
    accepted = Map.get(space_user, :accepted, false)
    if (accepted and !existing_su.accepted) or (existing_su.request_type != existing_su.request_type and existing_su.request_type == space_user.type) do
      type = if existing_su.request do "space request accept" else "space invite accept" end
      NotificationQueries.spawn_notification_generation([%{user_id: existing_su.user_id}], %{type: type, space_id: existing_su.space_id}, user_id)
    end

    existing_su
    |> SpaceUser.update_changeset(space_user)
    |> Repo.update
  end

  def remove_space_user(space_user_id) do
    {:ok, space_user} = Repo.get(SpaceUser, space_user_id)
    |> Repo.delete
    {:ok, Map.put(space_user, :space_user_id, nil)}
  end

  def update_space(space) do
    Repo.get(Space, space.space_id)
    |> Space.update_changeset(space)
    |> Repo.update
  end

  def archive_space(%{space_id: space_id}) do
    Repo.get(Space, space_id)
    |> Space.archive_changeset(%{archived: true})
    |> Repo.update
  end

  def get_last_updated_at(_, space_ids) do
    from(
      sp in subquery(
        from sp in SpacePost,
        select: %{space_id: sp.space_id, created_at: sp.created_at},
        where: sp.space_id in ^space_ids,
        order_by: [desc: sp.created_at]
      ),
      distinct: sp.space_id
    )
    |> Repo.all
    |> Enum.reduce(
      %{},
      fn %{space_id: space_id, created_at: created_at}, acc ->
        Map.put(acc, space_id, created_at)
      end
    )
  end


  def generate_unique_invite_url() do
    s = for _ <- 1..10, into: "", do: <<Enum.random('0123456789abcdef')>>
    if Repo.get(InviteLink, s) |> is_nil do
      s
    else
      generate_unique_invite_url()
    end
  end

  def generate_invite_link(link, space_id) do
    params = [space_id: space_id]


    case from(il in InviteLink, where: ^params) |> Repo.one do
      nil ->
        params = params
        |> Enum.into(%{})
        |> Map.put(:url, generate_unique_invite_url())

        case %InviteLink{}
        |> InviteLink.changeset(link |> Map.merge(params))
        |> Repo.insert do
          {:ok, %{url: url}} -> {:ok, url}
          val -> val
        end
      %{url: url} -> {:ok, url}
      _ -> {:error, "Invald link request"}
    end
  end

  def add_space_user_from_link(uid, %{space_id: sid, type: type}) do
    Logger.info(inspect(uid))
    case from(su in SpaceUser, where: su.user_id == ^uid and su.space_id == ^sid)
    |> Repo.one do
      nil ->
        %SpaceUser{}
        |> SpaceUser.changeset(%{accepted: true, type: type, space_id: sid, user_id: uid})
        |> Repo.insert
      %{type: existing_type} = su ->
        if existing_type == "Member" or existing_type == "Follower" do
          su
          |> SpaceUser.update_changeset(%{type: type})
          |> Repo.update
        else
          {:ok, su}
        end
    end
  end

  def validate_invite_link(user_id, link) do
    case Repo.get(InviteLink, link) do
      nil ->
        {:ok, nil}
      %{expires_at: nil, num_uses: nil} = link ->
        add_space_user_from_link(user_id, link)
      %{expires_at: expires_at, num_uses: num_uses} = link ->
        if DateTime.compare(expires_at, DateTime.utc_now()) == :gt do
          if !is_nil(num_uses) do
            if (num_uses == 1) do
              link
              |> Repo.delete
            else
              link
              |> InviteLink.use_link_changeset
              |> Repo.update
            end
          end

          add_space_user_from_link(user_id, link)
        else
          link
          |> Repo.delete
          {:ok, nil}
        end
      _ -> {:ok, nil}
    end
  end

end

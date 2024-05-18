defmodule OpenthinkBackendWeb.SpaceResolver do
  alias OpenthinkBackendWeb.{SpaceQueries, PostQueries}
  import OpenthinkBackendWeb.SpaceQueries
  alias OpenthinkBackend.{User, Repo, Post, SpaceRelation, PostRelation}
  alias Absinthe.Relay.Connection
  require Logger
  import Ecto.Query
  alias Absinthe.Relay.Node

  def get_spaces(%{space_ids: ids} = pagination_args, %{context: %{user_id: user_id}}) do
    Connection.from_query(
      SpaceQueries.get_spaces_by_id(ids, user_id, Map.get(pagination_args, :filters, %{})),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_spaces(pagination_args, %{context: %{user_id: user_id}}) do
    Connection.from_query(
      SpaceQueries.get_spaces(user_id, Map.get(pagination_args, :filters, %{})),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_subspaces(pagination_args, %{source: %{space_id: space_id}, context: %{user_id: user_id}}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_spaces(user_id, Map.get(pagination_args, :filters, %{}) |> Map.put(:parent_space_id, space_id)),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_space_by_id(_root, %{space_id: id}, _info) do
    if is_nil(id) do
      {:ok, nil}
    else
      result = SpaceQueries.get_space_by_id(id)
      {:ok, result}
    end

  end

  def get_graph(_root, args, _info) do
    %{space_id: id} = args
    posts = SpaceQueries.get_space_posts(id, args)

    relations = posts
    |> Enum.map(fn %{post_id: id} -> id end)
    |> PostQueries.get_relations(both: true)

    {:ok, %{nodes: posts, edges: relations}}
  end

  def recommended_groups(pagination_args, %{context: %{user_id: user_id}}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.recommended_groups(user_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def recommended_groups(_pagination_args, _res) do
    {:error, "Must be signed in"}
  end

  def get_num_rooms(space, _args, %{context: _context}) do
    Absinthe.Resolution.Helpers.batch(
      {OpenthinkBackendWeb.SpaceQueries, :get_num_rooms},
      space.space_id,
      fn batch_results -> {:ok, Map.get(batch_results, space.space_id, 0)} end
    )
  end

  def get_last_updated_at(%{space_id: space_id}, _args, %{context: _context}) do
    Absinthe.Resolution.Helpers.batch(
      {OpenthinkBackendWeb.SpaceQueries, :get_last_updated_at},
      space_id,
      fn batch_results -> {:ok, Map.get(batch_results, space_id)} end
    )
  end

  def get_space_posts_query(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_posts_query(space.space_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_space_relations(pagination_args, %{source: %{space_id: space_id}}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_relations(space_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_space_users(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_users(space.space_id, ["Creator", "Moderator", "Member", "Follower"], %{accepted_only: true}),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_space_leads(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_users(space.space_id, ["Creator", "Moderator"], %{accepted_only: true}),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_invitees(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_users(space.space_id, ["Moderator", "Member"], %{unaccepted_only: true}),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_space_members(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_users(space.space_id, ["Member"], %{accepted_only: true}),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_space_invited_users(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_users(space.space_id, ["Member", "Moderator", "Creator"], %{unaccepted_only: true}),
      &Repo.all/1,
      pagination_args
    )
  end

  def space_invite_users(_root, %{input: %{user_ids: user_ids, space_id: space_id}}, %{context: %{user_id: user_id}}) do
    space_users = SpaceQueries.space_invite_users(space_id, user_ids, user_id)
    users = Repo.all(
      from u in User,
      where: u.user_id in ^Enum.map(space_users, fn su -> su.user_id end)
    )
    users = Enum.map(
      users,
      fn user ->
        %{
          node: Map.put(user, :space_user, Enum.find(space_users, fn su -> su.user_id == user.user_id end))
        }
      end
    )
    {:ok, %{
      user_edges: users
    }}
  end

  def space_invite_users(_root, _args, _res) do
    {:error, "Missing user ids"}
  end

  def get_space_followers(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_users(space.space_id, ["Follower"], %{}),
      &Repo.all/1,
      pagination_args
    )
  end


  def get_views(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_views(space.space_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def search_space_rooms(pagination_args, %{source: %{space_id: space_id}, context: %{user_id: user_id}}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.search_space_rooms(space_id, user_id, pagination_args.query),
      &Repo.all/1,
      pagination_args
    )
  end

  def search_users(pagination_args, %{source: space}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.search_users(space.space_id, pagination_args.query),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_attributes(pagination_args, %{source: %{space_id: space_id}}) do
    Absinthe.Relay.Connection.from_query(
        SpaceQueries.get_attributes(space_id),
        &Repo.all/1,
        pagination_args
      )
  end

  def get_space_rooms(pagination_args, %{source: space, context: context}) do
    case context do
      %{user_id: user_id} ->
        Absinthe.Relay.Connection.from_query(
          SpaceQueries.get_space_rooms(space.space_id, user_id),
          &Repo.all/1,
          pagination_args
        )
      _ ->
        Absinthe.Relay.Connection.from_query(
          SpaceQueries.get_space_rooms(space.space_id),
          &Repo.all/1,
          pagination_args
        )
    end

  end

  def get_space_roles(%{space_id: space_id}, _args, _resolution) do
    {:ok, Repo.all(SpaceQueries.get_space_roles(space_id))}
  end

  def get_role_users(root, _args, _resolution) do
    {:ok, Repo.all(SpaceQueries.get_role_users(root.role_id, root.space_id))}
  end

  def get_space_role_by_id(root, %{role_id: role_id}, _resolution) do
    {:ok, Repo.one(SpaceQueries.get_space_role_by_id(role_id, root.space_id))}
  end

  def get_space_user_permissions(root, _args, %{context: %{user_id: user_id}}) do
    {:ok, SpaceQueries.get_user_permissions(root, user_id)}
  end

  def get_current_space_user(root, _args, _resolution) do
    user_id = 3 # change to context variable later
    {:ok, SpaceQueries.get_space_user_by_id(user_id, root.space_id)}
  end


  def get_space_room_by_id(_root, %{room_id: room_id}, _resolution) do
    {:ok, OpenthinkBackendWeb.MessageQueries.get_room_by_id(room_id)}
  end

  def get_space_unread_messages_num(space_user, _args, %{context: context}) do
    case context do
      %{user_id: user_id} ->
        Absinthe.Resolution.Helpers.batch({OpenthinkBackendWeb.SpaceQueries, :get_space_unread_messages_num, user_id}, space_user.space_id, fn batch_results ->
          {:ok, Map.get(batch_results, space_user.space_id)}
        end)
      _ -> {:ok, 0}
    end
  end

  def get_space_favorite(%{space_id: space_id}, _args, %{context: context}) do
    case context do
      %{user_id: user_id} ->
        Absinthe.Resolution.Helpers.batch(
          {OpenthinkBackendWeb.SpaceQueries, :get_space_favorite, user_id},
          space_id,
          fn batch_results ->
            {:ok, !!Map.get(batch_results, space_id)}
          end
        )
      _ -> {:ok, false}
    end
  end

  def get_space_causes(root, _args, _res) do
    {:ok, SpaceQueries.get_space_causes(root.space_id)}
  end

  def get_space_unread_messages(space_user, _args, %{context: context}) do
    case context do
      %{user_id: user_id} ->
        Absinthe.Resolution.Helpers.batch({OpenthinkBackendWeb.SpaceQueries, :get_space_unread_messages, user_id}, space_user.space_id, fn batch_results ->
          {:ok, Map.get(batch_results, space_user.space_id)}
        end)
      _ -> {:ok, 0}
    end
  end

  def get_space_post_space(space_post, _args, _res) do
    if !Map.get(space_post, :space_id) do
      {:ok, nil}
    else
      Absinthe.Resolution.Helpers.batch({OpenthinkBackendWeb.SpaceQueries, :get_space_post_space, space_post.space_id}, space_post.space_id, fn batch_results ->
        {:ok, Map.get(batch_results, space_post.space_id)}
      end)
    end
  end

  def get_num_users(space, _args, _context) do
    Absinthe.Resolution.Helpers.batch(
      {OpenthinkBackendWeb.SpaceQueries, :get_num_users},
      space.space_id,
      fn batch_results -> get_batched_space(batch_results, space.space_id, 0) end
    )
  end

  def get_num_members(space, _args, _context) do
    {:ok, SpaceQueries.get_num_members(space.space_id, %{})}
  end
  def get_num_moderators(space, _args, _context) do
    {:ok, SpaceQueries.get_num_moderators(space.space_id, %{})}
  end
  def get_num_followers(space, _args, _context) do
    {:ok, SpaceQueries.get_num_followers(space.space_id, %{})}
  end

  def get_num_invitees(space, _args, _context) do
    {:ok, SpaceQueries.get_num_invitees(space.space_id, %{})}
  end


  def get_num_posts(space, args, _context) do
    Absinthe.Resolution.Helpers.batch(
      {OpenthinkBackendWeb.SpaceQueries, :get_num_posts, args},
      space.space_id,
      fn batch_results -> get_batched_space(batch_results, space.space_id, 0) end
    )
  end

  def get_num_subspaces(space, args, %{context: %{user_id: user_id}}) do
    Absinthe.Resolution.Helpers.batch(
      {OpenthinkBackendWeb.SpaceQueries, :get_num_subspaces, args.filters |> Map.put(:user_id, user_id)},
      space.space_id,
      fn batch_results -> get_batched_space(batch_results, space.space_id, 0) end
    )
  end


  defp get_batched_space(batch_results, space_id, default) do
    if (Map.has_key?(batch_results, space_id)) do
      {:ok, Map.get(batch_results, space_id)}
    else
      {:ok, default}
    end
  end

  def get_curr_user(space, _args, %{context: context}) do
    Absinthe.Resolution.Helpers.batch(
      {OpenthinkBackendWeb.SpaceQueries, :get_curr_user, Map.get(context, :user_id)},
      space.space_id,
      fn batch_results ->
        space_user = Map.get(batch_results, space.space_id)
        space_user = if (Map.has_key?(batch_results, space.space_id)) do
          space_user
        else
          %{user_id: Map.get(context, :user_id), space_id: space.space_id}
        end
        {:ok, space_user}
      end
    )
  end

  def create_space(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    case input
    |> Map.put(:created_by, user_id)
    |> create_space do
      {:ok, new_space} ->
        space = new_space
        |> user_join_space(user_id, accepted: true, type: "Creator")
        |> add_space_pinned_tags(Map.get(input, :causes, []))
        |> invite_users(Map.get(input, :invited_user_ids, []), user_id)
        |> add_project_groups(Map.get(input, :invited_group_ids, []))

        parent_space_id = Map.get(input, :parent_space_id)
        if !!parent_space_id do
          %SpaceRelation{}
          |> SpaceRelation.changeset(%{space1_id: parent_space_id, space2_id: space.space_id, accepted: true})
          |> Repo.insert
        end

        if !!Map.get(input, :invite_all_space_members) do
          invite_parent_space_users(space, input.parent_space_id, user_id)
        end

        {:ok, referencing_post} = if !!Map.get(input, :created_from_post_id) do
          Repo.get(Post, Map.get(input, :created_from_post_id))
          |> Post.changeset(%{space_referenced_id: new_space.space_id})
          |> Repo.update
        else
          nil
        end

        referencing_post = if !!referencing_post do
          referencing_post |> Map.put(:space_referenced, new_space)
        else
          nil
        end

        {:ok, %{
          space_edge: %{
            node: space
          },
          referencing_post: referencing_post
        }}
      {:error, %{errors: errors}} ->
        {:error, inspect(errors)}
    end
  end



  def join_space(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    {:ok, space_user} = Map.put(input, :user_id, user_id)
    |> join_space

    user = Repo.get(User, space_user.user_id)

    {:ok, %{
      user_edge: %{
        node: Map.put(user, :space_user, space_user)
      }
    }}
  end

  def join_space(_parent, _args, _context) do
    {:error, "Must be signed in"}
  end

  def update_space_user(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    input
    |> update_space_user(user_id)
  end

  def pin_space_post(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    input
    |> pin_space_post
  end

  def update_space_user(_parent, _args, _context) do
    {:error, "Must be signed in"}
  end

  def remove_space_user(_parent, %{input: %{space_user_id: space_user_id}}, %{context: %{user_id: _user_id}}) do
    {:ok, removed_su} = remove_space_user(space_user_id)
    {:ok, %{
      curr_user: removed_su,
      deleted_space_user_id: Node.to_global_id("User", removed_su.user_id)
    }}

  end

  def remove_space_user(_parent, _args, _context) do
    {:error, "Must be signed in"}
  end

  def get_task_sections(pagination_args, %{source: %{space_id: space_id}}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_task_sections_query(space_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_wiki_topics(pagination_args, %{source: %{space_id: space_id}}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_wiki_topics_query(space_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_space_tags(pagination_args, %{source: %{space_id: space_id}}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_space_tags(space_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def update_space(_parent, %{input: input}, %{context: %{user_id: _user_id}}) do
    input
    |> update_space
  end

  def archive_space(_parent, %{input: input}, %{context: %{user_id: _user_id}}) do
    input
    |> archive_space
  end


  def get_invite_link(_root, args, %{source: %{space_id: sid}}) do
    args
    |> SpaceQueries.generate_invite_link(sid)
  end

  def validate_invite_link(_root, %{key: key}, %{context: %{user_id: user_id}}) do
    SpaceQueries.validate_invite_link(user_id, key)
  end
end

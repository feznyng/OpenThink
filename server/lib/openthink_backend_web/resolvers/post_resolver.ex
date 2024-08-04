defmodule OpenthinkBackendWeb.PostResolver do
  alias OpenthinkBackend.{Repo, Post, SpacePost, PostVote, PostUser, User, Reaction}
  alias OpenthinkBackendWeb.{PostQueries, DatabaseQueries}
  alias OpenthinkBackendWeb.Schema.ReactionTypes
  alias Absinthe.Relay.Connection
  import Ecto.Query
  alias Absinthe.Relay.Node
  require Logger

  def get_post_by_id(_root, %{post_id: post_id}, _info) do
    if is_nil(post_id) do
      {:ok, nil}
    end

    {:ok, PostQueries.get_post_by_id(post_id)}
  end

  def get_post_by_id(_root, _args, _info) do
    {:ok, nil}
  end

  def get_graph(_root, %{post_id: post_id} = args, _info) do
    posts = PostQueries.get_subtree(post_id, args)

    relations =
      posts
      |> Enum.map(fn %{post_id: id} -> id end)
      |> PostQueries.get_relations(both: true)

    {:ok, %{nodes: posts, edges: relations}}
  end

  def get_related_posts(pagination_args, %{source: %{post_id: post_id}}) do
    Absinthe.Relay.Connection.from_query(
      PostQueries.get_related_posts(post_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_views(pagination_args, %{source: %{post_id: post_id}}) do
    Absinthe.Relay.Connection.from_query(
      PostQueries.get_views(post_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_num_related_posts(post, args, _context) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_num_related_posts, args},
      post.post_id,
      fn batch_results ->
        case Map.get(batch_results, post.post_id, 0) do
          nil -> {:error, "Couldn't determine number of related posts"}
          num -> {:ok, num}
        end
      end
    )
  end

  def search_posts(pagination_args, _res) do
    Absinthe.Relay.Connection.from_query(
      PostQueries.search_posts(pagination_args.query),
      &Repo.all/1,
      pagination_args
    )
  end

  def create_post(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    case Map.put(input, :created_by, user_id) |> PostQueries.create_post(user_id) do
      {:ok, post} -> {:ok, %{post_edge: %{node: post}}}
      error -> error
    end
  end

  def update_post(_parent, %{input: input}, %{context: %{user_id: user_id}}) do
    case PostQueries.update_post(input, user_id) do
      {:ok, post} ->
        {:ok, %{post_edge: %{node: post}}}

      error ->
        error
    end
  end

  def delete_post(_parent, %{input: input}, %{context: %{user_id: _user_id}}) do
    case PostQueries.delete_post(input.post_id) do
      {:error, err} ->
        {:error, err}

      {:ok, {:ok, post}} ->
        {:ok, %{deleted_post_id: Node.to_global_id("Post", post.post_id), deleted_post: post}}

      _ ->
        {:error, "Was unable to update"}
    end
  end

  def batch_delete_post(_parent, %{input: input}, %{context: %{user_id: _user_id}}) do
    if Map.get(input, :delete_relations) do
      PostQueries.delete_post_relations([input.post_ids])
    end

    case PostQueries.batch_delete_post(input.post_ids) do
      {:ok, posts} ->
        {:ok,
         %{
           deleted_post_ids:
             Enum.map(posts, fn post -> Node.to_global_id("Post", post.post_id) end)
         }}

      val ->
        val
    end
  end

  def reorder_space_posts_of_type(
        _root,
        %{
          input: %{
            post_id: post_id,
            type: type,
            space_id: space_id,
            old_index: old_index,
            new_index: new_index
          }
        },
        %{context: %{user_id: _user_id}}
      ) do
    PostQueries.reorder_space_post_of_type(post_id, space_id, type, old_index, new_index)
  end

  def reorder_related_posts_of_type(
        _root,
        %{
          input: %{
            space_id: space_id,
            relation_id: relation_id,
            parent_post_id: post_id,
            type: type,
            old_index: old_index,
            new_index: new_index
          }
        },
        %{context: %{user_id: _user_id}}
      ) do
    PostQueries.reorder_related_post_of_type(
      space_id,
      post_id,
      relation_id,
      type,
      old_index,
      new_index
    )
  end

  def get_post_spaces(pagination_args, %{
        source: %{post_id: post_id},
        context: %{user_id: user_id}
      }) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_spaces, user_id},
      post_id,
      fn batch_results ->
        Map.get(batch_results, post_id, [])
        |> Connection.from_list(pagination_args)
      end
    )
  end

  def get_post_spaces(_pagination_args, _res) do
    {:ok, %{edges: []}}
  end

  def get_comments(pagination_args, %{source: %{post_id: post_id}}) do
    Absinthe.Relay.Connection.from_query(
      PostQueries.get_comments(post_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_tags(pagination_args, %{source: %{post_id: post_id}}) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_tags, pagination_args},
      post_id,
      fn batch_results ->
        Map.get(batch_results, post_id, [])
        |> Connection.from_list(pagination_args)
      end
    )
  end

  def get_path(pagination_args, %{source: %{post_id: post_id}}) do
    Absinthe.Relay.Connection.from_query(
      PostQueries.get_path(post_id, pagination_args.space_id, pagination_args),
      &Repo.all/1,
      pagination_args,
      count: Map.get(pagination_args, :count)
    )
  end

  def get_reactions(pagination_args, %{source: %{post_id: post_id}, context: context}) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_reactions, %{user_id: Map.get(context, :user_id)}},
      post_id,
      fn batch_results ->
        Map.get(batch_results, post_id, [])
        |> Connection.from_list(pagination_args)
      end
    )
  end

  def get_my_vote(post, _args, %{context: context}) do
    case context do
      %{user_id: user_id} ->
        Absinthe.Resolution.Helpers.batch(
          {PostQueries, :get_my_vote, user_id},
          post.post_id,
          fn batch_results ->
            vote = Map.get(batch_results, post.post_id)

            if is_nil(vote) do
              {:ok, %{user_id: user_id, post_id: post.post_id}}
            else
              {:ok, vote}
            end
          end
        )

      _ ->
        {:ok, nil}
    end
  end

  def get_poll(post, _args, %{context: context}) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_poll, Map.get(context, :user_id)},
      post.post_id,
      fn batch_results ->
        {:ok, Map.get(batch_results, post.post_id)}
      end
    )
  end

  def get_attributes(pagination_args, %{source: %{attributes: attributes}}) do
    attributes
    |> Connection.from_list(pagination_args)
  end

  def get_attribute_values(args, %{source: %{post_id: post_id}}) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_attribute_values, args},
      post_id,
      fn batch_results ->
        {:ok, Map.get(batch_results, post_id)}
      end
    )
  end

  def get_space_referenced(post, _args, %{source: %{attributes: _attributes}}) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_space_referenced},
      post.post_id,
      fn batch_results ->
        {:ok, Map.get(batch_results, post.post_id)}
      end
    )
  end

  defp get_updated_votes_post(post_id) do
    Repo.one(
      from(p in Post,
        left_join: pv in PostVote,
        on: pv.post_id == p.post_id,
        select_merge: %{
          vote_value: sum(pv.vote),
          num_upvotes: count(pv.vote) |> filter(pv.vote > 0),
          num_downvotes: count(pv.vote) |> filter(pv.vote < 0)
        },
        where: p.post_id == ^post_id,
        group_by: p.post_id
      )
    )
  end

  def change_post_vote(
        _root,
        %{input: %{post_id: post_id, space_id: space_id, upvote: upvote}},
        %{context: %{user_id: user_id}}
      ) do
    {:ok, my_vote} = PostQueries.change_post_vote(user_id, post_id, space_id, upvote)
    {:ok, %{my_vote: my_vote, post: get_updated_votes_post(post_id)}}
  end

  def delete_post_vote(_root, %{input: %{post_vote_id: post_vote_id}}, %{
        context: %{user_id: _user_id}
      }) do
    case PostQueries.delete_post_vote(post_vote_id) do
      {:ok, deleted_vote} ->
        {:ok,
         %{
           my_vote: Map.put(deleted_vote, :post_vote_id, nil),
           post: get_updated_votes_post(deleted_vote.post_id)
         }}

      error ->
        error
    end
  end

  defp fetch_post_reaction(emoji, post_id, user_id) do
    Repo.all(
      from(r in Reaction,
        select_merge: r,
        select_merge: %{count: over(count(r.reaction_id), :emoji)},
        where: r.emoji == ^emoji and r.post_id == ^post_id,
        order_by: fragment("abs(?)", r.created_by - ^user_id),
        windows: [emoji: [partition_by: r.emoji]]
      )
    )
    |> Enum.at(0)
  end

  defp fetch_message_reaction(emoji, message_id, user_id) do
    Repo.all(
      from(r in Reaction,
        select_merge: r,
        select_merge: %{count: over(count(r.reaction_id), :emoji)},
        where: r.emoji == ^emoji and r.message_id == ^message_id,
        order_by: fragment("abs(?)", r.created_by - ^user_id),
        windows: [emoji: [partition_by: r.emoji]]
      )
    )
    |> Enum.at(0)
  end

  def add_reaction(
        _root,
        %{input: %{name: name, space_id: space_id, emoji: emoji, post_id: post_id}},
        %{context: %{user_id: user_id}}
      ) do
    case PostQueries.add_reaction(user_id, post_id, space_id, name, emoji) do
      {:ok, _} ->
        reaction = fetch_post_reaction(emoji, post_id, user_id)

        if reaction.count > 1 do
          {:ok, %{reaction: reaction}}
        else
          {:ok, %{new_reaction: %{node: reaction}}}
        end

      error ->
        error
    end
  end

  def add_reaction(
        _root,
        %{input: %{name: name, space_id: space_id, emoji: emoji, message_id: message_id}},
        %{context: %{user_id: user_id}}
      ) do
    case PostQueries.add_reaction(user_id, message_id, space_id, name, emoji, "Message") do
      {:ok, _} ->
        reaction = fetch_message_reaction(emoji, message_id, user_id)

        if reaction.count > 1 do
          {:ok, %{reaction: reaction}}
        else
          {:ok, %{new_reaction: %{node: reaction}}}
        end

      error ->
        error
    end
  end

  def delete_reaction(_root, %{input: %{reaction_id: reaction_id}}, %{
        context: %{user_id: user_id}
      }) do
    case PostQueries.delete_reaction(reaction_id) do
      {:ok, deleted_reaction} ->
        reaction =
          if !!Map.get(deleted_reaction, :message_id) do
            fetch_message_reaction(deleted_reaction.emoji, deleted_reaction.message_id, user_id)
          else
            fetch_post_reaction(deleted_reaction.emoji, deleted_reaction.post_id, user_id)
          end

        case reaction do
          nil ->
            {:ok,
             %{
               deleted_reaction_id:
                 Node.to_global_id(
                   "Reaction",
                   ReactionTypes.reaction_id_fetcher(deleted_reaction, nil)
                 )
             }}

          reaction ->
            {:ok, %{reaction: reaction}}
        end

      error ->
        error
    end
  end

  def get_users(pagination_args, %{source: %{post_id: post_id}}) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_users, pagination_args},
      post_id,
      fn batch_results ->
        Map.get(batch_results, post_id, [])
        |> Connection.from_list(pagination_args)
      end
    )
  end

  def get_invite(%{post_id: post_id, type: type}, _args, %{context: context}) do
    if !Map.has_key?(context, :user_id) or type != "Event" do
      {:ok, nil}
    else
      Absinthe.Resolution.Helpers.batch(
        {PostQueries, :get_invite, context.user_id},
        post_id,
        fn batch_results ->
          invite = Map.get(batch_results, post_id)

          if is_nil(invite) do
            {:ok,
             %{
               type: "RSVP",
               post_id: post_id,
               user_id: context.user_id
             }}
          else
            {:ok, invite}
          end
        end
      )
    end
  end

  def get_invite(_args, res) do
    {:error, "must be part of a post"}
  end

  def move_post(_root, %{input: input}, %{context: %{user_id: user_id}}) do
    %{post_id: post_id, space_id: space_id} = input
    parent_post_id = Map.get(input, :new_parent_post_id)
    relation_id = Map.get(input, :existing_relation_id)
    view_id = Map.get(input, :view_id)
    index = Map.get(input, :index)

    if is_nil(parent_post_id) do
      # moving to space from a post
      %{prev_parent_post_id: prev_parent_post_id} =
        Repo.transaction(fn ->
          {:ok, deleted_relation} = PostQueries.delete_relation(relation_id)

          Repo.one(
            from(sp in SpacePost, where: sp.post_id == ^post_id and sp.space_id == ^space_id)
          )
          |> SpacePost.changeset(%{path: nil, parent_post_id: nil})
          |> Repo.update()

          path = to_string(post_id)

          # remove all ancestors for descendants of the post
          Ecto.Adapters.SQL.query!(
            Repo,
            """
            update
            space_posts
            set path = $1
            where
            space_id = $2 and (path ~ '*.#{post_id}.*' or path ~ '#{post_id}.*' or path ~ '*.#{post_id}')
            """,
            [path, space_id]
          )

          %{prev_parent_post_id: deleted_relation.post1_id}
        end)

      {:ok,
       %{
         deleted_post_id: Node.to_global_id("Post", post_id),
         prev_parent_post_id: Node.to_global_id("Post", prev_parent_post_id)
       }}
    else
      # moving to a post from either a space or another post
      case Repo.transaction(fn ->
             deleted_relation =
               if !!relation_id do
                 {:ok, relation} = PostQueries.delete_relation(relation_id)
                 relation
               end

             {:ok, created_relation} =
               PostQueries.create_relation(parent_post_id, post_id, user_id, space_id,
                 view_id: view_id,
                 index: index
               )

             if !!space_id do
               # in the future add conditional for moving to a different space

               space_post =
                 Repo.one(
                   from(sp in SpacePost,
                     where: sp.post_id == ^post_id and sp.space_id == ^space_id,
                     limit: 1
                   )
                 )

               # if the original parent post was also the hierarchical location or if moving to post update to the new one
               if !deleted_relation or space_post.parent_post_id == deleted_relation.post1_id do
                 parent_space_post =
                   Repo.one(
                     from(sp in SpacePost,
                       where:
                         sp.post_id == ^created_relation.post1_id and sp.space_id == ^space_id,
                       limit: 1
                     )
                   )

                 if !!parent_space_post do
                   path =
                     if is_nil(parent_space_post.path) do
                       ""
                     else
                       parent_space_post.path <> "."
                     end

                   path = path <> to_string(parent_space_post.post_id)

                   space_post
                   |> SpacePost.update_path_changeset(%{
                     path: path,
                     parent_post_id: parent_space_post.post_id
                   })
                   |> Repo.update()

                   path =
                     if String.length(path) > 1 do
                       path <> "."
                     else
                       path
                     end

                   path = path <> to_string(post_id)

                   Ecto.Adapters.SQL.query!(
                     Repo,
                     """
                     update
                     space_posts
                     set path = $1
                     where
                     space_id = $2 and (path ~ '*.#{post_id}.*' or path ~ '#{post_id}.*' or path ~ '*.#{post_id}')
                     """,
                     [path, space_id]
                   )
                 end
               end
             end

             %{created_relation: created_relation, deleted_relation: deleted_relation}
           end) do
        {:ok, %{created_relation: relation, deleted_relation: deleted_relation}} ->
          obj = %{
            relation: relation,
            deleted_post_id: Node.to_global_id("Post", post_id),
            new_parent_post_id: Node.to_global_id("Post", parent_post_id),
            deleted_relation_id: Node.to_global_id("PostRelation", relation_id)
          }

          obj =
            if !!deleted_relation do
              obj
              |> Map.put(
                :prev_parent_post_id,
                Node.to_global_id("Post", Map.get(deleted_relation, :post1_id))
              )
            else
              obj
            end

          {:ok, obj}

        val ->
          val
      end
    end
  end

  def move_post(_root, _args, _context) do
    {:error, "Need all supplied args"}
  end

  def create_relation(
        _root,
        %{
          input: %{
            post_id: post_id,
            parent_post_id: parent_post_id,
            space_id: space_id
          }
        },
        %{context: %{user_id: user_id}}
      ) do
        Logger.info("test")
    case PostQueries.create_relation(parent_post_id, post_id, user_id, space_id) do
      {:ok, relation} ->
        {:ok,
         %{
           post_edge: %{
             node: PostQueries.get_post_by_id(post_id) |> Map.put(:parent_relation, relation)
           }
         }}

      val ->
        val
    end
  end

  def create_relation(_root, _content, _context) do
    Logger.info("test 2")
    %{}
  end

  def create_link(
        _root,
        %{input: %{post1_title: post1, post2_title: post2, space_id: space_id}},
        %{context: %{user_id: user_id}}
      ) do
    parent_post_id =
      from(
        p in Post,
        select: p.post_id,
        inner_join: sp in SpacePost,
        on: sp.post_id == p.post_id,
        where: p.title == ^post1 and sp.space_id == ^space_id
      )
      |> Repo.all()
      |> Enum.at(0)

    post_id =
      from(
        p in Post,
        select: p.post_id,
        inner_join: sp in SpacePost,
        on: sp.post_id == p.post_id,
        where: p.title == ^post2 and sp.space_id == ^space_id
      )
      |> Repo.all()
      |> Enum.at(0)

    case PostQueries.create_relation(parent_post_id, post_id, user_id, space_id) do
      {:ok, relation} ->
        {:ok,
         %{
           relation: relation
         }}

      val ->
        val
    end
  end

  def delete_relation(_root, %{input: %{relation_id: relation_id}}, %{
        context: %{user_id: _user_id}
      }) do
    case PostQueries.delete_relation(relation_id) do
      {:ok, relation} ->
        Logger.info(relation)
        {:ok, %{deleted_relation_id: Node.to_global_id("Post", relation.post2_id)}}

      val ->
        val
    end
  end

  def vote_poll(
        _root,
        %{input: %{post_id: post_id, attribute_id: aid, attribute_type: type, selected: option}},
        %{context: %{user_id: user_id}}
      ) do
    PostQueries.vote_post(post_id, aid, type, option, user_id)
  end

  def vote_poll(_root, args, _context) do
    {:error, "Need all paramaters"}
  end

  def rsvp_post(_root, %{input: %{post_id: post_id, type: type}}, %{context: %{user_id: user_id}}) do
    PostQueries.rsvp_post(post_id, user_id, type)
  end

  def import_post_file(_root, %{input: %{post_id: post_id, space_id: space_id, file: file}}, %{
        context: %{user_id: user_id}
      }) do
    PostQueries.import_post_file(user_id, file, space_id, post_id)
  end

  def import_post_file(_root, %{input: %{space_id: space_id, file: file}}, %{
        context: %{user_id: user_id}
      }) do
    PostQueries.import_post_file(user_id, file, space_id)
  end

  def multi_complete_task(_root, %{input: %{user_id: user_id, post_id: post_id}}, _res) do
    pu =
      Repo.one(
        from(pu in PostUser,
          where: pu.user_id == ^user_id and pu.post_id == ^post_id
        )
      )

    {:ok, post_user} = PostQueries.multi_complete_task(post_id, user_id, pu)

    if is_nil(pu) do
      u =
        Repo.one(
          from(u in User,
            where: u.user_id == ^user_id
          )
        )

      {:ok,
       %{
         user_edge: %{
           node: u
         }
       }}
    else
      {:ok,
       %{
         deleted_user_id: Node.to_global_id("User", user_id)
       }}
    end
  end

  def pin_related_post(_root, %{input: input}, %{context: %{user_id: _user_id}}) do
    PostQueries.pin_related_post(input)
  end

  def get_attachments(pagination_args, %{source: %{post_id: post_id}}) do
    Absinthe.Resolution.Helpers.batch(
      {PostQueries, :get_attachments, pagination_args},
      post_id,
      fn batch_results ->
        Map.get(batch_results, post_id, [])
        |> Connection.from_list(pagination_args)
      end
    )
  end

  def get_space_post(pagination_args, %{source: post}) do
    cond do
      Map.has_key?(post, :space_post) &&
          (!Map.get(pagination_args, :space_id) ||
             Map.get(post, :space_post) |> Map.get(:space_id) == pagination_args.space_id) ->
        {:ok, post.space_post}

      !Map.get(pagination_args, :space_id) ->
        {:ok, nil}

      true ->
        Absinthe.Resolution.Helpers.batch(
          {PostQueries, :get_posts_space, pagination_args.space_id},
          post.post_id,
          fn batch_results ->
            {:ok, Map.get(batch_results, post.post_id)}
          end
        )
    end
  end

  def get_space_user(args, %{source: post}) do
    cond do
      Map.has_key?(post, :space_author) &&
          (!Map.get(args, :space_id) ||
             Map.get(post, :space_author) |> Map.get(:space_id) == args.space_id) ->
        {:ok, post.space_author}

      !Map.get(args, :space_id) ->
        {:ok, nil}

      true ->
        Absinthe.Resolution.Helpers.batch(
          {PostQueries, :get_space_users, args.space_id},
          post.post_id,
          fn batch_results ->
            {:ok, Map.get(batch_results, post.post_id)}
          end
        )
    end
  end
end

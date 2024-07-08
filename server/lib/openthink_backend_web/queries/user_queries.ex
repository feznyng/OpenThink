defmodule OpenthinkBackendWeb.UserQueries do
  @moduledoc """
  Contains database queries to get various user information.
  """
  require Logger
  import Ecto.Query

  alias OpenthinkBackend.{
    User,
    Connection,
    SpaceUser,
    UserSkill,
    UserTopic,
    Favorite,
    PostUser,
    SpacePost,
    Space,
    Post,
    Room,
    RoomUser
  }

  alias OpenthinkBackendWeb.{QueryHelpers, PostQueries, NotificationQueries}
  alias OpenthinkBackend.Repo

  @doc """
  Gets all users
  """
  def get_all_users() do
    from(s in User)
  end

  def search_all_users(search_term, params) do
    from(c in User)
    |> exclude_space_users(params)
    |> search_users(search_term)
  end

  def get_connections(user_id, _curr_user, params) do
    from(u in User,
      inner_join: c in Connection,
      on:
        (u.user_id == c.user1_id and c.user2_id == ^user_id) or
          (u.user_id == c.user2_id and c.user1_id == ^user_id),
      where: c.user1_id == ^user_id or c.user2_id == ^user_id,
      preload: [connection: c]
    )
    |> exclude_space_users(params)
    |> exclude_requested(params)
  end

  def search_connections(user_id, curr_user, search_term, params) do
    get_connections(user_id, curr_user, params)
    |> search_users(search_term)
  end

  defp search_users(query, search_term) do
    term = QueryHelpers.prefix_search(search_term)

    from(u in query,
      where:
        fragment(
          "(firstname || ' ' || lastname) ilike ? or (firstname || ' ' || lastname) % ? or (firstname) % ? or (lastname) % ?",
          ^(search_term <> "%"),
          ^term,
          ^term,
          ^term
        ),
      order_by: fragment("(firstname || ' ' || lastname) <-> ?", ^term)
    )
  end

  defp exclude_requested(query, params) do
    if Map.has_key?(params, :exclude_requested) and params.exclude_requested do
      from(u in query,
        inner_join: c in Connection,
        on: u.user_id == c.user1_id or u.user_id == c.user2_id,
        where: c.accepted
      )
    else
      query
    end
  end

  defp exclude_space_users(query, params) do
    if Map.has_key?(params, :exclude_space_id) and !is_nil(params.exclude_space_id) do
      from(u in query,
        where: u.user_id not in subquery(get_space_user_ids(params.exclude_space_id))
      )
    else
      query
    end
  end

  defp get_space_user_ids(space_id) do
    from(su in SpaceUser,
      select: su.user_id,
      where: su.space_id == ^space_id
    )
  end

  def get_user_by_id(user_id) do
    user =
      Repo.one(
        from(u in User,
          where: u.user_id == ^user_id,
          preload: [room_users: [:room]]
        )
      )

    if !!user do
      Map.merge(user, generate_unread_vals(user.room_users))
    else
      nil
    end
  end

  def get_users_by_ids(user_ids) do
    Repo.all(
      from(u in User,
        where: u.user_id in ^user_ids
      )
    )
  end

  def generate_unread_vals(room_users) do
    Enum.reduce(
      room_users,
      %{
        unread_messages: false,
        unread_messages_num: 0,
        unread_direct_messages: false,
        unread_direct_messages_num: 0
      },
      fn ru, acc ->
        acc
        |> Map.put(
          :unread_messages,
          Map.get(acc, :unread_messages) or (!is_nil(ru.unread) and ru.unread)
        )
        |> Map.put(
          :unread_direct_messages,
          Map.get(acc, :unread_direct_messages) or
            (!is_nil(ru.unread) and ru.unread and is_nil(ru.room.space_id))
        )
      end
    )
  end

  def get_user_rooms(user_id) do
    Repo.all(
      from(u in "users",
        left_join: ru in "room_users",
        on: ru.user_id == u.user_id,
        left_join: r in "rooms",
        on: r.room_id == ru.room_id,
        where: u.user_id == ^user_id and not is_nil(r.name) and ru.archived,
        select: map(r, [:name, :room_id])
      )
    )
  end

  def get_user_spaces(user_id, opts \\ []) do
    opts = Keyword.new(opts)
    query = sort_by(opts)

    from(s in query,
      inner_join: su in SpaceUser,
      on: s.space_id == su.space_id and su.user_id == ^user_id,
      where: is_nil(s.archived) or s.archived != true,
      order_by: su.index
    )
    |> filter_type(opts)
    |> filter_private(opts)
    |> filter_accepted(user_id, opts)
  end

  def filter_type(query, opts) do
    case Keyword.get(opts, :type) do
      "projects" -> from(s in query, where: s.project)
      "groups" -> from(s in query, where: is_nil(s.project) or s.project == false)
      _ -> query
    end
  end

  def filter_accepted(query, user_id, opts) do
    case Keyword.get(opts, :accepted) do
      true ->
        from(s in query,
          inner_join: su in SpaceUser,
          on: su.space_id == s.space_id and su.user_id == ^user_id,
          where: su.accepted
        )

      false ->
        from(s in query,
          inner_join: su in SpaceUser,
          on: su.space_id == s.space_id and su.user_id == ^user_id,
          where: not su.accepted
        )

      _ ->
        query
    end
  end

  def filter_private(query, opts) do
    case Keyword.get(opts, :include_private) do
      true -> query
      _ -> from(s in query, where: s.type == "Public")
    end
  end

  def sort_by(opts) do
    case Keyword.get(opts, :sort_by) do
      "Active" ->
        from(
          s in subquery(
            from(s in Space,
              distinct: s.space_id,
              left_join: sp in SpacePost,
              on: s.space_id == sp.space_id,
              left_join: p in Post,
              on: p.post_id == sp.post_id,
              order_by: [desc: p.created_at],
              select: %{s | post_created_at: p.created_at}
            )
          ),
          order_by: [desc_nulls_last: s.post_created_at]
        )

      _ ->
        from(s in Space)
    end
  end

  def get_user_skills(user_id) do
    from(us in UserSkill,
      select: %{user_id: us.user_id, value: us.skill},
      where: us.user_id == ^user_id
    )
  end

  def get_user_interests(user_id) do
    from(us in UserTopic,
      select: %{user_id: us.user_id, value: us.topic},
      where: us.user_id == ^user_id
    )
  end

  def get_notifications(user_id) do
    Repo.all(
      from(n in OpenthinkBackend.Notification,
        where: n.user_id == ^user_id
      )
    )
  end

  def get_user_posts(user_id, opts \\ %{}) do
    space_ids =
      from(su in SpaceUser, select: su.space_id, where: su.user_id == ^user_id) |> Repo.all()

    from(p in PostQueries.get_post_base_query(opts),
      left_join: sp in SpacePost,
      on: sp.post_id == p.post_id and sp.space_id in ^space_ids,
      select_merge: %{p | space_post: sp}
    )
    |> include_assigned(user_id, opts)
    |> PostQueries.sort_posts_query(opts)
  end

  def include_assigned(query, user_id, %{include_assigned: true}) do
    from(p in query,
      where:
        p.created_by == ^user_id or
          p.post_id in subquery(
            from(pu in PostUser,
              select: pu.post_id,
              where: pu.user_id == ^user_id
            )
          )
    )
  end

  def include_assigned(query, user_id, _) do
    from(p in query,
      where: p.created_by == ^user_id
    )
  end

  def get_user_direct_messages(user_id) do
    from(r in Room,
      left_join: ru in RoomUser,
      on: r.room_id == ru.room_id,
      where:
        ru.user_id == ^user_id and (is_nil(ru.archived) or not ru.archived) and is_nil(r.space_id),
      preload: [:users, curr_user: ru],
      order_by: [desc_nulls_last: :last_message_at]
    )
  end

  def temp_sign_in(name, true) do
    names = String.split(name, " ")
    firstname = Enum.at(names, 0)
    lastname = Enum.at(names, Enum.count(names) - 1)

    lastname =
      if firstname == lastname do
        ""
      else
        lastname
      end

    %User{}
    |> User.temp_changeset(%{name: name, firstname: firstname, lastname: lastname})
    |> Repo.insert()
  end

  def temp_sign_in(ip_address, false) do
    %User{}
    |> User.temp_changeset(%{ip_address: ip_address})
    |> Repo.insert()
  end

  def reorder_user_spaces(space_id, old_index, new_index, user_id) do
    QueryHelpers.reorder_elements(
      from(su in SpaceUser, where: su.space_id == ^space_id and su.user_id == ^user_id),
      from(su in SpaceUser, where: su.user_id == ^user_id),
      SpaceUser,
      old_index,
      new_index
    )
  end

  def reorder_favorite_spaces(space_id, old_index, new_index, user_id) do
    QueryHelpers.reorder_elements(
      from(f in Favorite, where: f.space_id == ^space_id and f.user_id == ^user_id),
      from(f in Favorite, where: f.user_id == ^user_id),
      Favorite,
      old_index,
      new_index
    )
  end

  def get_favorites(user_id, _args \\ %{}) do
    from(f in Favorite,
      where: f.user_id == ^user_id,
      preload: [:post, :space],
      order_by: f.index
    )
  end

  def set_current_page(user_id, current_page) do
    Repo.get!(User, user_id)
    |> User.current_page_changeset(%{current_page: current_page})
    |> Repo.update()
  end

  def create_connection(user_id, connection) do
    if connection.user1_id != user_id and connection.user2_id != user_id do
      {:error, "Not authorized"}
    else
      other_user_id =
        if connection.user1_id != user_id do
          connection.user1_id
        else
          connection.user2_id
        end

      case Connection.changeset(%Connection{}, connection) |> Repo.insert() do
        {:ok, connection} ->
          NotificationQueries.spawn_notification_generation(
            [other_user_id],
            %{type: "connection request"},
            user_id
          )

          {:ok, connection}

        val ->
          val
      end
    end
  end

  def update_connection(connection, _user_id) do
    Repo.get(Connection, connection.connection_id)
    |> Connection.update_changeset(connection)
    |> Repo.update()
  end

  def accept_connection(update_connection, user_id) do
    case Repo.get(Connection, update_connection.connection_id)
         |> Connection.update_changeset(update_connection)
         |> Repo.update() do
      {:ok, connection} ->
        other_user_id =
          if connection.user1_id != user_id do
            connection.user1_id
          else
            connection.user2_id
          end

        NotificationQueries.spawn_notification_generation(
          [other_user_id],
          %{type: "connection accept"},
          user_id
        )

        {:ok, connection}

      val ->
        val
    end
  end

  def delete_connection(other_user_id, user_id) do
    from(c in Connection,
      where:
        (c.user1_id == ^other_user_id and c.user2_id == ^user_id) or
          (c.user2_id == ^other_user_id and c.user1_id == ^user_id)
    )
    |> Repo.one()
    |> Repo.delete()
  end

  def get_users_connection(curr_user_id, user_ids) do
    connections =
      Repo.all(
        from(c in Connection,
          where:
            (c.user1_id == ^curr_user_id and c.user2_id in ^user_ids) or
              (c.user2_id == ^curr_user_id and c.user1_id in ^user_ids)
        )
      )

    Map.new(user_ids, fn id ->
      {id,
       Enum.find(connections, fn sp ->
         (sp.user2_id == id and sp.user1_id == curr_user_id) or
           (sp.user1_id == id and sp.user2_id == curr_user_id)
       end)}
    end)
  end

  def change_user_prefs(user_id, prefs) do
    Repo.get(User, user_id)
    |> User.toggle_prefs_changeset(prefs)
    |> Repo.update()
  end

  def get_feed(user_id, opts \\ %{}) do
    from(p in PostQueries.get_post_base_query(opts),
      inner_join: sp in SpacePost,
      on: sp.post_id == p.post_id,
      inner_join: s in Space,
      on: s.space_id == sp.space_id,
      inner_join: su in SpaceUser,
      on: sp.space_id == su.space_id,
      left_join: asu in SpaceUser,
      on: p.created_by == asu.user_id and asu.space_id == sp.space_id,
      select: %{p | space_post: sp, space_author: asu},
      where:
        (is_nil(s.archived) or s.archived == false) and su.user_id == ^user_id and
          p.type in ^PostQueries.get_user_facing_post_types() and
          (sp.deleted == false or is_nil(sp.deleted))
    )
    |> PostQueries.sort_posts_query(opts)
    |> PostQueries.exclude_deleted()
  end

  def delete_favorite_space(user_id, space_id) do
    favorite =
      Repo.one(
        from(f in Favorite,
          where: f.user_id == ^user_id and f.space_id == ^space_id
        )
      )

    Repo.delete(favorite)
  end

  def favorite_space(user_id, space_id) do
    %Favorite{}
    |> Favorite.changeset(%{user_id: user_id, space_id: space_id})
    |> Repo.insert()
  end

  def generate_email_verification_link(user_id) do
    case Repo.get(User, user_id) do
      nil ->
        {:error, "User doesn't exist"}

      %{user_id: uid, email: email} = user ->
        user
        |> User.unconfirm_changeset()
        |> Repo.update()

        token =
          %{"email" => email, "user_id" => uid}
          |> OpenthinkBackendWeb.Token.generate_and_sign!()

        {:ok, token}
    end
  end

  def validate_email_verification_link(token) do
    case OpenthinkBackendWeb.Token.verify_and_validate(token) do
      {:ok, %{"user_id" => uid, "email" => link_email}} ->
        case Repo.get(User, uid) do
          nil ->
            {:error, "User doesn't exist"}

          %{email: email} = user ->
            if email != link_email do
              {:ok, "Already verified"}
            else
              user
              |> User.confirm_changeset()
              |> Repo.update()

              {:ok, "Verified"}
            end
        end

      val ->
        val
    end
  end

  def generate_password_reset_link(user_id) do
    case Repo.get(User, user_id) do
      nil ->
        {:error, "User doesn't exist"}

      %{user_id: uid, hash: hash} ->
        token =
          %{
            "user_id" => uid,
            "hash" => hash |> Pbkdf2.hash_pwd_salt() |> String.slice(0..6)
          }
          |> OpenthinkBackendWeb.Token.generate_and_sign!()

        {:ok, token}
    end
  end

  def validate_password_reset_link(token) do
    case OpenthinkBackendWeb.Token.verify_and_validate(token) do
      {:ok, %{"user_id" => uid, "hash" => hash}} ->
        case Repo.get(User, uid) do
          nil ->
            {:error, "User doesn't exist"}

          %{hash: passwd} ->
            if passwd |> Pbkdf2.hash_pwd_salt() |> String.slice(0..6) == hash do
              {:ok, "Valid link"}
            else
              {:error, "Invalid link"}
            end
        end

      val ->
        val
    end
  end
end

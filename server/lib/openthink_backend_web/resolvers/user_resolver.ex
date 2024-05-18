defmodule OpenthinkBackendWeb.UserResolver do
  alias OpenthinkBackendWeb.{UserQueries, SpaceQueries, UserAuth}
  alias OpenthinkBackend.{Space, Accounts}
  alias OpenthinkBackend.Repo
  require Logger

  def all_users(pagination_args, _res) do
    Absinthe.Relay.Connection.from_query(
      UserQueries.get_all_users(),
      &Repo.all/1,
      pagination_args
    )
  end

  def search_all_users(pagination_args, _res) do
    Absinthe.Relay.Connection.from_query(
      UserQueries.search_all_users(pagination_args.query, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_connections(pagination_args, %{context: %{user_id: user_id}, source: user}) do
    Absinthe.Relay.Connection.from_query(
      UserQueries.get_connections(user.user_id, user.user_id == user_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def search_connections(pagination_args, %{context: %{user_id: user_id}, source: user}) do
    Absinthe.Relay.Connection.from_query(
      UserQueries.search_connections(user.user_id, user.user_id == user_id, pagination_args.query, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_user_by_id(_root, %{user_id: id}, _info) do
    result = UserQueries.get_user_by_id(id)
    {:ok, result}
  end

  def get_users_by_ids(_root, %{user_ids: ids}, _info) do
    result = UserQueries.get_users_by_ids(ids)
    {:ok, result}
  end

  def get_current_user(_root, _args, %{context: context}) do
    if Map.has_key?(context, :user_id) do
      {:ok, UserQueries.get_user_by_id(context.user_id)}
    else
      {:ok, %{}}
    end

  end

  def get_user_spaces(pagination_args, %{source: user}) do
    Absinthe.Relay.Connection.from_query(
      SpaceQueries.get_spaces(user.user_id, Map.get(pagination_args, :filters, %{}) |> Map.merge(%{member_of: true})),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_user_spaces(_pagination_args, _info) do
    {:error}
  end

  def get_favorites(pagination_args, %{context: context}) do
    user_id = Map.get(context, :user_id)
    if !!user_id do
      Absinthe.Relay.Connection.from_query(
        UserQueries.get_favorites(user_id, pagination_args),
        &Repo.all/1,
        pagination_args
      )
    else
      {:ok, nil}
    end
  end

  def get_user_groups(pagination_args, %{source: user, context: context}) do
    curr_user_id = Map.get(context, :user_id)
    Absinthe.Relay.Connection.from_query(
      UserQueries.get_user_spaces(user.user_id, type: "groups", include_private: curr_user_id == user.user_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_user_groups(_pagination_args, _info) do
    {:error}
  end

  def get_user_projects(pagination_args, %{source: user, context: context}) do
    curr_user_id = Map.get(context, :user_id)
    Absinthe.Relay.Connection.from_query(
      UserQueries.get_user_spaces(user.user_id, type: "projects", include_private: curr_user_id == user.user_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_user_projects(_pagination_args, _info) do
    {:error}
  end

  def get_user_skills(pagination_args, %{source: %{user_id: user_id}}) do
    Absinthe.Relay.Connection.from_query(
      UserQueries.get_user_skills(user_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_user_interests(pagination_args, %{source: %{user_id: user_id}}) do
    Absinthe.Relay.Connection.from_query(
      UserQueries.get_user_interests(user_id),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_user_posts(pagination_args, %{context: context}) do
    Absinthe.Relay.Connection.from_query(
      UserQueries.get_user_posts(context.user_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_user_direct_messages(pagination_args, %{context: %{user_id: user_id}}) do
    value = Absinthe.Relay.Connection.from_query(
      UserQueries.get_user_direct_messages(user_id),
      &Repo.all/1,
      pagination_args
    )

    {:ok, res} = value

    new_edges = res.edges
    |> Enum.map(
      fn e ->
        room = e.node
        Map.put(e, :node, Map.merge(room, OpenthinkBackendWeb.RoomUtils.generate_room_name_and_icon(room, room.users, user_id)))
      end)
    {:ok, Map.put(res, :edges, new_edges)}
  end

  def get_user_direct_messages(_pagination_args, _res) do
    {:error, "Need user id"}
  end

  def get_active_status(_args, %{source: user}) do
    presences = OpenthinkBackendWeb.Presence.list("user:#{user.user_id}")
    {:ok, Map.has_key?(presences, to_string(user.user_id))}
  end

  def get_active_status(_pagination_args, _res) do
    {:error, "Need user id"}
  end

  def temp_sign_in(_root, %{input: %{name: name, anonymous: true}}, _res) do
    UserQueries.temp_sign_in(name, true)
  end

  def temp_sign_in(_root, %{input: %{ip_address: ip_address, anonymous: false}}, _res) do
    UserQueries.temp_sign_in(ip_address, false)
  end

  def reorder_user_spaces(_root, %{input: %{space_id: space_id, old_index: old_index, new_index: new_index}}, %{context: %{user_id: user_id}}) do
    UserQueries.reorder_user_spaces(space_id, old_index, new_index, user_id)
  end

  def reorder_user_spaces(_root, _pagination_args, _res) do
    {:error, "Need user id"}
  end

  def set_current_page(_root, %{input: %{current_page: current_page}}, %{context: %{user_id: user_id}}) do
    UserQueries.set_current_page(user_id, current_page)
  end

  def set_current_page(_root, _args, _res) do
    {:error, "Need user id"}
  end

  def create_connection(_root, %{input: input}, %{context: %{user_id: user_id}}) do
    case UserQueries.create_connection(user_id, input) do
      {:ok, connection} ->
        {:ok, %{
          user_id: input.user2_id,
          connection: connection
        }}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def create_connection(_root, _args, _res) do
    {:error, "Need user id"}
  end

  def update_connection(_root, %{input: input}, %{context: %{user_id: user_id}}) do
    UserQueries.update_connection(input, user_id)
  end

  def delete_connection(_root, %{input: %{user_id: id}}, %{context: %{user_id: user_id}}) do
    case UserQueries.delete_connection(id, user_id) do
      {:ok, connection} ->
        {:ok, %{
          user1_id: connection.user1_id,
          user2_id: connection.user2_id,
          connection_id: nil
        }}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def delete_connection(_root, _args, _res) do
    {:error, "Need user id"}
  end

  def get_connection(user, _args, %{context: context}) do
    if Map.has_key?(context, :user_id) do
      Absinthe.Resolution.Helpers.batch(
        {OpenthinkBackendWeb.UserQueries, :get_users_connection, context.user_id},
        user.user_id,
        fn batch_results ->
          connection = Map.get(batch_results, user.user_id)
          connection = if is_nil(connection) do %{user1_id: context.user_id, user2_id: user.user_id, accepted: false, user_connection_id: nil} else connection end
          {:ok, connection}
        end
      )
    else
      {:ok, nil}
    end
  end

  def change_prefs(_root, %{input: input}, %{context: %{user_id: user_id}}) do
    UserQueries.change_user_prefs(user_id, input)
  end

  def get_feed(pagination_args, %{context: %{user_id: user_id}}) do
    Absinthe.Relay.Connection.from_query(
      UserQueries.get_feed(user_id, pagination_args),
      &Repo.all/1,
      pagination_args
    )
  end

  def get_feed(_pagination_args, _context) do
    {:error, "Must be signed in"}
  end

  def reorder_favorite_spaces(_root, %{input: %{space_id: space_id, old_index: old_index, new_index: new_index}}, %{context: %{user_id: user_id}}) do
    UserQueries.reorder_favorite_spaces(space_id, old_index, new_index, user_id)
  end

  def favorite_space(_root, %{input: %{space_id: space_id, favorite: fav}}, %{context: %{user_id: user_id}}) do
    if fav do
      case UserQueries.favorite_space(user_id, space_id) do
        {:ok, favorite} ->
          space = Repo.get(Space, space_id)
          {:ok, %{
            space: %{space_id: space_id, favorite: true},
            favorite_space_edge: %{
              node: favorite |> Map.put(:space, space)
            }
          }}
        _ ->
          {:error, "could not favorite"}
      end
    else
      case UserQueries.delete_favorite_space(user_id, space_id) do
        {:ok, favorite} ->
          {:ok, %{
            deleted_favorite_id: Absinthe.Relay.Node.to_global_id("Favorite", favorite.favorite_id),
            space: %{space_id: space_id, favorite: false}
          }}
        _ -> {:error, "Could not remove favorite"}
      end
    end
  end

  def favorite_space(_root, _args, _res) do
    {:error, "Must be signed in"}
  end

  def socket_auth(_root, _args, %{context: %{user_id: user_id}}) do
    if user_id < 0 do
      {:error, "Must be signed in to connect to WS"}
    else
      {:ok, %{token: OpenthinkBackendWeb.Token.generate(user_id)}}
    end
  end

  def socket_auth(_root, _args, _context) do
    {:error, "Must be signed in to connect to WS"}
  end

  def sign_in(_root, %{input: %{email: email, password: password}}, _res) do
    if user = Accounts.get_user_by_email_and_password(email, password) do
      {:ok, user}
    else
      {:error, "Email or password didn't match"}
    end
  end

  def maybe_generate_token(resolution, _) do
    if is_nil(resolution.value) do
      resolution
    else
      auth_token = Accounts.generate_user_session_token(resolution.value)
      Map.update!(
        resolution,
        :context,
        &Map.merge(&1, %{auth_token: auth_token, user_id: resolution.value.user_id})
      )
    end
  end

  def google_sign_in(_root, %{input: %{access_token: access_token}}, _res) do
    # google sign in
    case ElixirAuthGoogle.get_user_profile(access_token) do
      {:ok, %{email: email, family_name: lname, given_name: fname}} ->
        case Accounts.get_user_by_email(email) do
          nil ->
            case Accounts.register_user(%{email: email, firstname: fname, lastname: lname}, skip_password: true) do
              {:ok, user} ->
                {:ok, user}
              {:error, %Ecto.Changeset{} = changeset} ->
                {:error, changeset.errors}
            end
          user -> {:ok, user}
        end
      _ -> {:error, "Invalid Google credentials"}
    end

  end

  def google_sign_in(_root, _args, _res) do
    # google sign in
    {:error, "All fields needed"}
  end

  def get_names(name) do
    case String.split(name, " ") do
      [fname, lname] -> %{firstname: fname, lastname: lname}
      [fname] -> %{firstname: fname, lastname: ""}
      _ -> %{}
    end
  end

  def sign_up(_root, %{input: %{email: email, password: password, name: name}}, _res) do
    names = get_names(name)

    case Accounts.register_user(%{email: email, password: password} |> Map.merge(names)) do
      {:ok, user} ->
        {:ok, user}
      {:error, %Ecto.Changeset{} = changeset} ->
        errors = changeset.errors
        |> Keyword.keys
        |> Enum.map(
          fn key ->
            case key do
              :email -> "Email has already been taken."
              _ -> ""
            end
          end
        )
        {:error, errors}
    end
  end

  def sign_out(_root, _args, %{context: %{user_id: user_id}}) do
    # email and password sign in
    {:ok, %{signed_out: true, user_id: user_id}}
  end

  def sign_out(_root, _args, _res) do
    # email and password sign in
    {:error, "Must be signed in to sign out"}
  end

  def maybe_remove_user_id(resolution, _) do
    case resolution.value do
      %{signed_out: true} ->
        Map.update!(
          resolution,
          :context,
          &Map.merge(&1, %{user_id: -1})
        )
      _ -> resolution
    end
  end
end

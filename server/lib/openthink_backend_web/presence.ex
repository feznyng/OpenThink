defmodule OpenthinkBackendWeb.Presence do
  use Phoenix.Presence,
    otp_app: :openthink_backend,
    pubsub_server: OpenthinkBackend.PubSub
  alias OpenthinkBackend.{User, RoomUser, Room, SpaceUser}
  import Ecto.Query
  alias OpenthinkBackend.Repo
  require Logger

  def fetch(topic, presences) do
    case topic do
      "space:" <> _space_id ->
        query =
          from u in User,
          where: u.user_id in ^Map.keys(presences),
          select: {u.user_id, u}

        users = query |> Repo.all() |> Enum.into(%{})
        for {key, %{metas: metas}} <- presences, into: %{} do
          {num, _err} = Integer.parse(key)
          user = users[num]
          if is_nil(user) do
            {key, %{metas: metas, user: user}}
          else
            {key, %{metas: metas, user: %{firstname: user.firstname, active: true, lastname: user.lastname, profilepic: user.profilepic, user_id: user.user_id}}}
          end
        end
      _ ->
        for {key, %{metas: metas}} <- presences, into: %{} do
          {key, %{metas: metas, user: %{user_id: String.to_integer(key)}}}
        end
    end
  end
end

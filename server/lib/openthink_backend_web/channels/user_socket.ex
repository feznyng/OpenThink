defmodule OpenthinkBackendWeb.UserSocket do
  use Phoenix.Socket
  require Logger
  use Absinthe.Phoenix.Socket, schema: OpenthinkBackendWeb.Schema

  ## Channels
  channel "space:*", OpenthinkBackendWeb.SpaceChannel
  channel "room:*", OpenthinkBackendWeb.RoomChannel
  channel "user:*", OpenthinkBackendWeb.UserChannel

  @impl true
  def connect(params, socket, _connect_info) do
    if !(Map.has_key?(params, "token")) do
      Logger.info("No token")
      :error
    else
      %{"token" => token} = params
      case OpenthinkBackendWeb.Token.verify_and_validate(token) do
        {:ok, %{"exp" => exp, "user_id" => user_id}} ->
          if DateTime.compare(DateTime.from_unix!(exp), DateTime.utc_now()) == :lt do
            Logger.info("Token expired")
            :error
          else
            socket = assign(socket, user_id: user_id, current_room_ids: [])
            {:ok, socket}
          end
        {:error, _err} ->
          Logger.error("JWT not valid")
          :error
      end
    end
  end



  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     OpenthinkBackendWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  @impl true
  def id(_socket), do: nil
end

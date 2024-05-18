defmodule OpenthinkBackendWeb.UserChannel do
  use OpenthinkBackendWeb, :channel
  alias OpenthinkBackendWeb.Endpoint
  alias OpenthinkBackendWeb.Presence
  import Ecto.Query
  alias OpenthinkBackend.Repo
  alias OpenthinkBackend.{SpaceUser, RoomUser}
  require Logger
  alias Phoenix.Socket.Broadcast

  def join("user:" <> user_id, _params, socket) do
    send(self(), :after_join)
    user_id = String.to_integer(user_id)
    if Map.has_key?(socket.assigns, :user_id) and socket.assigns.user_id == user_id do
      {:ok, socket}
    else
      {:error, "not authorized"}
    end


  end

  def handle_info(:after_join, socket) do
    %{assigns: %{user_id: user_id}} = socket

    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second))
    })

    Repo.all(
      from ru in RoomUser,
      where: ru.user_id == ^user_id
    )
    |> Enum.map(fn ru -> setup_subscription(socket, "room:#{ru.room_id}") end)

    Repo.all(
      from su in SpaceUser,
      where: su.user_id == ^user_id
    )
    |> Enum.map(fn su -> setup_subscription(socket, "space:#{su.space_id}") end)

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_info(%Broadcast{topic: _topic, event: event, payload: payload}, socket) do
    push(socket, event, payload)
    {:noreply, socket}
  end

  # track location of user
  def handle_in("switch_location", payload, socket) do
    {:ok, location} = Map.fetch(payload, "location")
    Presence.update(self(), "user:#{socket.assigns.user_id}", socket.assigns.user_id, fn meta -> Map.put(meta, :current_page, location) end)
    {:noreply, socket}
  end


  # join a room
  def handle_in("join_room", %{room_id: id}, socket) do
    setup_subscription(socket, "room:#{id}")
    {:noreply, socket}
  end

  # leave a room
  def handle_in("leave_room", %{room_id: id}, socket) do
    remove_subscription(socket, "room:#{id}")
    {:noreply, socket}
  end

  # join a space
  def handle_in("join_space", %{space_id: id}, socket) do # leave a space
    setup_subscription(socket, "space:#{id}")
    # get all rooms in this space, delete any potential room_users, and unsubscribe from each

    {:noreply, socket}
  end

  # leave a space
  def handle_in("leave_space", %{space_id: id}, socket) do # leave a space
    remove_subscription(socket, "space:#{id}")
    # get all rooms in this space, delete any potential room_users, and unsubscribe from each

    {:noreply, socket}
  end


  defp setup_subscription(socket, topic) do
    Presence.track(self(), topic, socket.assigns.user_id, %{online_at: inspect(System.system_time(:second))})
    Endpoint.subscribe(topic)
  end

  defp remove_subscription(socket, topic) do
    Presence.untrack(self(), topic, socket.assigns.user_id)
    Endpoint.unsubscribe(topic)
  end


  intercept ["switch_room"]
  def handle_out("switch_room", %{old_room_id: old_room_id, new_room_id: new_room_id, user_id: user_id}, socket) do
    Presence.update(self(), "room:#{old_room_id}", user_id, fn meta -> Map.put(meta, :current_room, false) end)

    Presence.update(self(), "room:#{new_room_id}", user_id, fn meta -> Map.put(meta, :current_room, true) end)

    {:noreply, socket}
  end
end

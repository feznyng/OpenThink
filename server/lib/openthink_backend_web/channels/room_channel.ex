defmodule OpenthinkBackendWeb.RoomChannel do
  use OpenthinkBackendWeb, :channel
  alias OpenthinkBackendWeb.Presence
  require Logger

  # handles direct messages and room-level events like user typing
  def join("room:" <> _room_id, _params, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  # handle incoming messages and broadcast to everyone in the same room
  def handle_in("new_msg", message, socket) do
    broadcast!(socket, "new_msg", message)
    {:noreply, socket}
  end

  # handle user typing and broadcast to everyone in room
  def handle_in("user_typing", user, socket) do
    broadcast!(socket, "user_typing", user)
    {:noreply, socket}
  end

  # handle user typing and broadcast to everyone in room
  def handle_in("user_stopped_typing", user, socket) do
    broadcast!(socket, "user_stopped_typing", user)
    {:noreply, socket}
  end
end

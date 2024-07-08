defmodule OpenthinkBackendWeb.SpaceChannel do
  use OpenthinkBackendWeb, :channel
  alias OpenthinkBackendWeb.Presence
  require Logger

  def join("space:" <> _space_id, _params, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end
end

defmodule OpenthinkBackendWeb.PageController do
  use OpenthinkBackendWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end

defmodule OpenthinkBackendWeb.Context do
  @behaviour Plug

  import Plug.Conn
  require Logger

  def init(opts), do: opts

  def call(conn, _) do
    context = build_context(conn)
    |> Map.put(:conn, conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  @doc """
  Return the current user context based on the authorization header
  """
  def build_context(conn) do
    case conn
    |> fetch_session
    |> get_session(:user_id) do
      nil -> %{user_id: -1}
      user_id -> %{user_id: user_id}
    end
  end
end

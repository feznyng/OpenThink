defmodule OpenthinkBackendWeb.UserAuth do
  import Plug.Conn
  require Logger

  @max_age 60 * 60 * 24 * 365 * 10
  @remember_me_cookie "_openthink_backend_web_user_remember_me"
  @remember_me_options [sign: true, max_age: @max_age, http_only: false, same_site: "Lax", secure: true, domain: if Mix.env() in [:dev, :test] do "localhost" else "openthink.org" end]

  @doc """
  Logs the user in.

  It renews the session ID and clears the whole session
  to avoid fixation attacks. See the renew_session
  function to customize this behaviour.
  """
  def log_in_user(conn, user_id, token, params \\ %{}) do
    conn
    |> renew_session()
    |> put_session(:user_token, token)
    |> put_session(:user_id, user_id)
    |> put_additional_session_info(params)
    |> write_remember_me_cookie()
  end

  defp put_additional_session_info(conn, %{device_name: name}) do
    conn
    |> put_session(:device_name, name)
  end

  defp put_additional_session_info(conn, _) do
    conn
  end

  defp write_remember_me_cookie(conn) do
    put_resp_cookie(conn, @remember_me_cookie, "Signed in", @remember_me_options)
  end

  defp renew_session(conn) do
    conn
    |> fetch_session()
    |> configure_session(renew: true)
    |> clear_session()
  end

  @doc """
  Logs the user out.

  It clears all session data for safety. See renew_session. Also deletes the session cookie.
  """
  def log_out_user(conn) do
    conn
    |> renew_session()
    |> delete_resp_cookie(@remember_me_cookie, @remember_me_options)
    |> configure_session(drop: true)
  end
end

defmodule OpenthinkBackendWeb.Router do
  use OpenthinkBackendWeb, :router
  alias OpenthinkBackendWeb.UserAuth
  require Logger

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json", :multipart]
    plug OpenthinkBackendWeb.Context
  end

  scope "/", OpenthinkBackendWeb do
    pipe_through :browser

    get "/", PageController, :index
  end

  scope "/" do
    pipe_through :api
    forward "/graphql", Absinthe.Plug,
      schema: OpenthinkBackendWeb.Schema,
      before_send: {__MODULE__, :absinthe_before_send}

    if Mix.env() in [:dev] do
      forward "/graphiql", Absinthe.Plug.GraphiQL,
        schema: OpenthinkBackendWeb.Schema,
        socket: OpenthinkBackendWeb.UserSocket,
        interface: :simple,
        context: %{pubsub: OpenthinkBackendWeb.Endpoint},
        before_send: {__MODULE__, :absinthe_before_send}
    end
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: OpenthinkBackendWeb.Telemetry
    end
  end

  def absinthe_before_send(conn, %Absinthe.Blueprint{} = blueprint) do
    context = blueprint.execution.context

    # if an auth token is present in the context this is a successful sign in request so create a session
    conn = if auth_token = context[:auth_token] do
      UserAuth.log_in_user(conn, context[:user_id], auth_token)
    else
      conn
    end

    user_id = Map.get(context, :user_id)

    # if user_id is negative, user should be logged out
    if user_id < 0 do
      UserAuth.log_out_user(conn)
    else
      conn
    end
  end

  def absinthe_before_send(conn, _) do
    conn
  end
end

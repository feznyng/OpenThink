defmodule OpenthinkBackend.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      OpenthinkBackend.Repo,
      # Start the Telemetry supervisor
      OpenthinkBackendWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: OpenthinkBackend.PubSub},
      # Start Presence
      OpenthinkBackendWeb.Presence,
      # Start the Endpoint (http/https)
      OpenthinkBackendWeb.Endpoint,
      # Start a worker by calling: OpenthinkBackend.Worker.start_link(arg)
      # {OpenthinkBackend.Worker, arg}
      {Absinthe.Subscription, OpenthinkBackendWeb.Endpoint}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: OpenthinkBackend.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    OpenthinkBackendWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config
require Logger
config :openthink_backend,
  ecto_repos: [OpenthinkBackend.Repo]

config :openthink_backend, OpenthinkBackend.Repo,
  adapter: Ecto.Adapters.Postgres,
  pool_size: 10

# Configures the endpoint
config :openthink_backend, OpenthinkBackendWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "cRVSQI6w6F4VmPS1Nt3etdfc7zuudXkowXblpOtsLxgmn1wf7Sq4ht0fme2vPUU8",
  render_errors: [view: OpenthinkBackendWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: OpenthinkBackend.PubSub,
  live_view: [signing_salt: "NDDELZXl"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason
# Initialize joken for JWT validation
config :joken, default_signer: System.get_env("JWT_SECRET")

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"

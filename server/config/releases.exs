import Config
require Logger

service_name = System.fetch_env!("SERVICE_NAME")
db_url = System.fetch_env!("DB_URL")
secret_key_base = System.fetch_env!("SECRET_KEY_BASE")
port = System.fetch_env!("PORT")

config :openthink_backend, OpenthinkBackend.Repo,
  url: db_url,
  types: OpenthinkBackend.Postgrex.Types

# Configure redis and redbird
redis_host = System.get_env("REDIS_HOST")

config :redbird,
  key_namespace: "openthink_backend_",
  redis_options: [
    host: redis_host
  ]

origins = ["https://www.openthink.org", "//*.openthink.org"]

config :openthink_backend, OpenthinkBackendWeb.Endpoint,
  http: [port: port],
  secret_key_base: secret_key_base,
  url: [host: {:system, "APP_HOST"}, port: {:system, "PORT"}],
  check_origin: origins

config :peerage, via: Peerage.Via.Dns,
  dns_name: service_name,
  app_name: "openthink_backend"

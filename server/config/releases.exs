import Config
require Logger

db_url = System.fetch_env!("DB_URL")
secret_key_base = System.fetch_env!("SECRET_KEY_BASE")

config :openthink_backend, OpenthinkBackend.Repo,
  url: db_url,
  types: OpenthinkBackend.Postgrex.Types

origins = ["https://www.openthink.org", "//*.openthink.org"]

config :openthink_backend, OpenthinkBackendWeb.Endpoint,
  http: [port: String.to_integer(System.get_env("PORT") || "4000"), transport_options: [socket_opts: [:inet6]]],
  secret_key_base: secret_key_base,
  check_origin: origins

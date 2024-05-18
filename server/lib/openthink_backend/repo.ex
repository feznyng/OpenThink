defmodule OpenthinkBackend.Repo do
  use Ecto.Repo,
    otp_app: :openthink_backend,
    adapter: Ecto.Adapters.Postgres
end

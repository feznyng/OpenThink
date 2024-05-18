defmodule OpenthinkBackend.CORS do
  @allowed_origins [
    "https://www.openthink.org",
    "https://openthink.org",
    if Mix.env() in [:dev, :test] do
      "http://localhost:3000"
    end
  ]

  use Corsica.Router,
    origins: @allowed_origins,
    allow_credentials: true,
    max_age: 600

  def allowed_origins do
    @allowed_origins
  end
end

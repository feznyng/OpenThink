defmodule OpenthinkBackendWeb.Token do
  use Joken.Config

  def generate(user_id) do
    %{"user_id" => user_id}
    |> OpenthinkBackendWeb.Token.generate_and_sign!
  end
end

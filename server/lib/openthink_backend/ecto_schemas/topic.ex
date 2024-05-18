defmodule OpenthinkBackend.Topic do
  use Ecto.Schema

  @primary_key {:name, :string, []}
  @derive {Phoenix.Param, key: :value}
  schema "topics" do
    field :value, :string
  end


end

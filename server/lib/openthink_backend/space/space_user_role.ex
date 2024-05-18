defmodule OpenthinkBackend.SpaceUserRole do
  use Ecto.Schema

  @primary_key {:space_user_role_id, :id, autogenerate: true}

  schema "space_user_roles" do
    field :space_user_id, :integer
    field :user_id, :integer
    field :role_id, :integer
  end
end

defmodule OpenthinkBackend.Attribute do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:attribute_id, :id, autogenerate: true}

  schema "attributes" do
    field :index, :integer
    field :name, :string
    field :type, :string
    field :formula, :string
    field :options, {:array, :map}
    field :created_at, :utc_datetime
    belongs_to :post, OpenthinkBackend.Post, references: :post_id
    belongs_to :space, OpenthinkBackend.Space, references: :space_id
  end

  @valid_types ["Multi-select", "Text", "Number", "Select", "Status", "Date", "Person", "Files & Media", "Checkbox", "URL", "Phone", "Email"]

  def valid_types do
    @valid_types
  end

  def changeset(post_relation, params \\ %{}) do
    post_relation
    |> cast(params, [:post_id, :space_id, :index, :name, :type, :options])
    |> validate_required([:type, :name])
    |> validate_type
  end

  def validate_type(changeset) do
    validate_change(changeset, :type, fn field, value ->
      case value in @valid_types do
        true ->
          []
        false ->
          [{field, "Not a valid type"}]
      end
    end)
  end
end

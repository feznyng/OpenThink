defmodule OpenthinkBackend.AttributeValue do
  use Ecto.Schema
  import Ecto.Changeset
  require Logger
  @primary_key {:attribute_value_id, :id, autogenerate: true}

  schema "attribute_values" do
    field :post_id, :integer
    field :attribute_id, :integer
    field :text_value, :string
    field :bool_value, :boolean
    field :number_value, :decimal
    field :date_value, :utc_datetime
    field :multi_text_value, {:array, :string}
    field :created_at, :utc_datetime
    field :created_by, :integer
  end

  @type_to_field %{"Multi-select" => :multi_text_value, "Text" => :text_value, "Number" => :number_value, "Select" => :text_value, "Status" => :text_value, "Date" => :date_value, "Person" => :multi_text_value, "Files & Media" => :mutli_text_value, "Checkbox" => :bool_value, "URL" => :text_value, "Phone" => :text_value, "Email" => :text_value}

  def type_to_field do
    @type_to_field
  end

  @default_values %{text_value: nil, bool_value: nil, number_value: nil, date_value: nil, multi_text_value: [], }
  defp cast_params(params) do
    @default_values
    |> Map.merge(params)
  end

  def changeset(attribute_value, params \\ %{}) do
    params = params

    attribute_value
    |> cast(params |> cast_params, [:post_id, :attribute_id, :text_value, :multi_text_value, :created_by])
    |> validate_required([:attribute_id, :text_value])
  end

  def update_changeset(av, params \\ %{}) do
    params = params |> cast_params

    av
    |> cast(params |> cast_params, [:multi_text_value, :text_value])
  end
end

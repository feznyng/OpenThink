defmodule OpenthinkBackend.Filter do
  use Ecto.Schema

  schema "filters" do

    field :type, :string
    field :text_value, :string
    field :multi_text_value, {:array, :string}
    field :number_value, :string
    field :start_date_value, :utc_datetime
    field :end_date_value, :utc_datetime
    field :bool_value, :boolean
    field :attribute_id, :integer
    has_one :attribute, OpenthinkBackend.Attribute, foreign_key: :attribute_id, references: :attribute_id
    belongs_to :filter_group, OpenthinkBackend.FilterGroup, foreign_key: :filter_group_id
    belongs_to :view, OpenthinkBackend.View, references: :view_id
  end


end

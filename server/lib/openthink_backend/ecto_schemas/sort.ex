defmodule OpenthinkBackend.Sort do
  use Ecto.Schema

  schema "sorts" do
    has_one :attribute, OpenthinkBackend.Attribute, foreign_key: :attribute_id
    belongs_to :view, OpenthinkBackend.View, references: :view_id
    field :ascending, :boolean
    field :percentage, :decimal
  end
end

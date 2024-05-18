defmodule OpenthinkBackend.FilterGroup do
  use Ecto.Schema

  schema "filter_groups" do
    field :filter_group_id, :integer
    field :all_sat, :boolean
    belongs_to :view, OpenthinkBackend.View, references: :view_id
  end

end

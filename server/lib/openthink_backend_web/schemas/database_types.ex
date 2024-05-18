defmodule OpenthinkBackendWeb.Schema.DatabaseTypes do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation, :modern
  require Logger

  object :filter_group do
    field :type, :string
  end

  object :filter do
    field :attribute_id, :integer
    field :type, :string
    field :text_value, :string
    field :multi_text_value, list_of(:string)
    field :number_value, :string
    field :start_date_value, :datetime
    field :end_date_value, :datetime
    field :bool_value, :boolean
    field :filter_group_id, :integer
  end

  object :sort do
    field :attribute_id, :integer
    field :ascending, :boolean
    field :percentage, :integer
  end

  node object :view, id_fetcher: &view_id_fetcher/2 do
    field :view_id, :integer
    field :name, :string
    field :entry_ids, non_null(list_of(non_null(:integer)))
    field :group_ids, non_null(list_of(non_null(:string)))
    field :post_id, :integer
    field :space_id, :integer
    field :purpose, :string
    field :hide_labels, :boolean
    field :attribute_rendering_method, :string
    field :filters, list_of(:filter)
    field :sorts, list_of(:sort)
  end

  defp view_id_fetcher(view, _expr) do
    to_string(view.view_id)
  end

  connection node_type: :view

  input_object :reorder_entry_input do
    field :view_id, non_null(:integer)
    field :entry_id, non_null(:integer)
    field :index, :integer
  end

  input_object :reorder_group_input do
    field :view_id, non_null(:integer)
    field :group_id, non_null(:string)
    field :index, :integer
  end

  input_object :remove_group_input do
    field :view_id, non_null(:integer)
    field :group_id, non_null(:string)
  end

  input_object :remove_entry_input do
    field :view_id, non_null(:integer)
    field :entry_id, non_null(:integer)
  end

  input_object :create_view_input do
    field :post_id, :integer
    field :space_id, :integer
    field :type, :string
    field :default_view, :boolean
    field :name, :string
  end

  object :view_edge_output do
    field :view, :view_edge
  end


  object :database_mutations do
    @desc "Reorder or add an entry"
    field :put_entry, type: :view do
      arg :input, :reorder_entry_input
      resolve &OpenthinkBackendWeb.DatabaseResolver.reorder_view_entries/3
    end

    @desc "Reorder or add a group"
    field :put_group, type: :view do
      arg :input, :reorder_group_input
      resolve &OpenthinkBackendWeb.DatabaseResolver.reorder_view_groups/3
    end

    @desc "Remove entry"
    field :remove_entry, type: :view do
      arg :input, :remove_entry_input
      resolve &OpenthinkBackendWeb.DatabaseResolver.remove_entry/3
    end

    @desc "Remove group"
    field :remove_group, type: :view do
      arg :input, :remove_group_input
      resolve &OpenthinkBackendWeb.DatabaseResolver.remove_group/3
    end

    @desc "Create view"
    field :create_view, type: :view_edge_output do
      arg :input, :create_view_input
      resolve &OpenthinkBackendWeb.DatabaseResolver.create_view/3
    end
  end
end

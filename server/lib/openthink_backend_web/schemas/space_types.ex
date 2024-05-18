defmodule OpenthinkBackendWeb.Schema.SpaceTypes do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation, :modern
  alias OpenthinkBackendWeb.SpaceResolver
  require Logger

  object :rule do
    field :name, :string do
      resolve(fn(rule,_,_) ->
        {:ok, Map.get(rule, "name", "")}
      end)
    end
    field :description, (:string) do
      resolve(fn(rule,_,_) ->
        {:ok, Map.get(rule, "description", "")}
      end)
    end
  end

  object :task_info do
    field :attributes, list_of(:attribute) do
      resolve(fn(%{"attributes" => value},_,_) ->
        {:ok, value}
      end)
    end
  end

  object :info do
    field :task_info, :task_info do
      resolve(fn(info,_,_) ->
        {:ok, info[:task_info]}
      end)
    end
  end

  object :role do
    field :can_post, list_of(:string)
    field :edit_user_types, list_of(:string)
    field :can_invite, :boolean
    field :can_create_rooms, :boolean
    field :can_create_sections, :boolean
    field :can_create_groups, :boolean
    field :can_create_projects, :boolean
    field :can_view, :boolean
    field :can_edit_settings, :boolean
    field :can_delete_posts, :boolean
    field :can_edit_any_post, :boolean
    field :can_delete_space, :boolean
    field :can_pin_posts, :boolean
    field :can_edit_tasks, :boolean
    field :can_import_posts, :boolean
    field :can_edit, :boolean
  end

  input_object :space_filters do
    field :query, :string
    field :visibility, list_of(:string)
    field :access, list_of(:string)
    field :causes, list_of(:string)
    field :parent_space_id, :integer
    field :project, :boolean
    field :member_of, :boolean
    field :has_location, :boolean
    field :accepted, :boolean
    field :exclude_children, :boolean
  end

  node object :space, id_fetcher: &space_id_fetcher/2 do
    interface :image_item
    interface :section_item
    interface :has_posts
    interface :has_views

    @desc "Get invite link for a space and with optional parameters"
    field :invite_link, :string do
      arg :type, non_null(:string)
      arg :expires_at, :string
      arg :num_uses, :integer
      resolve &SpaceResolver.get_invite_link/3
    end

    field :space_id, non_null(:integer)
    field :name, non_null(:string)
    field :description, :string
    field :type, :string
    field :bannerpic, :string
    field :profilepic, :string
    field :city, :boolean
    field :info, :info
    field :state, :boolean
    field :longitude, :decimal
    field :latitude, :decimal
    field :created_at, :string
    field :hidden, :boolean
    field :address, :string
    field :archived, :boolean
    field :project, :boolean
    field :start_date, :string
    field :end_date, :string
    field :space_type, :string
    field :rules, list_of(:rule)
    field :access_type, :string
    field :default_banner, :string
    field :personal_user_id, :id
    field :project_type, :string
    field :last_updated_at, :datetime do
      resolve &SpaceResolver.get_last_updated_at/3
    end
    field :favorite, :boolean do
      resolve &SpaceResolver.get_space_favorite/3
    end
    field :causes, list_of(:string) do
      resolve &SpaceResolver.get_space_causes/3
    end
    field :parent_space_id, :integer

    connection field :attributes, node_type: :attribute do
      resolve &SpaceResolver.get_attributes/2
    end

    connection field :rooms, node_type: :room do
      resolve &SpaceResolver.get_space_rooms/2
    end

    field :num_rooms, :integer do
      resolve &SpaceResolver.get_num_rooms/3
    end

    connection field :search_rooms, node_type: :room do
      arg :query, non_null(:string)
      resolve &SpaceResolver.search_space_rooms/2
    end

    connection field :users, node_type: :user do
      resolve &SpaceResolver.get_space_users/2
    end

    connection field :search_users, node_type: :user do
      arg :query, non_null(:string)
      resolve &SpaceResolver.search_users/2
    end

    connection field :moderators, node_type: :user do
      resolve &SpaceResolver.get_space_leads/2
    end
    field :num_invitees, :integer do
      resolve &SpaceResolver.get_num_invitees/3
    end
    connection field :invitees, node_type: :user do
      resolve &SpaceResolver.get_invitees/2
    end
    field :num_moderators, :integer do
      resolve &SpaceResolver.get_num_moderators/3
    end

    connection field :members, node_type: :user do
      resolve &SpaceResolver.get_space_members/2
    end
    field :num_members, :integer do
      resolve &SpaceResolver.get_num_members/3
    end

    connection field :followers, node_type: :user do
      resolve &SpaceResolver.get_space_followers/2
    end
    field :num_followers, :integer do
      resolve &SpaceResolver.get_num_followers/3
    end

    connection field :invited_users, node_type: :user do
      resolve &SpaceResolver.get_space_invited_users/2
    end

    connection field :spaces, node_type: :space do
      arg :filters, :space_filters
      resolve &SpaceResolver.get_subspaces/2
    end

    field :num_spaces, :integer do
      arg :filters, :space_filters
      resolve &SpaceResolver.get_num_subspaces/3
    end

    connection field :sections, node_type: :post do
      resolve &SpaceResolver.get_task_sections/2
    end

    connection field :wiki_topics, node_type: :post do
      resolve &SpaceResolver.get_wiki_topics/2
    end

    connection field :views, node_type: :view do
      arg :purpose, list_of(:string)
      arg :default_view, :boolean
      resolve &SpaceResolver.get_views/2
    end

    field :roles, list_of(:role) do
      resolve &SpaceResolver.get_space_roles/3
    end

    field :role, :role do
      arg :role_id, non_null(:integer)
      resolve &SpaceResolver.get_space_role_by_id/3
    end

    field :curr_user, non_null(:space_user) do
      resolve &SpaceResolver.get_curr_user/3
    end

    field :permissions, :role do
      resolve &SpaceResolver.get_space_user_permissions/3
    end

    field :num_users, :integer do
      resolve &SpaceResolver.get_num_users/3
    end

    connection field :posts, node_type: :post do
      arg :filter_types, list_of(:string)
      arg :sort_by, :string
      arg :view_purpose, :string
      arg :hierarchy, :boolean
      arg :include_all_types, :boolean
      arg :exclude_parent_types, list_of(non_null(:string))
      arg :exclude_post_ids, list_of(non_null(:id))
      resolve &SpaceResolver.get_space_posts_query/2
    end

    field :num_posts, :integer do
      arg :filter_types, list_of(:string)
      arg :view_purpose, :string
      arg :hierarchy, :boolean
      arg :exclude_parent_types, list_of(non_null(:string))
      resolve &SpaceResolver.get_num_posts/3
    end

    connection field :relations, node_type: :post_relation do
      arg :filter_types, list_of(:string)
      resolve &SpaceResolver.get_space_relations/2
    end


    connection field :tags, node_type: :space_tag do
      resolve &SpaceResolver.get_space_tags/2
    end
  end

  connection node_type: :space

  defp space_id_fetcher(space, _expr) do
    to_string(space.space_id)
  end

  node object :space_tag, id_fetcher: &space_tag_id_fetcher/2 do
    field :tag, :string
    field :pinned, :boolean
    field :post_count, :integer
  end

  defp space_tag_id_fetcher(space_tag, _expr) do
    space_tag.tag
  end

  connection node_type: :space_tag

  object :space_user_role do
    field :space_user_id, :integer
    field :user_id, :integer
    field :role_id, :integer
  end

  node object :space_user, id_fetcher: &space_user_id_fetcher/2 do
    field :space_user_id, (:id)
    field :space_id, non_null(:id)
    field :user_id, non_null(:integer)
    field :request_type, :string
    field :accepted, :boolean
    field :request, :boolean
    field :type, :string
    field :index, :integer
    field :roles, list_of(:role)
    field :last_room_id, :integer
    field :unread_messages_num, :integer do
      resolve &SpaceResolver.get_space_unread_messages_num/3
    end
    field :unread_messages, :boolean do
      resolve &SpaceResolver.get_space_unread_messages/3
    end
    field :user, :user
    field :space, :space
  end

  def space_user_id_fetcher(space_user, _expr) do
    if !!Map.get(space_user, :space_id) and !!Map.get(space_user, :user_id) do
      to_string(space_user.space_id) <> to_string(space_user.user_id)
    else
      nil
    end
  end

  connection node_type: :space_user

  node object :space_post, id_fetcher: &space_post_id_fetcher/2  do
    field :deleted, :boolean
    field :pinned, :boolean
    field :wiki, :boolean
    field :index, :integer
    field :completed, :boolean
    field :space_id, :integer
    field :start_date, :string
    field :end_date, :string
    field :type, :string
    field :board_id, :integer
    field :hidden, :boolean
    field :space, :space do
      resolve &SpaceResolver.get_space_post_space/3
    end
    field :section_id, :integer
    field :post, :post
    field :space_post_id, :integer
  end

  connection node_type: :space_post

  defp space_post_id_fetcher(space_post, _expr) do
    if Map.get(space_post, :space_post_id) do
      to_string(space_post.space_post_id)
    else
      Enum.random(1..1_000) |> to_string
    end
  end

  object :space_queries do
    @desc "Validate invite link"
    field :validate_invite_link, :space_user do
      arg :key, :string
      resolve &SpaceResolver.validate_invite_link/3
    end

    @desc "Get all spaces in a list"
    connection field :spaces, node_type: :space do
      arg :filters, :space_filters
      arg :space_ids, list_of(:string)
      resolve &SpaceResolver.get_spaces/2
    end

    @desc "Get a single space by id"
    field :space, :space do
      arg :space_id, :integer
      resolve &SpaceResolver.get_space_by_id/3
    end

    @desc "Get recommended groups"
    connection field :recommended_groups, node_type: :space do
      resolve &SpaceResolver.recommended_groups/2
    end


    field :space_graph, :graph do
      arg :space_id, non_null(:integer)
      arg :filter_types, list_of(:string)
      arg :sort_by, :string
      arg :view_purpose, :string
      arg :hierarchy, :boolean
      arg :include_all_types, :boolean
      arg :exclude_parent_types, list_of(non_null(:string))
      arg :exclude_post_ids, list_of(non_null(:id))
      resolve &SpaceResolver.get_graph/3
    end
  end

  input_object :invite_users_space_input do
    field :user_ids, list_of(:integer)
    field :space_id, :integer
  end

  input_object :create_space_input do
    field :parent_space_id, :integer
    field :project, :boolean
    field :project_type, :string
    field :access_type, non_null(:string)
    field :type, non_null(:string)
    field :name, non_null(:string)
    field :description, :string
    field :space_type, :string
    field :address, :string
    field :latitude, :decimal
    field :profilepic, :string
    field :bannerpic, :string
    field :longitude, :decimal
    field :causes, list_of(:string)
    field :invite_all_space_members, :boolean
    field :invited_user_ids, list_of(:integer)
    field :invited_group_ids, list_of(:integer)
    field :invited_role_ids, list_of(:integer)
    field :emails, list_of(:string)
    field :created_from_post_id, :integer
  end

  input_object :rule_input do
    field :name, :string
    field :description, :string
  end

  input_object :archive_space_input do
    field :space_id, :integer
  end

  input_object :update_space_input do
    field :project_type, :string
    field :space_type, :string
    field :access_type, :string
    field :type, :string
    field :name, :string
    field :description, :string
    field :space_id, non_null(:integer)
    field :address, :string
    field :latitude, :decimal
    field :longitude, :decimal
    field :profilepic, :string
    field :default_banner, :string
    field :bannerpic, :string
    field :rules, list_of(:rule_input)
  end

  object :create_space_output do
    field :space_edge, :space_edge
    field :referencing_post, :post
  end

  input_object :join_space_input do
    field :space_id, non_null(:integer)
    field :type, non_null(:string)
    field :request_type, :string
  end

  object :deleted_space_user_output do
    field :curr_user, non_null(:space_user)
    field :deleted_space_user_id, :id
  end

  input_object :update_space_user_input do
    field :space_user_id, non_null(:integer)
    field :type, :string
    field :accepted, :boolean
    field :request, :boolean
    field :request_type, :string
  end

  input_object :leave_space_user_input do
    field :space_user_id, non_null(:integer)
  end

  object :invite_user_output do
    field :user_edges, list_of(:user_edge)
  end

  object :join_space do
    field :user_edge, :user_edge
  end

  input_object :pin_space_post_input do
    field :space_post_id, non_null(:integer)
    field :pinned, non_null(:boolean)
  end

  object :space_mutations do
    @desc "Invite users to space"
    field :invite_users_space, type: :invite_user_output do
      arg :input, :invite_users_space_input
      resolve &SpaceResolver.space_invite_users/3
    end

    field :create_space, type: :create_space_output do
      arg :input, :create_space_input
      resolve &SpaceResolver.create_space/3
    end

    field :update_space, type: :space do
      arg :input, :update_space_input
      resolve &SpaceResolver.update_space/3
    end

    field :archive_space, type: :space do
      arg :input, :archive_space_input
      resolve &SpaceResolver.archive_space/3
    end

    field :join_space, type: :join_space do
      arg :input, :join_space_input
      resolve &SpaceResolver.join_space/3
    end

    field :update_space_user, type: :space_user do
      arg :input, :update_space_user_input
      resolve &SpaceResolver.update_space_user/3
    end

    field :pin_space_post, type: :space_post do
      arg :input, :pin_space_post_input
      resolve &SpaceResolver.pin_space_post/3
    end

    field :remove_space_user, type: :deleted_space_user_output do
      arg :input, :leave_space_user_input
      resolve &SpaceResolver.remove_space_user/3
    end
  end
end

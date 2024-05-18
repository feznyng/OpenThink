defmodule OpenthinkBackendWeb.Schema.PostTypes do
  use Absinthe.Schema.Notation
  require Logger
  use Absinthe.Relay.Schema.Notation, :modern
  alias OpenthinkBackendWeb.{PostResolver, NotificationResolver, PostQueries}
  import_types(Absinthe.Plug.Types)

  node object :attribute, id_fetcher: &attribute_id_fetcher/2 do
    field :attribute_id, :integer
    field :post_id, :integer
    field :index, :integer
    field :name, :string
    field :type, :string
    field :options, :json
    field :created_at, :string
    field :question, :string
    field :description, :string
  end

  connection node_type: :attribute

  defp attribute_id_fetcher(attribute, _expr) do
    to_string(attribute.attribute_id)
  end

  node object :attribute_value, id_fetcher: &attribute_value_id_fetcher/2 do
    field :attribute_id, :integer
    field :post_id, :integer
    field :created_at, :string
    field :created_by, :integer
    field :attribute_value_id, :integer
    field :text_value, :string
    field :multi_text_value, list_of(:string)
    field :number_value, :string
    field :date_value, :datetime
    field :bool_value, :boolean

  end

  connection node_type: :attribute_value

  defp attribute_value_id_fetcher(attribute, _expr) do
    to_string(attribute.attribute_value_id)
  end

  node object :poll, id_fetcher: &poll_id_fetcher/2  do
    field :attribute, :attribute
    field :total, :integer
    field :selected_option, :string
    field :selected_options, list_of(:string)
    field :options, list_of(:poll_option)
  end

  defp poll_id_fetcher(poll, _expr) do
    to_string(poll.attribute.post_id)
  end

  object :graph do
    field :nodes, list_of(:post)
    field :edges, list_of(:post_relation)
  end

  object :poll_option do
    field :value, :string
    field :votes, :integer
  end

  node object :post, id_fetcher: &post_id_fetcher/2 do
    interface :image_item
    interface :has_posts
    interface :has_views
    field :color, :string
    field :post_id, :integer
    field :created_by, :integer
    field :title, :string
    field :profilepic, :string
    field :body, :string
    field :type, :string
    field :deleted, :boolean
    field :created_at, :string
    field :updated_at, :string
    field :link, :string
    field :edited, :boolean
    field :anonymous, :boolean
    field :start_date, :datetime
    field :end_date, :string
    field :completed, :boolean
    field :priority, :integer
    field :file_format, :string
    field :subtype, :string
    field :file_size, :integer
    field :space_referenced_id, :integer
    field :due_date, :string
    field :latitude, :decimal
    field :longitude, :decimal
    field :address, :string
    field :visibility, :integer
    field :delta, :json
    field :icon, :string
    field :bannerpic, :string
    field :default_banner, :string
    field :author, :user
    field :num_downvotes, :integer
    field :num_upvotes, :integer
    field :vote_value, :integer
    field :num_comments, :integer
    field :subscription, :post_subscription do
      resolve &NotificationResolver.get_post_subscriptions/3
    end
    field :space_referenced, :space do
      resolve &PostResolver.get_space_referenced/3
    end
    connection field :attributes, node_type: :attribute do
      resolve &PostResolver.get_attributes/2
    end

    field :attribute_values, list_of(:attribute_value) do
      arg :post_id, :integer
      arg :space_id, :integer
      resolve &PostResolver.get_attribute_values/2
    end

    connection field :users, node_type: :user do
      arg :user_types, list_of(:string)
      resolve &PostResolver.get_users/2
    end
    connection field :spaces, node_type: :space do
      resolve &PostResolver.get_post_spaces/2
    end
    connection field :reactions, node_type: :reaction do
      resolve &PostResolver.get_reactions/2
    end
    connection field :comments, node_type: :message do
      resolve &PostResolver.get_comments/2
    end
    connection field :tags, node_type: :post_tag do
      resolve &PostResolver.get_tags/2
    end

    connection field :path, node_type: :post do
      arg :space_id, non_null(:integer)
      arg :count, :integer
      arg :reverse, :boolean
      resolve &PostResolver.get_path/2
    end

    connection field :posts, node_type: :post do
      arg :filter_types, list_of(:string)
      arg :sort_by, :string
      arg :space_id, :integer
      arg :view_purpose, :string
      arg :exclude_parent_types, list_of(non_null(:string))
      arg :exclude_post_ids, list_of(non_null(:id))
      resolve &PostResolver.get_related_posts/2
    end

    field :num_posts, :integer do
      arg :filter_types, list_of(:string)
      arg :exclude_parent_types, list_of(non_null(:string))
      arg :completed, :boolean
      resolve &PostResolver.get_num_related_posts/3
    end

    field :my_vote, :post_vote do
      resolve &PostResolver.get_my_vote/3
    end

    field :invite, :post_user do
      resolve &PostResolver.get_invite/3
    end

    field :poll, :poll do
      resolve &PostResolver.get_poll/3
    end

    connection field :views, node_type: :view do
      arg :purpose, list_of(:string)
      arg :default_view, :boolean
      resolve &PostResolver.get_views/2
    end

    @desc "If the post was fetched from a space this field will be populated with the corresponding space_post"
    field :space_post, :space_post do
      arg :space_id, :integer
      arg :key, :string
      resolve &PostResolver.get_space_post/2
    end

    @desc "Get space user information for the author depending on location"
    field :space_author, :space_user do
      arg :space_id, :integer
      resolve &PostResolver.get_space_user/2
    end

    @desc "If the post was fetched using its relation to another this field will be populated with that relation"
    field :parent_relation, :post_relation

    connection field :attachments, node_type: :post do
      resolve &PostResolver.get_attachments/2
    end
  end

  connection node_type: :post

  defp post_id_fetcher(post, _expr) do
    to_string(Map.get(post, :post_id))
  end

  node object :post_relation, id_fetcher: &post_relation_id_fetcher/2 do
    field :post1_id, :integer
    field :post2_id, :integer
    field :space_id, :integer
    field :index, :integer
    field :pinned, :boolean
    field :relation_id, :integer
    field :created_at, :datetime
    field :user_id, :integer
  end

  connection node_type: :post_relation

  defp post_relation_id_fetcher(relation, _expr) do
    if Map.has_key?(relation, :relation_id) do
      to_string(relation.relation_id)
    else
      Enum.random(1..1_000) |> to_string
    end
  end

  node object :post_vote, id_fetcher: &post_vote_id_fetcher/2 do
    field :post_vote_id, :integer
    field :post_id, :integer
    field :upvote, :boolean
    field :vote, :integer
    field :space_id, :integer
    field :user_id, :integer
  end

  connection node_type: :post_vote

  defp post_vote_id_fetcher(post_vote, _expr) do
    to_string(post_vote.user_id) <> ":" <> to_string(post_vote.post_id)
  end

  node object :post_user, id_fetcher: &post_user_id_fetcher/2 do
    field :post_id, :integer
    field :user_id, :integer
    field :type, :string
    field :relations, :boolean
    field :edits, :boolean
    field :comments, :boolean
    field :user, :user
  end



  def post_user_id_fetcher(post_user, _expr) do
    type = if Enum.member?(PostQueries.get_event_user_types, post_user.type) do
      "RSVP"
    else
      post_user.type
    end
    to_string(post_user.user_id) <> ":" <> to_string(post_user.post_id) <> ":" <> to_string(type)
  end

  node object :post_tag, id_fetcher: &post_tag_id_fetcher/2 do
    field :post_id, :integer
    field :tag_id, :integer
    field :attached, :boolean
    field :tag, :string
  end

  defp post_tag_id_fetcher(post_tag, _expr) do
    to_string(post_tag.post_tag_id)
  end

  connection node_type: :post_tag


  input_object :option do
      field :option, :string
      field :image_url, :string
  end

  input_object :attribute_input do
    field :attribute_id, :integer
    field :post_id, :integer
    field :index, :integer
    field :name, :string
    field :type, :string
    field :options, list_of(:option)
    field :description, :string
  end

  input_object :attribute_value_input do
    field :attribute_id, :integer
    field :post_id, :integer
    field :value, :string
    field :list_value, list_of(:string)
  end

  input_object :space_post_input do
    field :space_id, non_null(:integer)
    field :parent_post_id, :integer
    field :index, :integer
    field :current, :boolean
  end

  input_object :file_input do
    field :title, non_null(:string)
    field :link, non_null(:string)
    field :format, non_null(:string)
    field :type, non_null(:string)
    field :size, :integer
    field :id, :string
    field :post_id, :integer
    field :description, :string
  end

  input_object :post_input do
    field :post_id, :integer
    field :title, :string
    field :delta, :json
    field :body, :string
    field :completed, :boolean
    field :bannerpic, :string
    field :icon, :string
    field :color, :string
    field :type, non_null(:string)
    field :priority, :integer
    field :due_date, :datetime
    field :start_date, :datetime
    field :end_date, :datetime
    field :latitude, :decimal
    field :longitude, :decimal
    field :space_id, :integer
    field :address, :string
    field :spaces, list_of(:space_post_input)
    field :assignees, list_of(:integer)
    field :requestees, list_of(:integer)
    field :invitees, list_of(:integer)
    field :tags, list_of(:string)
    field :attributes, list_of(:attribute_input)
    field :poll, :attribute_input
    field :attribute_values, list_of(:attribute_value_input)
    field :attachments, list_of(:file_input)
  end

  object :post_output do
    field :post_edge, :post_edge
  end

  input_object :batch_delete_post_input do
    field :post_ids, list_of(:integer)
    field :delete_relations, non_null(:boolean)
  end

  object :batch_delete_post_output do
    field :deleted_post_id, list_of(:id)
  end

  input_object :delete_post_input do
    field :post_id, non_null(:integer)
    field :delete_relations, non_null(:boolean)
  end

  object :delete_post_output do
    field :deleted_post_id, :id
    field :deleted_post, :post
  end

  input_object :reorder_space_post_input do
    field :space_id, non_null(:integer)
    field :post_id, non_null(:integer)
    field :type, non_null(:string)
    field :old_index, non_null(:integer)
    field :new_index, non_null(:integer)
  end

  input_object :reorder_related_post_input do
    field :space_id, non_null(:integer)
    field :parent_post_id, non_null(:integer)
    field :type, non_null(:string)
    field :relation_id, non_null(:integer)
    field :old_index, non_null(:integer)
    field :new_index, non_null(:integer)
  end

  input_object :vote_post_input do
    field :post_id, non_null(:integer)
    field :space_id, :integer
    field :upvote, non_null(:boolean)
  end

  object :vote_post_output do
    field :post, :post
    field :my_vote, :post_vote
  end

  input_object :add_reaction_input do
    field :name, non_null(:string)
    field :emoji, non_null(:string)
    field :post_id, :integer
    field :message_id, :integer
    field :space_id, :integer
  end

  input_object :delete_reaction_input do
    field :reaction_id, non_null(:integer)
  end

  object :add_reaction_output do
    field :new_reaction, :reaction_edge
    field :reaction, :reaction
  end

  object :delete_reaction_output do
    field :deleted_reaction_id, :id
    field :reaction, :reaction
  end

  input_object :move_post_input do
    field :post_id, non_null(:integer)
    field :existing_relation_id, :integer
    field :new_parent_post_id, :integer
    field :space_id, :integer
    field :index, :integer
    field :view_id, :integer
  end

  input_object :create_relation_input do
    field :post_id, non_null(:integer)
    field :parent_post_id, non_null(:integer)
    field :index, :integer
    field :space_id, :integer
    field :view_id, :integer
  end

  input_object :create_link_input do
    field :post1_title, non_null(:string)
    field :post2_title, non_null(:string)
    field :space_id, :integer
    field :view_id, :integer
  end

  input_object :delete_relation_input do
    field :relation_id, :integer
  end

  object :move_post_output do
    field :deleted_relation_id, :id
    field :deleted_post_id, :id
    field :new_parent_post_id, :id
    field :prev_parent_post_id, :id
    field :relation, :post_relation
  end

  object :delete_relation_output do
    field :deleted_relation_id, :id
  end

  input_object :poll_vote_input do
    field :post_id, non_null(:integer)
    field :attribute_id, non_null(:integer)
    field :selected, non_null(:string)
    field :attribute_type, non_null(:string)
  end

  input_object :delete_vote_post_input do
    field :post_vote_id, non_null(:integer)
  end

  input_object :rsvp_post_input do
    field :post_id, non_null(:integer)
    field :type, non_null(:string)
  end

  input_object :import_post_file_input do
    field :space_id, non_null(:integer)
    field :file, non_null(:upload)
    field :post_id, :integer
  end

  input_object :pin_related_post_input do
    field :relation_id, non_null(:integer)
    field :pinned, non_null(:boolean)
  end

  object :task_post_user_edge do
    field :user_edge, :user_edge
    field :deleted_user_id, :id
  end

  input_object :multi_complete_input do
    field :post_id, non_null(:integer)
    field :user_id, non_null(:integer)
  end

  object :post_queries do
    @desc "Search for posts"
    connection field :search_posts, node_type: :post do
      arg :query, non_null(:string)
      resolve &PostResolver.search_posts/2
    end

    @desc "Get post by id"
    field :post, :post do
      arg :post_id, :id
      resolve &PostResolver.get_post_by_id/3
    end

    field :post_graph, :graph do
      arg :post_id, non_null(:integer)
      arg :exclude_parent, :boolean
      arg :view_id, :integer # if provided filter and sort through this
      resolve &PostResolver.get_graph/3
    end
  end

  object :create_link_output do
    field :relation, :post_relation
  end

  object :post_mutations do
    @desc "Create post"
    field :create_post, :post_output do
      arg :input, non_null(:post_input)
      resolve &PostResolver.create_post/3
    end

    @desc "Update post"
    field :update_post, :post_output do
      arg :input, non_null(:post_input)
      arg :single_field, :boolean
      resolve &PostResolver.update_post/3
    end

    @desc "Multi-complete a task"
    field :multi_complete_task, :task_post_user_edge do
      arg :input, non_null(:multi_complete_input)
      resolve &PostResolver.multi_complete_task/3
    end

    @desc "Delete post"
    field :delete_post, :delete_post_output do
      arg :input, non_null(:delete_post_input)
      resolve &PostResolver.delete_post/3
    end

    @desc "Delete a bunch of posts"
    field :batch_delete_post, :batch_delete_post_output do
      arg :input, non_null(:batch_delete_post_input)
      resolve &PostResolver.batch_delete_post/3
    end

    @desc "Reorder a space post of some type"
    field :reorder_space_post_of_type, :space_post do
      arg :input, non_null(:reorder_space_post_input)
      resolve &PostResolver.reorder_space_posts_of_type/3
    end

    @desc "Reorder a related post of some type"
    field :reorder_related_post_of_type, :post_relation do
      arg :input, non_null(:reorder_space_post_input)
      resolve &PostResolver.reorder_space_posts_of_type/3
    end

    @desc "Create reaction"
    field :add_reaction, :add_reaction_output do
      arg :input, non_null(:add_reaction_input)
      resolve &PostResolver.add_reaction/3
    end

    @desc "Delete reaction"
    field :delete_reaction, :delete_reaction_output do
      arg :input, non_null(:delete_reaction_input)
      resolve &PostResolver.delete_reaction/3
    end

    @desc "Move a post from one parent post to another"
    field :move_post, :move_post_output do
      arg :input, non_null(:move_post_input)
      resolve &PostResolver.move_post/3
    end

    @desc "Create relation between two existing posts"
    field :create_relation, :post_output do
      arg :input, non_null(:create_relation_input)
      resolve &PostResolver.create_relation/3
    end

    @desc "Create relation between two existing posts using their titles"
    field :create_link, :create_link_output do
      arg :input, non_null(:create_link_input)
      resolve &PostResolver.create_link/3
    end

    @desc "Delete a relation"
    field :delete_relation, :delete_relation_output do
      arg :input, non_null(:delete_relation_input)
      resolve &PostResolver.delete_relation/3
    end

    @desc "Add or change vote"
    field :vote_post, :vote_post_output do
      arg :input, non_null(:vote_post_input)
      resolve &PostResolver.change_post_vote/3
    end

    @desc "Delete vote"
    field :delete_vote_post, :vote_post_output do
      arg :input, non_null(:delete_vote_post_input)
      resolve &PostResolver.delete_post_vote/3
    end

    @desc "Vote or change vote on a poll post"
    field :vote_poll, :attribute_value do
      arg :input, non_null(:poll_vote_input)
      resolve &PostResolver.vote_poll/3
    end

    @desc "Rsvp post"
    field :rsvp_post, :post_user do
      arg :input, non_null(:rsvp_post_input)
      resolve &PostResolver.rsvp_post/3
    end

    @desc "Import posts using a csv"
    field :import_post_file, :string do
      arg :input, non_null(:import_post_file_input)
      resolve &PostResolver.import_post_file/3
    end

    @desc "Pin related post"
    field :pin_related_post, :post_relation do
      arg :input, non_null(:pin_related_post_input)
      resolve &PostResolver.pin_related_post/3
    end
  end
end

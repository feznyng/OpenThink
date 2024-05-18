defmodule OpenthinkBackend.Role do
  use Ecto.Schema

  @primary_key {:role_id, :id, autogenerate: true}

  schema "roles" do
    field :space_id, :integer
    field :name, :string
    field :color, :string
    field :description, :string
    field :moderator, :boolean
    field :post_types, :string
    field :create_post, :boolean
    field :delete_post, :boolean
    field :pin_post, :boolean
    field :wiki_post, :boolean
    field :create_relation, :boolean
    field :delete_relation, :boolean
    field :display_separate, :boolean
    field :visualize_posts, :boolean
    field :cross_post, :boolean
    field :live_posts, :boolean
    field :post_visibility, :boolean
    field :post_as, :boolean
    field :manage_tags, :boolean
    field :use_any_tag, :boolean
    field :manage_general_settings, :boolean
    field :mentionable, :boolean
    field :manage_roles, :boolean
    field :invite_users, :boolean
    field :create_invite, :boolean
    field :change_nickname, :boolean
    field :manage_nickname, :boolean
    field :remove_users, :boolean
    field :ban_users, :boolean
    field :manage_subgroups, :boolean
    field :manage_projects, :boolean
    field :visualize_group, :boolean
    field :view_people, :boolean
    field :manage_custom_emoji, :boolean
    field :manage_sections, :boolean
    field :manage_assignees, :boolean
    field :view_tasks, :boolean
    field :view_events, :boolean
    field :view_calendar, :boolean
    field :manage_events, :boolean
    field :view_text_channels, :boolean
    field :access_messages, :boolean
    field :send_messages, :boolean
    field :manage_channels, :boolean
    field :manage_message_settings, :boolean
    field :create_shared_channels, :boolean
    field :message_embed_links, :boolean
    field :post_embed_links, :boolean
    field :post_attach_files, :boolean
    field :message_attach_files, :boolean
    field :manage_relations, :boolean
    field :repost, :boolean
    field :manage_shared_projects, :boolean
    field :default_role, :boolean
    field :post_add_reactions, :boolean
    field :message_add_reactions, :boolean
    field :manage_rules, :boolean
    field :manage_messages, :boolean
    field :index, :integer
    field :type, :string
    field :mention_universal, :boolean
    field :manage_categories, :boolean
    many_to_many :users, OpenthinkBackend.User, join_through: "space_user_roles", join_keys: [role_id: :role_id, space_user_id: :space_user_id]
  end
end

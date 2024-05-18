defmodule OpenthinkBackend.Post do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:post_id, :id, autogenerate: true}

  schema "posts" do
    field :title, :string
    field :body, :string
    field :type, :string
    field :deleted, :boolean
    field :deleted_at, :utc_datetime
    field :created_at, :utc_datetime
    field :created_by, :integer
    field :updated_at, :utc_datetime
    field :link, :string
    field :edited, :boolean
    field :subtype, :string
    field :file_format, :string
    field :file_size, :integer
    field :anonymous, :boolean
    field :completed, :boolean
    field :priority, :integer
    field :due_date, :date
    field :start_date, :utc_datetime
    field :end_date, :utc_datetime
    field :latitude, :decimal
    field :longitude, :decimal
    field :address, :string
    field :delta, :map
    field :color, :string
    field :icon, :string
    field :space_referenced_id, :integer
    field :bannerpic, :string
    field :vote_value, :integer, virtual: true
    field :num_upvotes, :integer, virtual: true
    field :num_downvotes, :integer, virtual: true
    field :num_comments, :integer, virtual: true
    field :nr, :integer, virtual: true
    field :relation_id, :integer, virtual: true
    has_one :author, OpenthinkBackend.User, references: :created_by, foreign_key: :user_id
    has_one :space_author, OpenthinkBackend.SpaceUser, foreign_key: :space_user_id
    has_many :attributes, OpenthinkBackend.Attribute, foreign_key: :post_id
    has_many :users, OpenthinkBackend.PostUser, foreign_key: :post_id

    many_to_many :tags, OpenthinkBackend.Tag, join_through: "post_tags", join_keys: [post_id: :post_id, tag_id: :tag_id]
    many_to_many :spaces, OpenthinkBackend.Space, join_through: "space_posts", join_keys: [post_id: :post_id, space_id: :space_id]

    has_one :parent_relation, OpenthinkBackend.PostRelation, references: :post_id, foreign_key: :post2_id
    has_one :referenced_space, OpenthinkBackend.Space, references: :space_referenced_id, foreign_key: :space_id
    has_one :space_post, OpenthinkBackend.SpacePost, references: :post_id, foreign_key: :post_id
  end

  @editable_fields [:title, :body, :color, :bannerpic, :space_referenced_id, :delta, :icon, :type, :priority, :due_date, :start_date, :latitude, :longitude, :address, :updated_at, :completed]

  def changeset(post, params \\ %{}) do
    post
    |> cast(params, [:created_by, :link, :file_size, :file_format, :subtype] ++ @editable_fields)
    |> validate_required([:created_by])
  end

  def update_changeset(post, params \\ %{}) do
    post
    |> cast(params, @editable_fields)
  end
  def delete_changeset(post, params \\ %{}) do
    post
    |> cast(params, [:deleted, :deleted_at])
    |> validate_required([:deleted, :deleted_at])
  end
end

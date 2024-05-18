defmodule OpenthinkBackend.Space do
  use Ecto.Schema
  import Ecto.Changeset
  require Logger

  @primary_key {:space_id, :id, autogenerate: true}

  schema "spaces" do
    field :name, :string
    field :description, :string
    field :bannerpic, :string
    field :profilepic, :string
    field :city, :boolean
    field :state, :boolean
    field :longitude, :decimal
    field :latitude, :decimal
    field :created_at, :utc_datetime
    field :created_by, :integer
    field :hidden, :boolean
    field :info, :map
    field :address, :string
    field :project, :boolean
    field :start_date, :date
    field :archived, :boolean
    field :end_date, :date
    field :type, :string
    field :space_type, :string
    field :rules, {:array, :map}
    field :access_type, :string
    field :default_banner, :string
    field :post_created_at, :utc_datetime, virtual: true
    belongs_to :personal_user, OpenthinkBackend.User, references: :user_id
    field :project_type, :string
    belongs_to :parent_space, OpenthinkBackend.Space
    has_many :rooms, OpenthinkBackend.Room, foreign_key: :space_id
    has_one :curr_user, OpenthinkBackend.SpaceUser, foreign_key: :space_id
    has_one :space_post, OpenthinkBackend.SpacePost, foreign_key: :space_id
    has_many :roles, OpenthinkBackend.Role, foreign_key: :space_id
    many_to_many :users, OpenthinkBackend.User, join_through: "space_users", join_keys: [space_id: :space_id, user_id: :user_id]
    many_to_many :posts, OpenthinkBackend.Post, join_through: "space_posts", join_keys: [space_id: :space_id, post_id: :post_id]
  end

  @editable_fields [:name, :type, :access_type, :profilepic, :bannerpic, :rules, :description, :address, :latitude, :project_type, :longitude, :project, :space_type]
  def changeset(space, params \\ %{}) do
    space
    |> cast(params, @editable_fields ++ [:created_by, :name, :parent_space_id, :type, :access_type, :description, :address, :latitude, :project_type, :longitude, :project, :space_type])
    |> validate_required([:created_by, :type, :access_type, :name])
  end

  def update_changeset(space, params \\ %{}) do
    space
    |> cast(params, @editable_fields)
  end

  def archive_changeset(space, params \\ %{}) do
    space
    |> cast(params, [:archived])
    |> validate_required([:archived])
  end
end

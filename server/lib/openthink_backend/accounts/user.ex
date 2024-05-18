defmodule OpenthinkBackend.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias OpenthinkBackend.{Repo}
  require Logger
  @primary_key {:user_id, :id, autogenerate: true}


  schema "users" do
    field :firstname, :string
    field :lastname, :string
    field :name, :string
    field :email, :string
    field :profilepic, :string
    field :bannerpic, :string
    field :phonenumber, :integer
    field :address, :string
    field :city, :boolean
    field :state, :boolean
    field :longitude, :decimal
    field :latitude, :decimal
    field :hash, :string
    field :salt, :string
    field :profession, :string
    field :pronouns, :string
    field :bio, :string
    field :created_at, :utc_datetime
    field :updated_at, :utc_datetime
    field :birthdate, :date
    field :ip_address, :string
    field :unread_messages, :boolean
    field :google_id, :string
    field :default_banner, :string
    field :admin, :boolean
    field :last_room_id, :integer
    field :dark_mode, :boolean
    field :productivity_view, :boolean
    field :old_hash, :boolean
    field :password, :string, virtual: true
    many_to_many :spaces, OpenthinkBackend.Space, join_through: "space_users", join_keys: [user_id: :user_id, space_id: :space_id]
    has_many :messages, OpenthinkBackend.Message, foreign_key: :message_id
    has_one :connection, OpenthinkBackend.Connection, foreign_key: :user1_id
    has_one :space_user, OpenthinkBackend.SpaceUser, foreign_key: :user_id
    has_many :room_users, OpenthinkBackend.RoomUser, foreign_key: :user_id
    has_one :post_user, OpenthinkBackend.PostUser, foreign_key: :user_id
  end

  @doc """
  A user changeset for registration.

  It is important to validate the length of both email and password.
  Otherwise databases may truncate the email without warnings, which
  could lead to unpredictable or insecure behaviour. Long passwords may
  also be very expensive to hash for certain algorithms.

  ## Options

    * `:hash_password` - Hashes the password so it can be stored securely
      in the database and ensures the password field is cleared to prevent
      leaks in the logs. If password hashing is not needed and clearing the
      password field is not desired (like when using this changeset for
      validations on a LiveView form), this option can be set to `false`.
      Defaults to `true`.
  """
  def registration_changeset(user, attrs, nil) do
    user
    |> cast(attrs, [:email, :password, :firstname, :lastname])
    |> validate_email()
    |> validate_password()
  end

  def registration_changeset(user, attrs, skip_password: true) do
    user
    |> cast(attrs, [:email, :password, :firstname, :lastname])
    |> validate_email()
  end

  defp validate_email(changeset) do
    changeset
    |> validate_required([:email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:email, max: 160)
    |> unsafe_validate_unique(:email, OpenthinkBackend.Repo)
    |> unique_constraint(:email)
  end

  defp validate_password(changeset) do
    changeset
    |> validate_required([:password])
    |> validate_length(:password, min: 12, max: 72)
    # |> validate_format(:password, ~r/[a-z]/, message: "at least one lower case character")
    # |> validate_format(:password, ~r/[A-Z]/, message: "at least one upper case character")
    # |> validate_format(:password, ~r/[!?@#$%^&*_0-9]/, message: "at least one digit or punctuation character")
    |> hash_password()
  end

  defp hash_password(changeset) do
    password = get_change(changeset, :password)
    if password && changeset.valid? do
      changeset
      |> put_change(:hash, Pbkdf2.hash_pwd_salt(password))
      |> delete_change(:password)
    else
      changeset
    end
  end

  @doc """
  A user changeset for changing the email.

  It requires the email to change otherwise an error is added.
  """
  def email_changeset(user, attrs) do
    user
    |> cast(attrs, [:email])
    |> validate_email()
    |> case do
      %{changes: %{email: _}} = changeset -> changeset
      %{} = changeset -> add_error(changeset, :email, "did not change")
    end
  end

  @doc """
  A user changeset for changing the password.

  ## Options

    * `:hash_password` - Hashes the password so it can be stored securely
      in the database and ensures the password field is cleared to prevent
      leaks in the logs. If password hashing is not needed and clearing the
      password field is not desired (like when using this changeset for
      validations on a LiveView form), this option can be set to `false`.
      Defaults to `true`.
  """
  def password_changeset(user, attrs) do
    user
    |> cast(attrs, [:password, :old_hash])
    |> put_change(:old_hash, false)
    |> validate_confirmation(:password, message: "does not match password")
    |> validate_password()
  end

  def password_changeset(user, attrs, override_requirements: true) do
    user
    |> cast(attrs, [:password, :old_hash])
    |> put_change(:old_hash, false)
    |> hash_password()
  end

  @doc """
  Confirms the account by setting `confirmed_at`.
  """
  def confirm_changeset(user) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    change(user, confirmed_at: now)
  end

  def unconfirm_changeset(user) do
    change(user, confirmed_at: nil)
  end

  @doc """
  Verifies the password.

  If there is no user or the user doesn't have a password, we call
  `Argon2.no_user_verify/0` to avoid timing attacks.
  """
  def valid_password?(user, password)
      when is_binary(user.hash) and byte_size(password) > 0 do
    Pbkdf2.check_pass(user.hash, password)
  end

  def valid_password?(_, _) do
    Pbkdf2.no_user_verify()
    false
  end

  @doc """
  Validates the current password otherwise adds an error to the changeset.
  """
  def validate_current_password(changeset, password) do
    if valid_password?(changeset.data, password) do
      changeset
    else
      add_error(changeset, :current_password, "is not valid")
    end
  end


  def temp_changeset(user, attrs \\ %{}) do
    user
    |> cast(attrs, [:firstname, :lastname, :name, :ip_address])
  end

  def set_last_room_id_changeset(space_user, attrs \\ %{}) do
    space_user
    |> cast(attrs, [
      :last_room_id,
      ])
    |> validate_required([
      :last_room_id,
    ])
  end

  def current_page_changeset(user, attrs \\ %{}) do
    user
    |> cast(attrs, [
      :current_page,
      ])
    |> validate_required([
      :current_page,
    ])
  end

  def toggle_prefs_changeset(user, attrs \\ %{}) do
    user
    |> cast(attrs, [:dark_mode, :productivity_view])
  end
end

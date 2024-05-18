defmodule OpenthinkBackend.Mention do
  use Ecto.Schema

  @primary_key {:mention_id, :id, autogenerate: true}

  schema "mentions" do
    has_one :user_id, OpenthinkBackend.User, foreign_key: :user_id
    has_one :post_id, OpenthinkBackend.Post, foreign_key: :post_id
    belongs_to :message, OpenthinkBackend.Message, references: :message_id

  end
end

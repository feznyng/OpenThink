defmodule OpenthinkBackendWeb.Schema.TagTypes do
  use Absinthe.Schema.Notation
  import OpenthinkBackendWeb.TagResolver
  use Absinthe.Relay.Schema.Notation, :modern
  require Logger

  connection node_type: :string

  node object :user_tag, id_fetcher: &user_tag_id_fetcher/2 do
    field :user_id, :integer
    field :user_tag_id, :integer
    field :tag, :string
  end

  connection node_type: :user_tag

  defp user_tag_id_fetcher(user_tag, _expr) do
    "user_tag:" <> user_tag.tag <> ":" <> to_string(user_tag.user_id)
  end


  node object :tag, id_fetcher: &tag_id_fetcher/2 do
    field :info, :string
  end

  connection node_type: :tag

  defp tag_id_fetcher(tag, _expr) do
    tag.info
  end

  object :tag_queries do
    @desc "Get all causes"
    connection field :causes, node_type: :string do
      arg :query, :string
      resolve &get_topics/2
    end

    @desc "Get all skills"
    connection field :skills, node_type: :string do
      arg :query, :string
      resolve &get_skills/2
    end

    @desc "Get posts for a given tag optionally from a specific space"
    connection field :tag_posts, node_type: :post do
      arg :tag, non_null(:string)
      arg :space_id, :integer
      resolve &get_tag_posts/2
    end

    field :num_tag_posts, :integer do
      arg :tag, non_null(:string)
      arg :space_id, :integer
      resolve &get_num_tag_posts/3
    end

    field :user_tag, :user_tag do
      arg :tag, non_null(:string)
      resolve &get_user_tag/3
    end

    @desc "Search for tags"
    connection field :search_tags, node_type: :string do
      arg :query, non_null(:string)
      resolve &search_tags/2
    end

    @desc "Search for tags"
    connection field :tags, node_type: :string do
      resolve &get_tags/2
    end
  end

  input_object :subscribe_tag do
    field :tag, non_null(:string)
  end

  input_object :change_skills_input do
    field :items, non_null(list_of(non_null(:string)))
  end

  object :tag_mutations do
    @desc "Subscribe to a tag"
    field :toggle_subscribe_tag, type: :user_tag do
      arg :input, :subscribe_tag
      resolve &toggle_subscribe_tag/3
    end

    field :save_skills, type: list_of(:string) do
      arg :input, :change_skills_input
      resolve &change_skills/3
    end

    field :save_topics, type: list_of(:string) do
      arg :input, :change_skills_input
      resolve &change_topics/3
    end
  end
end

defmodule OpenthinkBackendWeb.Schema do
  use Absinthe.Schema
  alias OpenthinkBackend.{DataLoaderSource}
  require Logger

  use Absinthe.Relay.Schema, :modern

  interface :image_item do
    field :profilepic, :string
    field :bannerpic, :string
    field :default_banner, :string
    resolve_type fn
      %{age: _}, _ -> :person
      %{employee_count: _}, _ -> :business
      _, _ -> nil
    end
  end

  interface :section_item do
    field :sections, :post_connection # for tasks
    #field :calendars, :post_connection # for events
    #field :topics, :post_connection # for wiki
    #field :folders, :post_connection # for attachments
    #field :albums, :post_connection # for media
    #field :guides, :post_connection # for quizzes + media + attachments
    resolve_type fn
      %{user_id: _}, _ -> :user
      %{space_id: _}, _ -> :space
      _, _ -> nil
    end
  end

  interface :has_views do
    field :views, :view_connection do
      arg :first, :integer
      arg :after, :string
    end

    resolve_type fn
      %{post_id: _}, _ -> :post
      %{space_id: _}, _ -> :space
      _, _ -> nil
    end
  end

  interface :has_posts do
    field :posts, :post_connection do
      arg :first, :integer
      arg :after, :string
      arg :filter_types, list_of(:string)
      arg :sort_by, :string
      arg :view_purpose, :string
      arg :include_all_types, :boolean
      arg :hierarchy, :boolean
      arg :exclude_post_ids, list_of(non_null(:id))
      arg :exclude_parent_types, list_of(non_null(:string))
    end

    field :num_posts, :integer do
      arg :filter_types, list_of(:string)
      arg :hierarchy, :boolean
      arg :exclude_parent_types, list_of(non_null(:string))
    end

    resolve_type fn
      %{post_id: _}, _ -> :post
      %{space_id: _}, _ -> :space
      _, _ -> nil
    end
  end

  node interface do
    resolve_type fn
      %OpenthinkBackend.User{}, _ ->
        :user
      %OpenthinkBackend.Space{}, _ ->
        :space
      %OpenthinkBackend.SpaceUser{}, _ ->
        :space_user
      %OpenthinkBackend.Room{}, _ ->
        :room
      %OpenthinkBackend.RoomUser{}, _ ->
        :room_user
      %OpenthinkBackend.Message{}, _ ->
        :message
      %OpenthinkBackend.Reaction{}, _ ->
        :reaction
      %OpenthinkBackend.Post{}, _ ->
        :post
      %{tag: _tag, post_count: _post_count}, _ ->
        :space_tag
      _, _ ->
        nil
    end
  end

  def context(ctx) do
    loader =
      Dataloader.new
      |> Dataloader.add_source(DataLoaderSource, DataLoaderSource.data())

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  import_types OpenthinkBackendWeb.Schema.SpaceTypes
  import_types OpenthinkBackendWeb.Schema.MessageTypes
  import_types OpenthinkBackendWeb.Schema.DatabaseTypes
  import_types OpenthinkBackendWeb.Schema.UserTypes
  import_types OpenthinkBackendWeb.Schema.NotificationTypes
  import_types OpenthinkBackendWeb.Schema.PostTypes
  import_types OpenthinkBackendWeb.Schema.ReactionTypes
  import_types OpenthinkBackendWeb.Schema.TagTypes
  import_types Absinthe.Type.Custom
  import_types OpenthinkBackendWeb.Schema.CustomTypes


  query do
    node field do
      resolve fn
        %{type: :room, id: id}, res ->
          OpenthinkBackendWeb.MessageResolver.get_room_by_id(%{}, %{room_id: id}, res)
        %{type: :user, id: id}, res ->
          OpenthinkBackendWeb.UserResolver.get_user_by_id(%{}, %{user_id: id}, res)
        %{type: :space, id: id}, res ->
          OpenthinkBackendWeb.SpaceResolver.get_space_by_id(%{}, %{space_id: id}, res)
        %{type: :post, id: id}, res ->
          OpenthinkBackendWeb.PostResolver.get_post_by_id(%{}, %{post_id: id}, res)
        %{type: :space_tag, id: _id}, _res ->
          # TODO: Fetch a single space_tag by its name
          nil
        %{type: :space_user, id: _id}, _res ->
          # TODO: Fetch a single space_tag by its name
          nil
        %{type: :reaction, id: _id}, _res ->
           # TODO: Fetch a reaction by its id
          nil
      end
    end
    import_fields :space_queries
    import_fields :message_queries
    import_fields :user_queries
    import_fields :post_queries
    import_fields :tag_queries
  end

  mutation do
    import_fields :message_mutations
    import_fields :user_mutations
    import_fields :space_mutations
    import_fields :tag_mutations
    import_fields :post_mutations
    import_fields :database_mutations
    import_fields :notification_mutations
  end

  subscription do
    import_fields :message_subscriptions
    import_fields :user_subscriptions
    import_fields :notification_subscriptions
  end
end

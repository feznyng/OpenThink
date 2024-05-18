defmodule OpenthinkBackend.DataLoaderSource do
  require Logger


  def data() do
    Dataloader.Ecto.new(OpenthinkBackend.Repo, query: &query/2)
  end



  def query(OpenthinkBackend.RoomUser, _params) do
    OpenthinkBackend.RoomUser
  end

  def query(queryable, _params) do
    queryable
  end
end

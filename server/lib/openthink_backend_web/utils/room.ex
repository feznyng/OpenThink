defmodule OpenthinkBackendWeb.RoomUtils do
  require Logger
  def generate_room_name_and_icon(room, users, user_id) do
    other_users = Enum.filter(users, fn user -> user.user_id != user_id end)
    other_user = Enum.at(other_users, 0)

    cond do
      room.dm ->
        %{name: "#{other_user.firstname} #{other_user.lastname}", profilepic: other_user.profilepic, other_user: other_user}
      is_nil(room.name) ->
        name = other_users
        |> Enum.with_index
        |> Enum.reduce(
          "",
          fn {user, index}, acc ->
            "#{user.firstname}#{if index == Enum.count(other_users) - 1 do "," else "" end} #{acc}"
          end
        )
        %{name: name, profilepic: room.profilepic, other_user: other_user}
      true ->
        %{name: room.name, profilepic: room.profilepic, other_user: other_user}
    end
  end
end

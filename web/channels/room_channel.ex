defmodule Anna.RoomChannel do
  use Phoenix.Channel
  use HTTPotion.Base
  require IEx
  alias Anna.Message
  alias Anna.Repo
  require Logger

  @doc """
  Authorize socket to subscribe and broadcast events on this channel & topic

  Possible Return Values

  `{:ok, socket}` to authorize subscription for channel for requested topic

  `:ignore` to deny subscription/broadcast on this channel
  for the requested topic
  """
  def join("rooms:en", message, socket) do
    Process.flag(:trap_exit, true)
    # :timer.send_interval(5000, :ping)
    send(self, {:after_join, message})

    {:ok, socket}
  end

  def join("rooms:it", message, socket) do
    Process.flag(:trap_exit, true)
    # :timer.send_interval(5000, :ping)
    send(self, {:after_join, message})

    {:ok, socket}
  end

  def join("rooms:" <> _private_subtopic, _message, _socket) do
    {:error, %{reason: "10......................

    "}}
  end

  def handle_info({:after_join, msg}, socket) do
    Logger.debug "> join #{socket.topic}"
    broadcast! socket, "user:entered", %{user: msg["user"]}
    push socket, "join", %{status: "connected"}
    {:noreply, socket}
  end

  # def handle_info(:ping, socket) do
#    push socket, "new:msg", %{user: "SYSTEM", body: "ping"}
#    {:noreply, socket}
#  end

  def terminate(reason, _socket) do
    Logger.debug"> leave #{inspect reason}"
    :ok
  end

  def handle_in("new:msg", msg, socket) do
    # IEx.pry
    broadcast! socket, "new:msg", %{user: msg["user"], body: msg["body"]}

    Anna.Endpoint.broadcast_from! self(), get_other_room(socket.topic), "new:msg", %{user: msg["user"], body: translate(msg["body"], socket.topic)}
    changeset = Message.changeset(%Message{}, %{content: msg["body"], owner: msg["user"], language: msg["language"]})
    Repo.insert!(changeset)
    {:reply, {:ok, %{msg: msg["body"]}}, assign(socket, :user, msg["user"])}
  end

  def translate(source, room) do
    source_language = get_language(:room, room)
    target_language = get_other_language(:language, source_language)
    response = HTTPotion.get(URI.encode("https://www.googleapis.com/language/translate/v2?q=#{source}&target=#{target_language}&format=text&source=#{source_language}&key="))
    available_translations = Poison.Parser.parse!(response.body)["data"]["translations"]
    case length(available_translations) do
      0 -> ""
      _ ->  [he | ta] = available_translations
            he["translatedText"]
    end
  end

  def get_other_room(room) do

    case room do
        "rooms:en" -> "rooms:it"
        _ ->  "rooms:en"
      end
   end

   def get_language(:room, room) do
      case room do
          "rooms:en" -> "en"
          _ ->  "it"
      end
   end

    def get_other_language(:language,language ) do
       case language do
           "en" -> "it"
           _ ->  "en"
       end
    end
end

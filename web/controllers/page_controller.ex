defmodule Anna.PageController do
  use Anna.Web, :controller
  alias Anna.Message
  alias Anna.Repo
  import Ecto.Query, only: [from: 2]

  def index(conn, _params) do
    query = from(m in Message, order_by: [desc: m.inserted_at], limit: 10)
    render conn, "index.html", messages: Repo.all(query)
  end
end

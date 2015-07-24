defmodule Anna.PageController do
  use Anna.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end

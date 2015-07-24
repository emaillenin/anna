defmodule Anna.Router do
  use Anna.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
  end

  socket "/ws", Anna do
    channel "rooms:*", RoomChannel
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Anna do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", Anna do
  #   pipe_through :api
  # end
end

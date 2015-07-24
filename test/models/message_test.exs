defmodule Anna.MessageTest do
  use Anna.ModelCase

  alias Anna.Message

  @valid_attrs %{content: "some content", language: "some content", owner: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Message.changeset(%Message{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Message.changeset(%Message{}, @invalid_attrs)
    refute changeset.valid?
  end
end

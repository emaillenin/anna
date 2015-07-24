defmodule Anna.Message do
  use Anna.Web, :model

  schema "messages" do
    field :content, :string
    field :owner, :string
    field :language, :string

    timestamps
  end

  @required_fields ~w(content owner language)
  @optional_fields ~w()

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
  end
end

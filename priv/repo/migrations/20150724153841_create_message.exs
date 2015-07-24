defmodule Anna.Repo.Migrations.CreateMessage do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :content, :string
      add :owner, :string
      add :language, :string

      timestamps
    end

  end
end

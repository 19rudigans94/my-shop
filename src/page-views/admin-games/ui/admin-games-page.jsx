"use client";

import AdminCatalogPage from "@/features/admin-catalog/ui/admin-catalog-page";
import GameForm from "@/features/admin-catalog/ui/game-form";

export default function GamesAdminPage() {
  return (
    <AdminCatalogPage
      endpoint="/api/protected/games"
      itemsKey="games"
      pageTitle="Управление играми"
      addLabel="Добавить игру"
      editTitle="Редактировать игру"
      addTitle="Добавить новую игру"
      deleteMessage="Вы уверены, что хотите удалить эту игру?"
      renderForm={(item, onSubmit, onCancel) => (
        <GameForm game={item} onSubmit={onSubmit} onCancel={onCancel} />
      )}
    />
  );
}

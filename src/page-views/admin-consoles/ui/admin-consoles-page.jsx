"use client";

import AdminCatalogPage from "@/features/admin-catalog/ui/admin-catalog-page";
import ConsoleForm from "@/features/admin-catalog/ui/console-form";

export default function ConsolesAdminPage() {
  return (
    <AdminCatalogPage
      endpoint="/api/protected/consoles"
      itemsKey="consoles"
      pageTitle="Управление консолями"
      addLabel="Добавить консоль"
      editTitle="Редактировать консоль"
      addTitle="Добавить новую консоль"
      deleteMessage="Вы уверены, что хотите удалить эту консоль?"
      renderForm={(item, onSubmit, onCancel) => (
        <ConsoleForm console={item} onSubmit={onSubmit} onCancel={onCancel} />
      )}
    />
  );
}

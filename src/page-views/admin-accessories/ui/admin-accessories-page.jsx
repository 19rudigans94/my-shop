"use client";

import AdminCatalogPage from "@/features/admin-catalog/ui/admin-catalog-page";
import AccessoryForm from "@/features/admin-catalog/ui/accessory-form";

export default function AccessoriesAdminPage() {
  return (
    <AdminCatalogPage
      endpoint="/api/protected/accessories"
      itemsKey="accessories"
      pageTitle="Управление аксессуарами"
      addLabel="Добавить аксессуар"
      editTitle="Редактировать аксессуар"
      addTitle="Добавить новый аксессуар"
      deleteMessage="Вы уверены, что хотите удалить этот аксессуар?"
      renderForm={(item, onSubmit, onCancel) => (
        <AccessoryForm accessory={item} onSubmit={onSubmit} onCancel={onCancel} />
      )}
    />
  );
}

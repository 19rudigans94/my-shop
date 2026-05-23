"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import ConfirmDialog from "@/shared/ui/confirm-dialog";
import { useToast } from "@/shared/ui/toast";

export default function AdminCatalogPage({
  endpoint,
  itemsKey,
  pageTitle,
  addLabel,
  editTitle,
  addTitle,
  deleteMessage = "Это действие нельзя отменить.",
  renderForm,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка при загрузке");
      setItems(data[itemsKey]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(`${endpoint}/${deleteTargetId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка при удалении");
      toast.success("Элемент успешно удалён");
      fetchItems();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = editingItem ? `${endpoint}/${editingItem._id}` : endpoint;
      const method = editingItem ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка при сохранении");
      toast.success(editingItem ? "Изменения сохранены" : "Элемент добавлен");
      setIsEditing(false);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const closeModal = () => {
    setIsEditing(false);
    setEditingItem(null);
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsEditing(true);
          }}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors shadow-sm"
        >
          {addLabel}
        </button>
      </div>

      {/* Поиск */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Изображение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  На складе
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    {searchQuery
                      ? `Ничего не найдено по запросу "${searchQuery}"`
                      : "Элементов пока нет"}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <img
                          src={item.images?.[0] || "/images/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.stock ?? "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium mr-4"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(item._id)}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно редактирования */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingItem ? editTitle : addTitle}
            </h2>
            {renderForm(editingItem, handleSubmit, closeModal)}
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить элемент?"
        message={deleteMessage}
        confirmLabel="Удалить"
        confirmVariant="danger"
      />
    </div>
  );
}

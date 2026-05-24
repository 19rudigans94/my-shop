"use client";

import { useState, useEffect } from "react";
import Modal from "@/shared/ui/modal";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import ConfirmDialog from "@/shared/ui/confirm-dialog";
import { useToast } from "@/shared/ui/toast";

export default function AdminKeysPage() {
  const [disksData, setDisksData] = useState([]);
  const [digitalData, setDigitalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [digitalModalData, setDigitalModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentialModalData, setCredentialModalData] = useState({ login: "", password: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [diskFields, setDiskFields] = useState({ newStock: 0, newPrice: 0, usedStock: 0, usedPrice: 0 });
  const { toast } = useToast();

  const fetchDisksData = async () => {
    try {
      const response = await fetch("/api/admin/keys");
      const result = await response.json();
      if (result.success) {
        setDisksData(result.data);
      } else {
        toast.error(result.error || "Ошибка загрузки дисков");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchDigitalData = async () => {
    try {
      const response = await fetch("/api/admin/digital");
      const result = await response.json();
      if (result.success) {
        setDigitalData(result.data);
      } else {
        toast.error(result.error || "Ошибка загрузки цифровых копий");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDisksData(), fetchDigitalData()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdate = async (diskId, condition, price, stock, gameId) => {
    try {
      const response = await fetch("/api/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diskId, condition, price, stock, gameId }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchDisksData();
        setModalData(null);
        setIsModalOpen(false);
        toast.success("Данные диска обновлены");
      } else {
        toast.error(result.error || "Ошибка обновления");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDigitalUpdate = async (type, data) => {
    try {
      setIsLoading(true);

      if (type === "add_credential") {
        const response = await fetch("/api/admin/digital", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "add_credential",
            setId: digitalModalData.setId,
            credential: {
              login: credentialModalData.login.trim(),
              password: credentialModalData.password.trim(),
            },
          }),
        });
        const result = await response.json();
        if (!result.success) {
          toast.error(result.error || "Ошибка добавления учётных данных");
          return;
        }
        await fetchDigitalData();
        setCredentialModalData({ login: "", password: "" });
        setDigitalModalData(null);
        setIsDigitalModalOpen(false);
        toast.success("Учётные данные добавлены");
      }

      if (type === "create_set") {
        const response = await fetch("/api/admin/digital", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "create_set",
            gameId: digitalModalData.gameId,
            platform: digitalModalData.platform,
            price: Number(digitalModalData.price),
            credential: digitalModalData.credential,
          }),
        });
        const result = await response.json();
        if (!result.success) {
          toast.error(result.error || "Ошибка создания набора");
          return;
        }
        await fetchDigitalData();
        setDigitalModalData(null);
        setIsDigitalModalOpen(false);
        toast.success("Набор цифровых копий создан");
      }

      if (type === "update_set") {
        const response = await fetch("/api/admin/digital", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "update_set",
            setId: data.setId,
            isActive: data.isActive,
          }),
        });
        const result = await response.json();
        if (!result.success) {
          toast.error(result.error || "Ошибка обновления набора");
          return;
        }
        await fetchDigitalData();
        toast.success("Статус набора обновлён");
      }
    } catch (error) {
      toast.error("Произошла ошибка при обновлении");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitalDelete = (operation, data) => {
    const message =
      operation === "delete_set"
        ? "Удалить набор цифровых копий? Все учётные данные в наборе будут удалены."
        : "Удалить эти учётные данные?";

    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: async () => {
        try {
          const payload = { operation, ...data };
          const response = await fetch("/api/admin/digital", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          if (result.success) {
            await fetchDigitalData();
            toast.success("Удалено успешно");
          } else {
            toast.error(result.error || "Ошибка при удалении");
          }
        } catch (err) {
          toast.error(err.message);
        }
      },
    });
  };

  const openDiskModal = (data) => {
    setModalData(data);
    setDiskFields({
      newStock: data.newStock,
      newPrice: data.newPrice,
      usedStock: data.usedStock,
      usedPrice: data.usedPrice,
    });
    setIsModalOpen(true);
  };

  const openDigitalModal = (data) => {
    if (data.type === "add_set") {
      data.modalTitle = "Добавить новый набор цифровых копий";
    } else if (data.type === "add_credential") {
      data.modalTitle = "Добавить учётные данные";
    } else if (data.type === "update_set") {
      data.modalTitle = "Редактировать набор";
    }
    setDigitalModalData(data);
    setIsDigitalModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10">
      {/* Физические диски */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
          Физические диски
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {["Игра", "Новые", "Б/У", "Действия"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {disksData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                      Данных нет
                    </td>
                  </tr>
                ) : (
                  disksData.map((item) => (
                    <tr
                      key={item.gameId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {item.gameTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {item.newStock} шт. × {item.newPrice} ₸
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {item.usedStock} шт. × {item.usedPrice} ₸
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            openDiskModal({
                              gameId: item.gameId,
                              diskId: item.diskId,
                              gameTitle: item.gameTitle,
                              newPrice: item.newPrice,
                              usedPrice: item.usedPrice,
                              newStock: item.newStock,
                              usedStock: item.usedStock,
                            })
                          }
                          className="text-sm px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
                        >
                          Редактировать
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Цифровые копии */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Цифровые копии
          </h2>
          <button
            onClick={() => openDigitalModal({ type: "add_set" })}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium text-sm rounded-lg transition-colors"
          >
            + Добавить набор
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {["Игра", "Платформа", "Цена", "Доступно", "Статус", "Действия"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {digitalData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                      Цифровых копий нет
                    </td>
                  </tr>
                ) : (
                  digitalData.map((game) =>
                    game.digitalSets.map((set, index) => (
                      <tr
                        key={set._id || `${game.gameId}-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {game.gameTitle}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {set.platform}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {set.price} ₸
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {Array.isArray(set.credentials)
                            ? `${set.activeCredentials} / ${set.totalCredentials}`
                            : "0 / 0"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              set.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {set.isActive ? "Активен" : "Неактивен"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() =>
                                openDigitalModal({
                                  type: "view_set",
                                  setId: set._id,
                                  gameId: game.gameId,
                                  gameTitle: game.gameTitle,
                                  platform: set.platform,
                                  price: set.price,
                                  isActive: set.isActive,
                                  credentials: set.credentials,
                                })
                              }
                              className="text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
                            >
                              Просмотр
                            </button>
                            <button
                              onClick={() =>
                                openDigitalModal({
                                  type: "add_credential",
                                  setId: set._id,
                                  gameTitle: game.gameTitle,
                                  platform: set.platform,
                                })
                              }
                              className="text-xs px-2.5 py-1 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                            >
                              + Копию
                            </button>
                            <button
                              onClick={() =>
                                handleDigitalUpdate("update_set", {
                                  setId: set._id,
                                  isActive: !set.isActive,
                                })
                              }
                              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                                set.isActive
                                  ? "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400"
                                  : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                              }`}
                            >
                              {set.isActive ? "Деакт." : "Акт."}
                            </button>
                            <button
                              onClick={() =>
                                handleDigitalDelete("delete_set", { setId: set._id })
                              }
                              className="text-xs px-2.5 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Модальное окно физических дисков */}
      <Modal isOpen={isModalOpen} onClose={() => { setModalData(null); setIsModalOpen(false); }}>
        {modalData && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {modalData.gameTitle}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Новые диски</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Количество</label>
                    <input
                      type="number"
                      value={diskFields.newStock}
                      onChange={(e) => setDiskFields((f) => ({ ...f, newStock: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Цена (₸)</label>
                    <input
                      type="number"
                      value={diskFields.newPrice}
                      onChange={(e) => setDiskFields((f) => ({ ...f, newPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Б/У диски</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Количество</label>
                    <input
                      type="number"
                      value={diskFields.usedStock}
                      onChange={(e) => setDiskFields((f) => ({ ...f, usedStock: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Цена (₸)</label>
                    <input
                      type="number"
                      value={diskFields.usedPrice}
                      onChange={(e) => setDiskFields((f) => ({ ...f, usedPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setModalData(null); setIsModalOpen(false); }}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  handleUpdate(modalData.diskId, "new", diskFields.newPrice, diskFields.newStock, modalData.gameId);
                  handleUpdate(modalData.diskId, "used", diskFields.usedPrice, diskFields.usedStock, modalData.gameId);
                }}
                className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg"
              >
                Сохранить
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Модальное окно цифровых копий */}
      <Modal
        isOpen={isDigitalModalOpen}
        onClose={() => { setDigitalModalData(null); setIsDigitalModalOpen(false); }}
      >
        {digitalModalData && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {digitalModalData.modalTitle ||
                (digitalModalData.gameTitle
                  ? `${digitalModalData.type === "view_set" ? "Просмотр" : "Редактирование"} — ${digitalModalData.gameTitle}`
                  : "Цифровые копии")}
            </h3>

            {/* Просмотр набора */}
            {digitalModalData.type === "view_set" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Игра</p>
                    <p className="font-medium text-gray-900 dark:text-white">{digitalModalData.gameTitle}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Платформа / Цена</p>
                    <p className="font-medium text-gray-900 dark:text-white">{digitalModalData.platform} · {digitalModalData.price} ₸</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleDigitalUpdate("update_set", {
                      setId: digitalModalData.setId,
                      isActive: !digitalModalData.isActive,
                    })
                  }
                  disabled={isLoading}
                  className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    digitalModalData.isActive
                      ? "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400"
                      : "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-400"
                  }`}
                >
                  {digitalModalData.isActive ? "Деактивировать набор" : "Активировать набор"}
                </button>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Учётные данные ({Array.isArray(digitalModalData.credentials) ? digitalModalData.credentials.length : 0})
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {Array.isArray(digitalModalData.credentials) && digitalModalData.credentials.length > 0 ? (
                      digitalModalData.credentials.map((cred, index) => (
                        <div
                          key={cred._id || index}
                          className="flex items-start justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="min-w-0 text-sm">
                            <p className="text-gray-900 dark:text-white font-mono truncate">{cred.login}</p>
                            <p className="text-gray-500 dark:text-gray-400 font-mono truncate">{cred.password}</p>
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-xs mt-1 ${
                                cred.isActive
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {cred.isActive ? "Активен" : "Использован"}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleDigitalDelete("delete_credential", {
                                setId: digitalModalData.setId,
                                credentialId: cred._id,
                              })
                            }
                            className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg flex-shrink-0"
                          >
                            Удалить
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">Учётных данных нет</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => { setDigitalModalData(null); setIsDigitalModalOpen(false); }}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}

            {/* Создание нового набора */}
            {digitalModalData.type === "add_set" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Игра *</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={digitalModalData.gameId || ""}
                    onChange={(e) => {
                      const opt = e.target.options[e.target.selectedIndex];
                      setDigitalModalData({ ...digitalModalData, gameId: opt.value, gameTitle: opt.text });
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Выберите игру...</option>
                    {disksData.map((game) => (
                      <option key={game.gameId} value={game.gameId}>{game.gameTitle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Платформа *</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={digitalModalData.platform || ""}
                    onChange={(e) => setDigitalModalData({ ...digitalModalData, platform: e.target.value })}
                    disabled={isLoading}
                  >
                    <option value="">Выберите платформу...</option>
                    <option value="PS5">PlayStation 5</option>
                    <option value="PS4">PlayStation 4</option>
                    <option value="PC">PC</option>
                    <option value="XBOX">Xbox</option>
                    <option value="Switch">Nintendo Switch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Цена (₸) *</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={digitalModalData.price || ""}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setDigitalModalData({ ...digitalModalData, price: !isNaN(v) ? v : "" });
                    }}
                    disabled={isLoading}
                  />
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Первые учётные данные (необязательно)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Логин</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        value={digitalModalData.credential?.login || ""}
                        onChange={(e) =>
                          setDigitalModalData({
                            ...digitalModalData,
                            credential: { ...digitalModalData.credential, login: e.target.value },
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Пароль</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        value={digitalModalData.credential?.password || ""}
                        onChange={(e) =>
                          setDigitalModalData({
                            ...digitalModalData,
                            credential: { ...digitalModalData.credential, password: e.target.value },
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => { setDigitalModalData(null); setIsDigitalModalOpen(false); }}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (!digitalModalData.gameId) { toast.error("Выберите игру"); return; }
                      if (!digitalModalData.platform) { toast.error("Выберите платформу"); return; }
                      if (!digitalModalData.price) { toast.error("Укажите цену"); return; }
                      const hasLogin = !!digitalModalData.credential?.login;
                      const hasPass = !!digitalModalData.credential?.password;
                      if ((hasLogin && !hasPass) || (!hasLogin && hasPass)) {
                        toast.error("Заполните оба поля учётных данных или оставьте пустыми");
                        return;
                      }
                      handleDigitalUpdate("create_set", digitalModalData);
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900 font-medium rounded-lg"
                  >
                    {isLoading ? "Сохранение..." : "Создать набор"}
                  </button>
                </div>
              </div>
            )}

            {/* Добавление учётных данных */}
            {digitalModalData.type === "add_credential" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Игра</p>
                    <p className="font-medium text-gray-900 dark:text-white">{digitalModalData.gameTitle}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Платформа</p>
                    <p className="font-medium text-gray-900 dark:text-white">{digitalModalData.platform}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Логин *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={credentialModalData.login}
                    onChange={(e) => setCredentialModalData({ ...credentialModalData, login: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пароль *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={credentialModalData.password}
                    onChange={(e) => setCredentialModalData({ ...credentialModalData, password: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setDigitalModalData(null);
                      setIsDigitalModalOpen(false);
                      setCredentialModalData({ login: "", password: "" });
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (!credentialModalData.login?.trim()) { toast.error("Введите логин"); return; }
                      if (!credentialModalData.password?.trim()) { toast.error("Введите пароль"); return; }
                      handleDigitalUpdate("add_credential", {
                        setId: digitalModalData.setId,
                        credential: {
                          login: credentialModalData.login.trim(),
                          password: credentialModalData.password.trim(),
                        },
                      });
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900 font-medium rounded-lg"
                  >
                    {isSubmitting ? "Сохранение..." : "Добавить"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Диалог подтверждения */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, message: "", onConfirm: null })}
        onConfirm={() => confirmDialog.onConfirm?.()}
        title="Подтвердите удаление"
        message={confirmDialog.message}
        confirmLabel="Удалить"
        confirmVariant="danger"
      />
    </div>
  );
}

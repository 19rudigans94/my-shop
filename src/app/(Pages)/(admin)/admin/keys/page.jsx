"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";

const PLATFORMS = [
  "PS5",
  "PS4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "PC",
];

export default function AdminKeysPage() {
  const [disksData, setDisksData] = useState([]);
  const [digitalData, setDigitalData] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [digitalModalData, setDigitalModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDigitalId, setSelectedDigitalId] = useState(null);
  const [credentialModalData, setCredentialModalData] = useState({
    login: "",
    password: "",
  });
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [success, setSuccess] = useState(null);

  // Функция загрузки данных о физических дисках
  const fetchDisksData = async () => {
    try {
      const response = await fetch("/api/admin/keys");
      const result = await response.json();
      if (result.success) {
        setDisksData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Функция загрузки данных о цифровых копиях
  const fetchDigitalData = async () => {
    try {
      const response = await fetch("/api/admin/digital");
      const result = await response.json();
      if (result.success) {
        // Данные теперь структурированы по-другому - наборы копий с учетными данными внутри
        console.log(result.data, "result.data");
        setDigitalData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Функция загрузки всех игр
  const fetchAllGames = async () => {
    try {
      const response = await fetch("/api/protected/games");
      const result = await response.json();
      if (result.success) {
        setAllGames(result.games || []);
      }
    } catch (err) {
      console.error("Ошибка при загрузке игр:", err);
    }
  };

  // Загрузка всех данных
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDisksData(), fetchDigitalData(), fetchAllGames()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Обработчик обновления физических дисков
  const handleUpdate = async (
    diskId,
    newPrice,
    newStock,
    usedPrice,
    usedStock,
    gameId,
    platform
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/admin/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diskId: diskId || null,
          gameId,
          platform: platform || undefined,
          newPrice: newPrice !== undefined ? parseFloat(newPrice) : undefined,
          newStock: newStock !== undefined ? parseInt(newStock) : undefined,
          usedPrice:
            usedPrice !== undefined ? parseFloat(usedPrice) : undefined,
          usedStock: usedStock !== undefined ? parseInt(usedStock) : undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchDisksData();
        setModalData(null);
        setIsModalOpen(false);
        setSuccess("Данные успешно сохранены");
      } else {
        setError(result.error || "Ошибка при сохранении данных");
      }
    } catch (err) {
      setError(err.message || "Произошла ошибка при сохранении данных");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функция валидации данных
  const validateDigitalData = (data) => {
    if (!data.gameId) return "Выберите игру";
    if (!data.platform) return "Выберите платформу";
    if (!data.price || data.price < 0) return "Укажите корректную цену";
    return null;
  };

  // Улучшенный обработчик обновления цифровых копий
  const handleDigitalUpdate = async (type, data) => {
    try {
      setIsLoading(true);
      setError(null);

      if (type === "add_credential") {
        const response = await fetch("/api/admin/digital", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          setError(result.error || "Ошибка при добавлении учетных данных");
          return;
        }

        await fetchDigitalData();
        setCredentialModalData({ login: "", password: "" });
        setDigitalModalData(null);
        setIsDigitalModalOpen(false);
        setSuccess("Учетные данные успешно добавлены");
      }

      if (type === "create_set") {
        const response = await fetch("/api/admin/digital", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          setError(result.error || "Ошибка при создании набора");
          return;
        }

        await fetchDigitalData();
        setDigitalModalData(null);
        setIsDigitalModalOpen(false);
        setSuccess("Набор цифровых копий успешно создан");
      }

      if (type === "update_set") {
        const response = await fetch("/api/admin/digital", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "update_set",
            setId: data.setId,
            isActive: data.isActive,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.error || "Ошибка при обновлении набора");
          return;
        }

        await fetchDigitalData();
        setSuccess("Статус набора успешно обновлен");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      setError("Произошла ошибка при обновлении данных");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик удаления набора цифровых копий или отдельных учетных данных
  const handleDigitalDelete = async (operation, data) => {
    const confirmMessage =
      operation === "delete_set"
        ? "Вы уверены, что хотите удалить этот набор цифровых копий? Это действие удалит все учетные данные в наборе."
        : "Вы уверены, что хотите удалить эти учетные данные?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const payload = { operation, ...data };

      const response = await fetch("/api/admin/digital", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        await fetchDigitalData();
      } else {
        setError(result.error);
        alert(`Ошибка: ${result.error}`);
      }
    } catch (err) {
      setError(err.message);
      alert(`Ошибка: ${err.message}`);
    }
  };

  // Обработчик открытия модального окна для физических дисков
  const openDiskModal = (data) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  // Обработчик открытия модального окна для цифровых копий
  const openDigitalModal = (data) => {
    // Добавляем дополнительную информацию о типе операции если нужно
    if (data.type === "add_set") {
      data.modalTitle = "Добавить новый набор цифровых копий";
    } else if (data.type === "add_credential") {
      data.modalTitle = "Добавить учетные данные в набор";
    } else if (data.type === "update_set") {
      data.modalTitle = "Редактировать набор цифровых копий";
    }

    setDigitalModalData(data);
    setIsDigitalModalOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;
    // Логика удаления
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Ошибка!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Секция физических дисков */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Управление физическими дисками</h2>
          <button
            onClick={() =>
              openDiskModal({
                type: "add",
                modalTitle: "Добавить новый физический диск",
              })
            }
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            Добавить диск
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Игра
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Платформа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Новые
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Б/У
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {disksData.map((item, index) => (
                <tr
                  key={`${item.gameId}-${
                    item.platform || "no-platform"
                  }-${index}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{item.gameTitle}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">
                      {item.platform || "Не указана"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {item.newStock} шт. × {item.newPrice}₸
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {item.usedStock} шт. × {item.usedPrice}₸
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        openDiskModal({
                          gameId: item.gameId,
                          diskId: item.diskId,
                          gameTitle: item.gameTitle,
                          platform: item.platform,
                          newPrice: item.newPrice,
                          usedPrice: item.usedPrice,
                          newStock: item.newStock,
                          usedStock: item.usedStock,
                        })
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Редактировать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Секция цифровых копий */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          Управление цифровыми копиями
        </h2>
        <div className="mb-4">
          <button
            onClick={() =>
              openDigitalModal({
                type: "add_set",
                modalTitle: "Добавить новый набор цифровых копий",
              })
            }
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            Добавить новый набор
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Игра
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Платформа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Доступно
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {digitalData.map((game) =>
                game.digitalSets.map((set, index) => (
                  <tr
                    key={set._id || `digital-set-${game.gameId}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">{game.gameTitle}</td>
                    <td className="px-6 py-4">{set.platform}</td>
                    <td className="px-6 py-4">{set.price} ₸</td>
                    <td className="px-6 py-4">
                      {Array.isArray(set.credentials)
                        ? `${set.activeCredentials} / ${set.totalCredentials}`
                        : "0 / 0"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          set.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {set.isActive ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
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
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
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
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Добавить копию
                      </button>
                      <button
                        onClick={() =>
                          handleDigitalUpdate("update_set", {
                            setId: set._id,
                            isActive: !set.isActive,
                          })
                        }
                        className={`${
                          set.isActive
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-emerald-500 hover:bg-emerald-600"
                        } text-white px-4 py-2 rounded text-sm transition-colors`}
                      >
                        {set.isActive ? "Деактивировать" : "Активировать"}
                      </button>
                      <button
                        onClick={() =>
                          handleDigitalDelete("delete_set", { setId: set._id })
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
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
      </section>

      {/* Модальное окно для физических дисков */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setModalData(null);
          setIsModalOpen(false);
        }}
      >
        {modalData && (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">
              {modalData.diskId
                ? "Редактирование"
                : modalData.type === "add"
                ? "Добавление нового диска"
                : "Добавление"}{" "}
              {modalData.gameTitle ? `- ${modalData.gameTitle}` : ""}
            </h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            <div className="space-y-4">
              {!modalData.gameId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Игра *
                  </label>
                  <select
                    className="border p-2 rounded w-full"
                    value={modalData.gameId || ""}
                    onChange={(e) => {
                      const selectedOption =
                        e.target.options[e.target.selectedIndex];
                      setModalData({
                        ...modalData,
                        gameId: selectedOption.value,
                        gameTitle: selectedOption.text,
                      });
                    }}
                    disabled={isSubmitting}
                  >
                    <option value="">Выберите игру...</option>
                    {allGames.map((game) => (
                      <option
                        key={game._id || game.id}
                        value={game._id || game.id}
                      >
                        {game.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Платформа *
                </label>
                <select
                  className="border p-2 rounded w-full"
                  value={modalData.platform || ""}
                  onChange={(e) => {
                    setModalData({
                      ...modalData,
                      platform: e.target.value,
                    });
                  }}
                  disabled={isSubmitting || !!modalData.diskId}
                >
                  <option value="">Выберите платформу...</option>
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                {modalData.diskId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Платформу нельзя изменить для существующего диска
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Новые диски</h4>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    min="0"
                    placeholder="Количество"
                    value={modalData.newStock ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value) || 0;
                      setModalData({
                        ...modalData,
                        newStock: value,
                      });
                    }}
                    className="border p-2 rounded w-1/2"
                    disabled={isSubmitting}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Цена"
                    value={modalData.newPrice ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value) || 0;
                      setModalData({
                        ...modalData,
                        newPrice: value,
                      });
                    }}
                    className="border p-2 rounded w-1/2"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Б/У диски</h4>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    min="0"
                    placeholder="Количество"
                    value={modalData.usedStock ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value) || 0;
                      setModalData({
                        ...modalData,
                        usedStock: value,
                      });
                    }}
                    className="border p-2 rounded w-1/2"
                    disabled={isSubmitting}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Цена"
                    value={modalData.usedPrice ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value) || 0;
                      setModalData({
                        ...modalData,
                        usedPrice: value,
                      });
                    }}
                    className="border p-2 rounded w-1/2"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setModalData(null);
                    setIsModalOpen(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setSuccess(null);

                    // Нормализация и валидация данных
                    const newPriceValue =
                      modalData.newPrice === "" ||
                      modalData.newPrice === undefined
                        ? 0
                        : parseFloat(modalData.newPrice);
                    const newStockValue =
                      modalData.newStock === "" ||
                      modalData.newStock === undefined
                        ? 0
                        : parseInt(modalData.newStock);
                    const usedPriceValue =
                      modalData.usedPrice === "" ||
                      modalData.usedPrice === undefined
                        ? 0
                        : parseFloat(modalData.usedPrice);
                    const usedStockValue =
                      modalData.usedStock === "" ||
                      modalData.usedStock === undefined
                        ? 0
                        : parseInt(modalData.usedStock);

                    // Валидация данных
                    if (!modalData.diskId && !modalData.gameId) {
                      setError("Выберите игру");
                      return;
                    }
                    if (!modalData.diskId && !modalData.platform) {
                      setError("Выберите платформу");
                      return;
                    }
                    if (
                      (newPriceValue !== undefined && isNaN(newPriceValue)) ||
                      (usedPriceValue !== undefined && isNaN(usedPriceValue))
                    ) {
                      setError("Цена должна быть числом");
                      return;
                    }
                    if (
                      (newPriceValue !== undefined && newPriceValue < 0) ||
                      (usedPriceValue !== undefined && usedPriceValue < 0)
                    ) {
                      setError("Цена не может быть отрицательной");
                      return;
                    }
                    if (
                      (newStockValue !== undefined && isNaN(newStockValue)) ||
                      (usedStockValue !== undefined && isNaN(usedStockValue))
                    ) {
                      setError("Количество должно быть числом");
                      return;
                    }
                    if (
                      (newStockValue !== undefined && newStockValue < 0) ||
                      (usedStockValue !== undefined && usedStockValue < 0)
                    ) {
                      setError("Количество не может быть отрицательным");
                      return;
                    }

                    handleUpdate(
                      modalData.diskId,
                      newPriceValue,
                      newStockValue,
                      usedPriceValue,
                      usedStockValue,
                      modalData.gameId,
                      modalData.platform
                    );
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Модальное окно для цифровых копий */}
      <Modal
        isOpen={isDigitalModalOpen}
        onClose={() => {
          setDigitalModalData(null);
          setIsDigitalModalOpen(false);
        }}
      >
        {digitalModalData && (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">
              {digitalModalData.modalTitle ||
                (digitalModalData.gameTitle
                  ? `${
                      digitalModalData.type === "view_set"
                        ? "Просмотр"
                        : "Редактирование"
                    } - ${digitalModalData.gameTitle}`
                  : "Цифровые копии")}
            </h3>

            {/* Просмотр набора цифровых копий и учетных данных */}
            {digitalModalData.type === "view_set" && (
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded border mb-6">
                  <h4 className="font-medium mb-3">Информация о наборе</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">Игра:</span>{" "}
                        {digitalModalData.gameTitle}
                      </p>
                      <p>
                        <span className="font-medium">Платформа:</span>{" "}
                        {digitalModalData.platform}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Цена:</span>{" "}
                        {digitalModalData.price} ₸
                      </p>
                      <p>
                        <span className="font-medium">Статус:</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            digitalModalData.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {digitalModalData.isActive ? "Активен" : "Неактивен"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleDigitalUpdate("update_set", {
                          setId: digitalModalData.setId,
                          isActive: !digitalModalData.isActive,
                        })
                      }
                      disabled={isSubmitting}
                      className={`${
                        digitalModalData.isActive
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-emerald-500 hover:bg-emerald-600"
                      } text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50`}
                    >
                      {isSubmitting
                        ? "Сохранение..."
                        : digitalModalData.isActive
                        ? "Деактивировать набор"
                        : "Активировать набор"}
                    </button>
                  </div>
                </div>

                <h4 className="font-medium mb-3">
                  Учетные данные в наборе (
                  {Array.isArray(digitalModalData.credentials)
                    ? digitalModalData.credentials.length
                    : 0}
                  )
                </h4>

                <div className="space-y-4">
                  {Array.isArray(digitalModalData.credentials)
                    ? digitalModalData.credentials.map((credential, index) => (
                        <div
                          key={
                            credential._id ||
                            `credential-${digitalModalData.setId}-${index}`
                          }
                          className="border p-4 rounded"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p>
                                <span className="font-medium">Логин:</span>{" "}
                                {credential.login}
                              </p>
                              <p>
                                <span className="font-medium">Пароль:</span>{" "}
                                {credential.password}
                              </p>
                              <p>
                                <span className="font-medium">Статус:</span>{" "}
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    credential.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {credential.isActive
                                    ? "Активен"
                                    : "Неактивен"}
                                </span>
                              </p>
                              {credential.createdAt && (
                                <p>
                                  <span className="font-medium">Создан:</span>{" "}
                                  {new Date(
                                    credential.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="space-x-2">
                              <button
                                onClick={() =>
                                  handleDigitalUpdate("update_credential", {
                                    setId: digitalModalData.setId,
                                    credentialId: credential._id,
                                    credentialIsActive: !credential.isActive,
                                  })
                                }
                                className={`${
                                  credential.isActive
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-green-500 hover:bg-green-600"
                                } text-white px-3 py-1 rounded text-sm transition-colors`}
                              >
                                {credential.isActive
                                  ? "Деактивировать"
                                  : "Активировать"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDigitalDelete("delete_credential", {
                                    setId: digitalModalData.setId,
                                    credentialId: credential._id,
                                  })
                                }
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    : null}

                  {(!Array.isArray(digitalModalData.credentials) ||
                    digitalModalData.credentials.length === 0) && (
                    <div className="text-center py-6 bg-gray-50 rounded">
                      <p className="text-gray-500">
                        В этом наборе пока нет учетных данных
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setDigitalModalData(null);
                      setIsDigitalModalOpen(false);
                      setError(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                    disabled={isSubmitting}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}

            {/* Добавление нового набора цифровых копий */}
            {digitalModalData?.type === "add_set" && (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Игра *
                  </label>
                  <select
                    className="border p-2 rounded w-full"
                    value={digitalModalData.gameId || ""}
                    onChange={(e) => {
                      const selectedOption =
                        e.target.options[e.target.selectedIndex];
                      setDigitalModalData({
                        ...digitalModalData,
                        gameId: selectedOption.value,
                        gameTitle: selectedOption.text,
                      });
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Выберите игру...</option>
                    {disksData.map((game) => (
                      <option key={game.gameId} value={game.gameId}>
                        {game.gameTitle}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Платформа *
                  </label>
                  <select
                    className="border p-2 rounded w-full"
                    value={digitalModalData.platform || ""}
                    onChange={(e) => {
                      setDigitalModalData({
                        ...digitalModalData,
                        platform: e.target.value,
                      });
                    }}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена (₸) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="border p-2 rounded w-full"
                    value={digitalModalData.price || ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setDigitalModalData({
                        ...digitalModalData,
                        price: !isNaN(value) ? value : "",
                      });
                    }}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Добавить учетные данные (необязательно):
                  </label>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Логин
                      </label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={digitalModalData.credential?.login || ""}
                        onChange={(e) => {
                          setDigitalModalData({
                            ...digitalModalData,
                            credential: {
                              ...digitalModalData.credential,
                              login: e.target.value,
                            },
                          });
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Пароль
                      </label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={digitalModalData.credential?.password || ""}
                        onChange={(e) => {
                          setDigitalModalData({
                            ...digitalModalData,
                            credential: {
                              ...digitalModalData.credential,
                              password: e.target.value,
                            },
                          });
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setDigitalModalData(null);
                      setIsDigitalModalOpen(false);
                      setError(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                    disabled={isLoading}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      // Валидация перед отправкой
                      if (!digitalModalData.gameId) {
                        setError("Выберите игру");
                        return;
                      }
                      if (!digitalModalData.platform) {
                        setError("Выберите платформу");
                        return;
                      }
                      if (!digitalModalData.price) {
                        setError("Укажите цену");
                        return;
                      }

                      // Проверка учетных данных, если они были введены
                      if (
                        (digitalModalData.credential?.login &&
                          !digitalModalData.credential?.password) ||
                        (!digitalModalData.credential?.login &&
                          digitalModalData.credential?.password)
                      ) {
                        setError(
                          "Заполните оба поля учетных данных или оставьте их пустыми"
                        );
                        return;
                      }

                      handleDigitalUpdate("create_set", digitalModalData);
                    }}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Сохранение..." : "Создать набор"}
                  </button>
                </div>
              </div>
            )}

            {/* Добавление новых учетных данных в существующий набор */}
            {digitalModalData.type === "add_credential" && (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <p>
                    <span className="font-medium">Игра:</span>{" "}
                    {digitalModalData.gameTitle}
                  </p>
                  <p>
                    <span className="font-medium">Платформа:</span>{" "}
                    {digitalModalData.platform}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Логин *
                  </label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={credentialModalData.login}
                    onChange={(e) => {
                      setCredentialModalData({
                        ...credentialModalData,
                        login: e.target.value,
                      });
                    }}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль *
                  </label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={credentialModalData.password}
                    onChange={(e) => {
                      setCredentialModalData({
                        ...credentialModalData,
                        password: e.target.value,
                      });
                    }}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setDigitalModalData(null);
                      setIsDigitalModalOpen(false);
                      setError(null);
                      setCredentialModalData({ login: "", password: "" });
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      // Валидация перед отправкой
                      if (!credentialModalData.login?.trim()) {
                        setError("Введите логин");
                        return;
                      }
                      if (!credentialModalData.password?.trim()) {
                        setError("Введите пароль");
                        return;
                      }

                      handleDigitalUpdate("add_credential", {
                        setId: digitalModalData.setId,
                        credential: {
                          login: credentialModalData.login.trim(),
                          password: credentialModalData.password.trim(),
                        },
                      });
                    }}
                    disabled={isSubmitting}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Сохранение..." : "Добавить"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

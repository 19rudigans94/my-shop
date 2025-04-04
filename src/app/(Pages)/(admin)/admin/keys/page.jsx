"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";

export default function AdminKeysPage() {
  const [disksData, setDisksData] = useState([]);
  const [digitalData, setDigitalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [digitalModalData, setDigitalModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);

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
        setDigitalData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Загрузка всех данных
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDisksData(), fetchDigitalData()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Обработчик обновления физических дисков
  const handleUpdate = async (diskId, condition, price, stock, gameId) => {
    try {
      const response = await fetch("/api/admin/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diskId,
          condition,
          price,
          stock,
          gameId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchDisksData();
        setModalData(null);
        setIsModalOpen(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Обработчик обновления цифровых копий
  const handleDigitalUpdate = async (copyData) => {
    try {
      const response = await fetch("/api/admin/digital", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(copyData),
      });

      const result = await response.json();
      if (result.success) {
        await fetchDigitalData();
        setDigitalModalData(null);
        setIsDigitalModalOpen(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Обработчик удаления цифровой копии
  const handleDigitalDelete = async (copyId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту цифровую копию?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/digital", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ copyId }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchDigitalData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Обработчик открытия модального окна для физических дисков
  const openDiskModal = (data) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  // Обработчик открытия модального окна для цифровых копий
  const openDigitalModal = (data) => {
    setDigitalModalData(data);
    setIsDigitalModalOpen(true);
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
        <h2 className="text-2xl font-bold mb-6">
          Управление физическими дисками
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Игра
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
              {disksData.map((item) => (
                <tr key={item.gameId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{item.gameTitle}</td>
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Игра
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Копии
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Активные
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Общая стоимость
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {digitalData.map((item) => (
                <tr key={item.gameId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{item.gameTitle}</td>
                  <td className="px-6 py-4">{item.totalCopies}</td>
                  <td className="px-6 py-4">{item.activeCopies}</td>
                  <td className="px-6 py-4">
                    {item.totalPrice.toLocaleString()} ₸
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() =>
                        openDigitalModal({
                          type: "view",
                          gameId: item.gameId,
                          gameTitle: item.gameTitle,
                          copies: item.copies,
                        })
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Просмотр
                    </button>
                    <button
                      onClick={() =>
                        openDigitalModal({
                          type: "add",
                          gameId: item.gameId,
                          gameTitle: item.gameTitle,
                        })
                      }
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Добавить
                    </button>
                  </td>
                </tr>
              ))}
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
              {modalData.diskId ? "Редактирование" : "Добавление"} -{" "}
              {modalData.gameTitle}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Новые диски</h4>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    placeholder="Количество"
                    defaultValue={modalData.newStock}
                    onChange={(e) =>
                      (modalData.newStock = parseInt(e.target.value))
                    }
                    className="border p-2 rounded w-1/2"
                  />
                  <input
                    type="number"
                    placeholder="Цена"
                    defaultValue={modalData.newPrice}
                    onChange={(e) =>
                      (modalData.newPrice = parseFloat(e.target.value))
                    }
                    className="border p-2 rounded w-1/2"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Б/У диски</h4>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    placeholder="Количество"
                    defaultValue={modalData.usedStock}
                    onChange={(e) =>
                      (modalData.usedStock = parseInt(e.target.value))
                    }
                    className="border p-2 rounded w-1/2"
                  />
                  <input
                    type="number"
                    placeholder="Цена"
                    defaultValue={modalData.usedPrice}
                    onChange={(e) =>
                      (modalData.usedPrice = parseFloat(e.target.value))
                    }
                    className="border p-2 rounded w-1/2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setModalData(null);
                    setIsModalOpen(false);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    handleUpdate(
                      modalData.diskId,
                      "new",
                      modalData.newPrice,
                      modalData.newStock,
                      modalData.gameId
                    );
                    handleUpdate(
                      modalData.diskId,
                      "used",
                      modalData.usedPrice,
                      modalData.usedStock,
                      modalData.gameId
                    );
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Сохранить
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
              {digitalModalData.type === "add" ? "Добавление" : "Просмотр"}{" "}
              цифровых копий - {digitalModalData.gameTitle}
            </h3>

            {digitalModalData.type === "view" && (
              <div className="space-y-4">
                {digitalModalData.copies.map((copy) => (
                  <div key={copy._id} className="border p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p>
                          <span className="font-medium">Логин:</span>{" "}
                          {copy.login}
                        </p>
                        <p>
                          <span className="font-medium">Пароль:</span>{" "}
                          {copy.password}
                        </p>
                        <p>
                          <span className="font-medium">Цена:</span>{" "}
                          {copy.price.toLocaleString()} ₸
                        </p>
                        <p>
                          <span className="font-medium">Статус:</span>{" "}
                          {copy.isActive ? "Активна" : "Неактивна"}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() =>
                            handleDigitalUpdate({
                              copyId: copy._id,
                              isActive: !copy.isActive,
                            })
                          }
                          className={`${
                            copy.isActive
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white px-3 py-1 rounded text-sm transition-colors`}
                        >
                          {copy.isActive ? "Деактивировать" : "Активировать"}
                        </button>
                        <button
                          onClick={() => handleDigitalDelete(copy._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {digitalModalData.type === "add" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Логин
                  </label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    onChange={(e) => (digitalModalData.login = e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль
                  </label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    onChange={(e) =>
                      (digitalModalData.password = e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена (₸)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="border p-2 rounded w-full"
                    onChange={(e) =>
                      (digitalModalData.price = parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setDigitalModalData(null);
                      setIsDigitalModalOpen(false);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() =>
                      handleDigitalUpdate({
                        gameId: digitalModalData.gameId,
                        login: digitalModalData.login,
                        password: digitalModalData.password,
                        price: digitalModalData.price || 0,
                        isActive: true,
                      })
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Сохранить
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

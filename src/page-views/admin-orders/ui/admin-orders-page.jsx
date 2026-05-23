"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Search, X } from "lucide-react";
import Modal from "@/shared/ui/modal";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import { useToast } from "@/shared/ui/toast";

const STATUS_CONFIG = {
  pending: { label: "Ожидает", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  paid: { label: "Оплачен", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  processing: { label: "Обрабатывается", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  completed: { label: "Выполнен", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Отменён", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

const PAYMENT_CONFIG = {
  pending: { label: "Ожидает", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
  successful: { label: "Успешно", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  failed: { label: "Ошибка", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

const PRODUCT_TYPE_LABELS = {
  game: "Игра",
  console: "Консоль",
  accessory: "Аксессуар",
  digital: "Цифровая копия",
  physical: "Физический диск",
};

function StatusBadge({ status, config }) {
  const cfg = config[status] ?? { label: status, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const formatPrice = (n) =>
    new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(n) + " ₸";

  return (
    <Modal isOpen={!!order} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Заказ {order.orderId}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Клиент</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{order.customerInfo?.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{order.customerInfo?.phoneNumber}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Статусы</p>
            <div className="flex flex-col gap-1">
              <StatusBadge status={order.status} config={STATUS_CONFIG} />
              <StatusBadge status={order.paymentStatus} config={PAYMENT_CONFIG} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
            Товары ({order.totalItems})
          </p>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {PRODUCT_TYPE_LABELS[item.productType] ?? item.productType}
                    {item.platform && ` · ${item.platform}`}
                    {item.condition && ` · ${item.condition === "new" ? "Новый" : "Б/У"}`}
                    {` · ${item.quantity} шт.`}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  {formatPrice(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Итого</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
        else toast.error("Не удалось загрузить заказы");
      })
      .catch(() => toast.error("Ошибка соединения"))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, mongoId, newStatus) => {
    setUpdatingId(mongoId);
    try {
      const res = await fetch(`/api/admin/orders/${mongoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) => (o._id === mongoId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Заказ ${orderId} — статус обновлён`);
    } catch (err) {
      toast.error(err.message || "Ошибка при обновлении статуса");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      !searchQuery ||
      o.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatPrice = (n) =>
    new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(n) + " ₸";

  if (loading) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Заказы</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} из {orders.length}
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по ID или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="all">Все статусы</option>
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Таблица */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <ShoppingBag className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">
              {orders.length === 0 ? "Заказов пока нет" : "Ничего не найдено"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {["ID заказа", "Email", "Товаров", "Сумма", "Статус", "Оплата", "Дата", "Действия"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[180px] truncate">
                      {order.customerInfo?.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {order.totalItems}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} config={STATUS_CONFIG} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.paymentStatus} config={PAYMENT_CONFIG} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                          Детали
                        </button>
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            handleStatusChange(order.orderId, order._id, e.target.value)
                          }
                          className="text-xs py-1.5 px-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
                        >
                          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val}>{cfg.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Monitor,
  Package,
  ShoppingBag,
  Clock,
  TrendingUp,
  Key,
  ArrowRight,
} from "lucide-react";

const STATUS_LABELS = {
  pending: { label: "Ожидает", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  paid: { label: "Оплачен", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  processing: { label: "Обрабатывается", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  completed: { label: "Выполнен", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Отменён", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

function StatCard({ icon: Icon, label, value, accent, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/orders"),
        ]);
        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (ordersData.success) setRecentOrders(ordersData.orders.slice(0, 5));
      } catch {
        // stats remain null → cards show "—"
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatPrice = (n) =>
    new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(n) + " ₸";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Панель управления</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Обзор магазина GoldGames</p>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Gamepad2} label="Игры" value={stats?.games ?? "—"} accent="bg-yellow-500" loading={loading} />
        <StatCard icon={Monitor} label="Консоли" value={stats?.consoles ?? "—"} accent="bg-blue-500" loading={loading} />
        <StatCard icon={Package} label="Аксессуары" value={stats?.accessories ?? "—"} accent="bg-green-500" loading={loading} />
        <StatCard icon={ShoppingBag} label="Заказы всего" value={stats?.orders ?? "—"} accent="bg-purple-500" loading={loading} />
      </div>

      {/* Дополнительные показатели */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Clock} label="Ожидают обработки" value={stats?.pendingOrders ?? "—"} accent="bg-orange-500" loading={loading} />
        <StatCard
          icon={TrendingUp}
          label="Выручка (оплаченные)"
          value={loading ? "—" : formatPrice(stats?.totalRevenue ?? 0)}
          accent="bg-yellow-500"
          loading={loading}
        />
      </div>

      {/* Последние заказы */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Последние заказы</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
          >
            Все заказы <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Заказов пока нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID заказа</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Сумма</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">{order.orderId}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{order.customerInfo?.email}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Быстрые ссылки */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Быстрый доступ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { href: "/admin/games", label: "Игры", icon: Gamepad2 },
            { href: "/admin/keys", label: "Ключи и диски", icon: Key },
            { href: "/admin/accessories", label: "Аксессуары", icon: Package },
            { href: "/admin/consoles", label: "Консоли", icon: Monitor },
            { href: "/admin/orders", label: "Заказы", icon: ShoppingBag },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-400 text-center">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

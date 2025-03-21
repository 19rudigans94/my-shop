"use client";

import { Search, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
// import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
// import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
// import { getRedirectPathByRole } from "@/lib/auth/roleManager";

export const IconButtons = () => {
  // const totalItems = useCartStore((state) => state.totalItems);
  const totalItems = 7;
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  // const { user } = useUserStore();
  // const router = useRouter();

  // Обработчик для кнопки профиля
  const handleProfileClick = (e) => {
    e.preventDefault();
    console.log("Profile button clicked");

    // Получаем путь перенаправления на основе роли пользователя
    // const redirectPath = getRedirectPathByRole(user);
    // router.push(redirectPath);
  };

  return (
    <div className="flex items-center space-x-4">
      <Link href="" passHref>
        <button
          className="text-gray-700 hover:text-yellow-500 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            console.log("Search button clicked");
          }}
        >
          <Search size={20} />
        </button>
      </Link>

      <Link href="#" onClick={handleProfileClick}>
        <button className="text-gray-700 hover:text-yellow-500 transition-colors">
          <User size={20} />
        </button>
      </Link>

      <div
        className="relative"
        onMouseEnter={() => setIsCartPreviewOpen(true)}
        onMouseLeave={() => setIsCartPreviewOpen(false)}
      >
        <Link href="/cart">
          <button className="text-gray-700 hover:text-yellow-500 transition-colors relative">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-yellow-500 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </Link>
      </div>
    </div>
  );
};

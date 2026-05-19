"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { styles } from "./styles";
import useCartStore from "@/app/store/useCartStore";

export default function IconButtons() {
  const router = useRouter();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="flex items-center space-x-4" suppressHydrationWarning>
      <button
        className={styles.button}
        aria-label="Корзина"
        onClick={() => router.push("/cart")}
      >
        <ShoppingCart className={styles.icon} />
        {mounted && totalItems > 0 && (
          <span className={styles.badge}>{totalItems}</span>
        )}
      </button>
    </div>
  );
}

"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { styles } from "./styles";

export default function IconButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-4">
      <button
        className={styles.button}
        aria-label="Корзина"
        onClick={() => router.push("/cart")}
      >
        <ShoppingCart className={styles.icon} />
        <span className={styles.badge}>0</span>
      </button>
    </div>
  );
}

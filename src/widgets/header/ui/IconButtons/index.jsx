"use client";
import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { styles } from "./styles";
import useCartStore from "@/features/cart/model/store";

export default function IconButtons() {
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link href="/cart" className={styles.button} aria-label="Корзина">
      <ShoppingCart className={styles.icon} />
      {mounted && totalItems > 0 && (
        <span className={styles.badge}>{totalItems}</span>
      )}
    </Link>
  );
}

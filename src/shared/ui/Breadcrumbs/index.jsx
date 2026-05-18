"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items = [], className = "" }) {
  return (
    <nav className={`flex items-center gap-1 text-xs text-white/70 ${className}`}>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-white truncate max-w-[160px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

export function LegalTOC({ sections }) {
  const [activeId, setActiveId] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <nav className="lg:w-56 shrink-0">
        <div className="lg:sticky lg:top-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Содержание
          </p>
          <ol className="space-y-1">
            {sections.map(({ id, title }, i) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`block text-sm py-1 px-2 rounded transition-colors ${
                      isActive
                        ? "text-yellow-500 font-medium bg-yellow-50 dark:bg-yellow-500/10"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {i + 1}. {title}
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {showTop && (
        <button
          onClick={scrollToTop}
          aria-label="Наверх"
          className="fixed bottom-8 right-8 z-50 w-10 h-10 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}

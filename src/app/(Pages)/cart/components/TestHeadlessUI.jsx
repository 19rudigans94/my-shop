"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function TestHeadlessUI() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-amber-500 text-white px-4 py-2 rounded-lg"
      >
        Открыть диалог
      </button>

      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium mb-2">
              Тестовый диалог
            </Dialog.Title>
            <Dialog.Description className="mb-4">
              Этот диалог использует Headless UI
            </Dialog.Description>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg"
            >
              Закрыть
            </button>
          </Dialog.Panel>
        </Dialog>
      )}
    </>
  );
}

"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import Filters from "./index";

const MobileFilters = ({
  isOpen,
  onClose,
  filters,
  setFilter,
  clearFilters,
  config,
}) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[101] lg:hidden" onClose={onClose}>
        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition>

        <div className="fixed inset-0 z-[90] flex">
          <Transition
            show={isOpen}
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white dark:bg-gray-900 py-4 pb-6 shadow-xl">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Фильтры
                </h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={onClose}
                >
                  <span className="sr-only">Закрыть</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 px-4">
                <Filters
                  filters={filters}
                  setFilter={setFilter}
                  clearFilters={clearFilters}
                  config={config}
                />
              </div>
            </Dialog.Panel>
          </Transition>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileFilters;

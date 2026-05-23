export const styles = {
  link: (isActive) =>
    `flex items-center whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-yellow-500 text-white"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    }`,
  icon: (isActive) =>
    `w-5 h-5 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`,
  text: (isActive) =>
    `font-medium ml-2 text-sm ${
      isActive ? "text-white" : "text-gray-700 dark:text-gray-300"
    }`,
  submenu: {
    container:
      "absolute top-full left-0 mt-1 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg min-w-[200px]",
    item: (isActive) =>
      `block px-4 py-2 text-sm transition-colors ${
        isActive
          ? "text-yellow-500 bg-gray-50 dark:bg-gray-700"
          : "text-gray-600 hover:text-yellow-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
      }`,
  },
};

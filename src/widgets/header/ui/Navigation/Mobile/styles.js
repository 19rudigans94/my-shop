export const styles = {
  link: (isActive) =>
    `flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 active:bg-gray-100 dark:active:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-inset ${
      isActive
        ? "text-yellow-500"
        : "text-gray-600 dark:text-gray-400 hover:text-yellow-400"
    }`,
  icon: (isActive) =>
    `w-6 h-6 ${isActive ? "text-yellow-500" : "text-gray-500 dark:text-gray-400"}`,
  text: (isActive) =>
    `text-xs font-medium ${isActive ? "text-yellow-500" : "text-gray-600 dark:text-gray-400"}`,
};

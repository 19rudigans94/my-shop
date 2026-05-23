export const styles = {
  link: (isActive) =>
    `flex items-center whitespace-nowrap px-4 py-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-yellow-500 text-white"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    }`,
  icon: (isActive) =>
    `w-5 h-5 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`,
  text: (isActive) =>
    `font-medium ml-2 text-sm ${isActive ? "text-white" : "text-gray-700 dark:text-gray-300"}`,
};

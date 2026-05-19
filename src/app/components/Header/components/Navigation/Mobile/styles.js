export const styles = {
  link: (isActive) =>
    `flex flex-col items-center justify-center space-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
      isActive
        ? "text-yellow-500"
        : "text-gray-600 dark:text-gray-400 hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`,
  icon: (isActive) =>
    `w-6 h-6 transition-all duration-200 ease-in-out transform hover:scale-110 ${
      isActive ? "text-yellow-500" : "text-gray-500 dark:text-gray-400"
    }`,
  text: (isActive) =>
    `text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
      isActive ? "text-yellow-500" : "text-gray-600 dark:text-gray-400"
    }`,
};

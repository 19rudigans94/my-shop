export default function LoadingSpinner({ fullScreen = true }) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "min-h-[50vh]"}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white" />
    </div>
  );
}

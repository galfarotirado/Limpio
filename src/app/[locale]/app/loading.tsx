export default function AppLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      {/* Greeting skeleton */}
      <div className="mb-8">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-2" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36" />
      </div>

      {/* Counter skeleton */}
      <div className="mb-4">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24 mb-3" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 h-20" />
          ))}
        </div>
      </div>

      {/* Money saved skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 mb-4 h-20" />

      {/* Next achievement skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-4 h-16" />

      {/* Crisis button skeleton */}
      <div className="h-14 bg-red-50 dark:bg-red-900/10 rounded-2xl mb-4" />

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 h-20" />
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 h-20" />
      </div>

      {/* Achievements skeleton */}
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-32 mb-3" />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-2 h-16" />
      ))}
    </div>
  )
}

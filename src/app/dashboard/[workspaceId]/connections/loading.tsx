export default function Loading() {
  return (
    <div className="p-8 animate-pulse space-y-6">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 h-32" />
        ))}
      </div>
    </div>
  )
}

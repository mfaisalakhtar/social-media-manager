export default function Loading() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-5 w-32 bg-gray-200 rounded" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 h-36" />
      ))}
    </div>
  )
}

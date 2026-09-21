export default function Loading() {
  return (
    <div className="flex flex-col h-full bg-gray-50/40">
      <div className="bg-white border-b border-gray-100 px-7 py-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded-xl" />
        </div>
      </div>
      <div className="bg-white border-b border-gray-100 px-7 py-3 animate-pulse">
        <div className="flex gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 w-16 bg-gray-100 rounded" />)}
        </div>
      </div>
      <div className="flex-1 px-7 py-5 space-y-2 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-20" />
        ))}
      </div>
    </div>
  )
}

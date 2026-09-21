export default function Loading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="flex gap-3">
          <div className="h-8 w-24 bg-gray-200 rounded-lg" />
          <div className="h-8 w-36 bg-gray-100 rounded-lg" />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200">
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-7 border-b border-gray-200">
          {[...Array(7)].map((_, i) => <div key={i} className="py-2 mx-auto h-4 w-8 bg-gray-100 rounded m-2" />)}
        </div>
        <div className="grid grid-cols-7">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="min-h-24 border-b border-r border-gray-100 p-1.5">
              <div className="h-4 w-4 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

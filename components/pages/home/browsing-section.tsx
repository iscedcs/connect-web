export function BrowserSection() {
  return (
    <div className="flex justify-center py-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 via-yellow-400 via-green-500 to-blue-500 p-1">
        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 via-yellow-400 via-green-500 to-blue-500 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-blue-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

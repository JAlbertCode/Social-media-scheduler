import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition duration-150">
                Social Scheduler
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition duration-150"
              >
                Dashboard
              </Link>
              <Link 
                href="/create"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition duration-150"
              >
                Create Post
              </Link>
              <Link 
                href="/settings/connections"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition duration-150"
              >
                Connections
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
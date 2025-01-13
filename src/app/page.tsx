'use client'

import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link href="/compose" 
              className="block w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-center">
              Create New Post
            </Link>
            <Link href="/schedule"
              className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-center">
              View Schedule
            </Link>
            <Link href="/queue"
              className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-center">
              Manage Queue
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">Post scheduled for Twitter</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Post published on LinkedIn</p>
              <p className="text-xs text-gray-400">5 hours ago</p>
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Platform Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Twitter</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>LinkedIn</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Instagram</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Not Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
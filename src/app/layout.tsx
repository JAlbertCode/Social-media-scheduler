'use client'

import { Inter } from "next/font/google"
import { useState } from "react"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white border-b">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold">Social Media Scheduler</h1>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex">
            <aside className={`w-64 bg-white border-r`}>
              <div className="h-screen sticky top-0 overflow-y-auto">
                <nav className="mt-5 px-2">
                  <Link href="/" 
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/schedule"
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    Schedule
                  </Link>
                  <Link href="/compose"
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    Compose
                  </Link>
                  <Link href="/queue"
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    Queue
                  </Link>
                </nav>
              </div>
            </aside>

            <main className="flex-1 p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
'use client'

import { useState } from 'react'
import { PlatformType } from './PostCreator'
import { PlatformFactory } from '@/lib/platforms'

interface PlatformConnectionProps {
  platform: PlatformType
  isConnected: boolean
  profileData?: {
    username: string
    displayName?: string
    profileImage?: string
  }
  onConnect: () => Promise<void>
  onDisconnect: () => Promise<void>
}

export function PlatformConnection({
  platform,
  isConnected,
  profileData,
  onConnect,
  onDisconnect
}: PlatformConnectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await onConnect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await onDisconnect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show anything if platform isn't implemented
  if (!PlatformFactory.isImplemented(platform)) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Platform Icon */}
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            {platform.charAt(0)}
          </div>

          {/* Platform Info */}
          <div>
            <h3 className="font-medium">{platform}</h3>
            {isConnected && profileData && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {profileData.profileImage && (
                  <img 
                    src={profileData.profileImage}
                    alt={profileData.username}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span>{profileData.displayName || profileData.username}</span>
              </div>
            )}
          </div>
        </div>

        {/* Connection Status & Actions */}
        <div>
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Platform Status */}
      <div className="mt-4 text-sm text-gray-500">
        {isConnected ? (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Connected and ready to post</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
            <span>Not connected</span>
          </div>
        )}
      </div>
    </div>
  )
}
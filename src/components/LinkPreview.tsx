'use client'

import React, { useEffect, useState } from 'react'
import { PlatformType } from './PostCreator'
import {
  getLinkPreview,
  supportsLinkPreview,
  formatUrl
} from '../utils/linkPreview'

interface LinkPreviewProps {
  url: string
  platform: PlatformType
  className?: string
  onError?: (error: string) => void
}

export function LinkPreview({
  url,
  platform,
  className = '',
  onError
}: LinkPreviewProps) {
  const [preview, setPreview] = useState<{
    title?: string
    description?: string
    image?: string
    domain: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true)
        const data = await getLinkPreview(url)
        setPreview(data)
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Failed to load preview')
      } finally {
        setLoading(false)
      }
    }

    if (supportsLinkPreview(platform)) {
      fetchPreview()
    } else {
      setLoading(false)
    }
  }, [url, platform, onError])

  if (!supportsLinkPreview(platform)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline break-all"
      >
        {formatUrl(url)}
      </a>
    )
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-48 bg-gray-200 rounded-t-lg" />
        <div className="p-4 border border-t-0 rounded-b-lg space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!preview) {
    return null
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block border rounded-lg overflow-hidden hover:border-gray-300 transition-colors ${className}`}
    >
      {preview.image && (
        <div className="aspect-[1.91/1] relative bg-gray-100">
          <img
            src={preview.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        {preview.title && (
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {preview.title}
          </h3>
        )}
        {preview.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {preview.description}
          </p>
        )}
        <div className="text-xs text-gray-400">
          {formatUrl(url)}
        </div>
      </div>
    </a>
  )
}
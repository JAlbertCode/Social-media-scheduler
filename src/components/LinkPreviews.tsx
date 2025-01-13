'use client'

import React, { useEffect, useState } from 'react'
import { PlatformType } from './PostCreator'
import { LinkPreview } from './LinkPreview'
import {
  extractUrls,
  validateLinks,
  calculateContentLength
} from '../utils/linkPreview'

interface LinkPreviewsProps {
  content: string
  platform: PlatformType
  onError?: (error: string) => void
}

export function LinkPreviews({
  content,
  platform,
  onError
}: LinkPreviewsProps) {
  const [urls, setUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extract URLs from content
    const foundUrls = extractUrls(content)
    
    // Validate URLs for platform
    const validation = validateLinks(foundUrls, platform)
    if (!validation.valid) {
      setError(validation.message || 'Invalid links')
      onError?.(validation.message || 'Invalid links')
    } else {
      setError(null)
    }

    setUrls(foundUrls)
  }, [content, platform, onError])

  if (error) {
    return (
      <div className="text-sm text-red-600 mt-2">
        {error}
      </div>
    )
  }

  if (urls.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {urls.map((url, index) => (
        <LinkPreview
          key={`${url}-${index}`}
          url={url}
          platform={platform}
          onError={(err) => onError?.(err)}
        />
      ))}
    </div>
  )
}
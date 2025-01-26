'use client'

import React, { useState } from 'react'
import { MediaUploader } from './MediaUploader'
import { PlatformType } from './PostCreator'
import { Box } from '@chakra-ui/react'

interface PostEditorProps {
  onSave: (content: string, media: any[], platforms: PlatformType[]) => void
  initialContent?: string
  initialPlatforms?: PlatformType[]
}

export function PostEditor({ 
  onSave,
  initialPlatforms = ['Twitter']
}: PostEditorProps) {
  const [media, setMedia] = useState<Array<{ type: 'image' | 'video'; preview: string }>>([])
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(initialPlatforms[0])

  const handleMediaSelect = (files: Array<{ type: 'image' | 'video'; preview: string }>) => {
    setMedia(files)
    // Pass the media up to the parent component for preview
    onSave('', files, [selectedPlatform])
  }

  return (
    <Box>
      <MediaUploader
        platform={selectedPlatform}
        onMediaSelect={handleMediaSelect}
      />
    </Box>
  )
}
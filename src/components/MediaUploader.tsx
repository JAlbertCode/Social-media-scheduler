'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { PlatformType } from './PostCreator'

// Platform-specific media constraints
const PLATFORM_CONSTRAINTS = {
  Twitter: {
    image: {
      maxSize: 5 * 1024 * 1024, // 5MB
      formats: ['image/jpeg', 'image/png', 'image/gif'],
      dimensions: {
        min: { width: 600, height: 335 },
        max: { width: 1200, height: 675 }
      }
    },
    video: {
      maxSize: 512 * 1024 * 1024, // 512MB
      formats: ['video/mp4'],
      maxDuration: 140, // seconds
    }
  },
  Instagram: {
    image: {
      maxSize: 30 * 1024 * 1024, // 30MB
      formats: ['image/jpeg', 'image/png'],
      dimensions: {
        square: { width: 1080, height: 1080 },
        portrait: { width: 1080, height: 1350 },
        landscape: { width: 1080, height: 608 }
      }
    },
    video: {
      maxSize: 100 * 1024 * 1024, // 100MB
      formats: ['video/mp4'],
      maxDuration: 60, // seconds for Reels
    }
  },
  LinkedIn: {
    image: {
      maxSize: 5 * 1024 * 1024,
      formats: ['image/jpeg', 'image/png', 'image/gif'],
      dimensions: {
        min: { width: 552, height: 276 },
        max: { width: 1104, height: 552 }
      }
    },
    video: {
      maxSize: 200 * 1024 * 1024,
      formats: ['video/mp4'],
      maxDuration: 600, // 10 minutes
    }
  }
} as const

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
  dimensions?: { width: number; height: number }
  duration?: number
}

interface MediaUploaderProps {
  platform: PlatformType
  onMediaSelect: (files: MediaFile[]) => void
  maxFiles?: number
}

export function MediaUploader({ platform, onMediaSelect, maxFiles = 4 }: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const validateFile = async (file: File): Promise<MediaFile | null> => {
    const constraints = PLATFORM_CONSTRAINTS[platform]
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    // Basic validation
    if (isImage && !constraints.image.formats.includes(file.type)) {
      throw new Error(`Invalid image format. Supported formats: ${constraints.image.formats.join(', ')}`)
    }
    if (isVideo && !constraints.video.formats.includes(file.type)) {
      throw new Error(`Invalid video format. Supported formats: ${constraints.video.formats.join(', ')}`)
    }

    // Size validation
    const maxSize = isImage ? constraints.image.maxSize : constraints.video.maxSize
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`)
    }

    // Create file preview
    const preview = URL.createObjectURL(file)

    // Image-specific validation
    if (isImage) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(img.src)
          resolve({
            file,
            preview,
            type: 'image',
            dimensions: {
              width: img.width,
              height: img.height
            }
          })
        }
        img.onerror = () => {
          URL.revokeObjectURL(img.src)
          reject(new Error('Failed to load image'))
        }
        img.src = preview
      })
    }

    // Video-specific validation
    if (isVideo) {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.onloadedmetadata = () => {
          if (video.duration > constraints.video.maxDuration) {
            reject(new Error(`Video too long. Maximum duration: ${constraints.video.maxDuration} seconds`))
          }
          resolve({
            file,
            preview,
            type: 'video',
            duration: video.duration,
            dimensions: {
              width: video.videoWidth,
              height: video.videoHeight
            }
          })
        }
        video.onerror = () => reject(new Error('Failed to load video'))
        video.src = preview
      })
    }

    return null
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    
    try {
      const validatedFiles = await Promise.all(
        acceptedFiles.slice(0, maxFiles).map(validateFile)
      )
      
      const newFiles = validatedFiles.filter((file): file is MediaFile => file !== null)
      setFiles(current => [...current, ...newFiles])
      onMediaSelect([...files, ...newFiles])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing files')
    }
  }, [maxFiles, files, onMediaSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': PLATFORM_CONSTRAINTS[platform].image.formats,
      'video/*': PLATFORM_CONSTRAINTS[platform].video.formats
    },
    maxFiles
  })

  const removeFile = (index: number) => {
    setFiles(current => {
      const newFiles = [...current]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      onMediaSelect(newFiles)
      return newFiles
    })
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: {[
            ...PLATFORM_CONSTRAINTS[platform].image.formats,
            ...PLATFORM_CONSTRAINTS[platform].video.formats
          ].join(', ')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type === 'image' ? (
                <img
                  src={file.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <video
                  src={file.preview}
                  className="w-full h-32 object-cover rounded"
                  controls
                />
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <div className="mt-1 text-xs text-gray-500">
                {file.dimensions && `${file.dimensions.width}×${file.dimensions.height}`}
                {file.duration && ` • ${Math.round(file.duration)}s`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
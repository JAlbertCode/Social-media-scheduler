'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploaderProps {
  onUpload: (url: string) => void
  onError?: (error: string) => void
  type?: 'image' | 'video'
  maxSize?: number // in MB
  className?: string
}

export function FileUploader({
  onUpload,
  onError,
  type = 'image',
  maxSize = 10,
  className = ''
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    try {
      setUploading(true)
      setProgress(0)

      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('maxSize', maxSize.toString())

      // Simulated upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }

      const { url } = await response.json()
      setProgress(100)
      onUpload(url)
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onUpload, onError, type, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'image' 
      ? { 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] }
      : { 'video/*': ['.mp4'] },
    maxSize: maxSize * 1024 * 1024,
    multiple: false
  })

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">Uploading... {progress}%</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the file here...</p>
        ) : (
          <p className="text-gray-500">
            Drag and drop a {type} here, or click to select
            <br />
            <span className="text-sm">
              (Maximum size: {maxSize}MB)
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
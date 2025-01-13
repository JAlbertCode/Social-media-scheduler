// Function to resize image maintaining aspect ratio
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height)
        height = maxHeight
      }

      // Create canvas and resize
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Draw image with smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        'image/jpeg',
        0.9
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Function to optimize video (placeholder for future implementation)
export async function optimizeVideo(
  file: File,
  maxDuration: number
): Promise<Blob> {
  // This would typically involve a server-side process
  // For now, we'll just return the original file if it meets the duration requirement
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.onloadedmetadata = () => {
      if (video.duration > maxDuration) {
        reject(new Error(\`Video duration exceeds \${maxDuration} seconds\`))
      } else {
        resolve(file)
      }
    }
    video.onerror = () => reject(new Error('Failed to load video'))
    video.src = URL.createObjectURL(file)
  })
}

// Function to generate thumbnail from video
export async function generateVideoThumbnail(
  file: File,
  thumbnailTime = 0
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate thumbnail'))
          }
        },
        'image/jpeg',
        0.8
      )
    }
    video.onerror = () => reject(new Error('Failed to load video'))
    video.src = URL.createObjectURL(file)
    video.currentTime = thumbnailTime
  })
}

// Helper function to check if dimensions match platform requirements
export function matchesDimensions(
  width: number,
  height: number,
  requirements: { min?: { width: number; height: number }, max?: { width: number; height: number } }
): boolean {
  const { min, max } = requirements
  
  if (min && (width < min.width || height < min.height)) {
    return false
  }
  
  if (max && (width > max.width || height > max.height)) {
    return false
  }
  
  return true
}
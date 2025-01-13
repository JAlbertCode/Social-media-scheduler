import { Storage } from '@google-cloud/storage'
import { format } from 'date-fns'

// Initialize storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET || '')

interface UploadOptions {
  userId: string
  contentType: string
  maxSizeInMB?: number
  allowedTypes?: string[]
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  options: UploadOptions
): Promise<string> {
  // Generate a unique path for the file
  const datePath = format(new Date(), 'yyyy/MM/dd')
  const uniquePath = `${options.userId}/${datePath}/${fileName}`

  // Validate file size
  if (options.maxSizeInMB) {
    const fileSizeInMB = file.length / (1024 * 1024)
    if (fileSizeInMB > options.maxSizeInMB) {
      throw new Error(`File size exceeds ${options.maxSizeInMB}MB limit`)
    }
  }

  // Validate content type
  if (options.allowedTypes && !options.allowedTypes.includes(options.contentType)) {
    throw new Error(`Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`)
  }

  // Upload file to Google Cloud Storage
  const blob = bucket.file(uniquePath)
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: options.contentType,
    },
    resumable: false
  })

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      reject(new Error('Failed to upload file: ' + err.message))
    })

    blobStream.on('finish', () => {
      // Make the file public and get its URL
      blob.makePublic()
        .then(() => {
          const publicUrl = \`https://storage.googleapis.com/\${bucket.name}/\${uniquePath}\`
          resolve(publicUrl)
        })
        .catch(reject)
    })

    blobStream.end(file)
  })
}

export async function deleteFile(filePath: string): Promise<void> {
  const file = bucket.file(filePath)
  await file.delete()
}

export async function getSignedUrl(
  filePath: string,
  expirationMinutes: number = 60
): Promise<string> {
  const file = bucket.file(filePath)
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expirationMinutes * 60 * 1000
  })
  return url
}
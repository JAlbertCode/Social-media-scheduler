import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface MediaUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: {
    [key: string]: string[];
  };
  maxSize?: number;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUpload,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'video/*': ['.mp4', '.mov', '.avi']
  },
  maxSize = 100 * 1024 * 1024 // 100MB default
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);
    try {
      await onUpload(acceptedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14m-16-4v16m-8-8h16"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <p className="font-medium">
                  {isDragActive ? 'Drop files here...' : 'Drop files or click to upload'}
                </p>
                <p className="mt-1">Images (PNG, JPG, GIF) or Videos (MP4, MOV, AVI)</p>
              </div>
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};
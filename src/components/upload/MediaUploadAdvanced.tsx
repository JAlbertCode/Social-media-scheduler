'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PLATFORM_REQUIREMENTS, PlatformType, MediaType } from '@/constants/platformRequirements';

interface MediaUploadAdvancedProps {
  onUpload: (files: File[]) => Promise<void>;
  selectedPlatforms: PlatformType[];
  contentType?: 'feed' | 'story' | 'reels';
}

export const MediaUploadAdvanced: React.FC<MediaUploadAdvancedProps> = ({
  onUpload,
  selectedPlatforms,
  contentType = 'feed'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);

  const validateFile = (file: File): string | null => {
    // Determine if it's an image or video
    const type = file.type.startsWith('image/') ? 'image' : 'video';
    setMediaType(type);

    for (const platform of selectedPlatforms) {
      const requirements = PLATFORM_REQUIREMENTS[platform];
      
      if (!requirements[type]) {
        return `${platform} doesn't support ${type} uploads`;
      }

      // For platforms with different content types (like Instagram)
      const specs = contentType && requirements[type][contentType] 
        ? requirements[type][contentType]
        : requirements[type];

      // Check file format
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!specs.formats.includes(extension)) {
        return `${platform} doesn't support ${extension} files`;
      }

      // Check file size
      if (specs.maxSize && file.size > specs.maxSize) {
        return `File too large for ${platform}. Maximum size: ${Math.floor(specs.maxSize / 1024 / 1024)}MB`;
      }

      // For videos, check duration
      if (type === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        return new Promise<string | null>((resolve) => {
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            const duration = video.duration;

            if (specs.minDuration && duration < specs.minDuration) {
              resolve(`Video too short for ${platform}. Minimum: ${specs.minDuration}s`);
            }
            if (specs.maxDuration && duration > specs.maxDuration) {
              resolve(`Video too long for ${platform}. Maximum: ${specs.maxDuration}s`);
            }
            resolve(null);
          };
        });
      }
    }

    return null;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);

    try {
      // Validate each file
      for (const file of acceptedFiles) {
        const validationError = await validateFile(file);
        if (validationError) {
          setError(validationError);
          setUploading(false);
          return;
        }
      }

      await onUpload(acceptedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUpload, selectedPlatforms, contentType]);

  // Calculate accepted file types based on selected platforms
  const getAcceptedTypes = () => {
    const accepted: { [key: string]: string[] } = {};
    
    selectedPlatforms.forEach(platform => {
      const requirements = PLATFORM_REQUIREMENTS[platform];
      
      ['image', 'video'].forEach(type => {
        if (requirements[type]) {
          const formats = contentType && requirements[type][contentType]
            ? requirements[type][contentType].formats
            : requirements[type].formats;
            
          formats.forEach(format => {
            const mimeType = format === '.jpg' || format === '.jpeg' 
              ? 'image/jpeg' 
              : format === '.png'
              ? 'image/png'
              : format === '.gif'
              ? 'image/gif'
              : format === '.mp4'
              ? 'video/mp4'
              : 'video/quicktime';

            if (!accepted[mimeType]) {
              accepted[mimeType] = [];
            }
            if (!accepted[mimeType].includes(format)) {
              accepted[mimeType].push(format);
            }
          });
        }
      });
    });

    return accepted;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedTypes(),
  });

  const renderPlatformRequirements = () => {
    if (selectedPlatforms.length === 0) return null;

    return (
      <div className="mt-4 text-sm text-gray-600">
        <h4 className="font-medium mb-2">Platform Requirements:</h4>
        {selectedPlatforms.map(platform => (
          <div key={platform} className="mb-2">
            <p className="font-medium">{platform}:</p>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(PLATFORM_REQUIREMENTS[platform]).map(([type, specs]) => (
                <li key={type}>
                  {type}: {specs.formats.join(', ')}
                  {specs.maxSize && ` (max ${Math.floor(specs.maxSize / 1024 / 1024)}MB)`}
                  {specs.maxDuration && ` (max ${specs.maxDuration}s)`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

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
              </div>
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
      {renderPlatformRequirements()}
    </div>
  );
};
import React from 'react';
import { PlatformType, ContentType } from './PostCreator';

// Define which platforms support which content types
const PLATFORM_CONTENT_TYPES: Record<PlatformType, ContentType[]> = {
  INSTAGRAM: ['feed', 'story', 'reels'],
  TIKTOK: ['feed'],
  TWITTER: ['feed'],
  LINKEDIN: ['feed'],
  YOUTUBE_SHORTS: ['feed']
};

interface ContentTypeSelectorProps {
  selectedPlatforms: PlatformType[];
  contentType: ContentType;
  onContentTypeChange: (type: ContentType) => void;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  selectedPlatforms,
  contentType,
  onContentTypeChange,
}) => {
  // Get available content types based on selected platforms
  const getAvailableContentTypes = () => {
    const types = new Set<ContentType>();
    selectedPlatforms.forEach(platform => {
      PLATFORM_CONTENT_TYPES[platform].forEach(type => types.add(type));
    });
    return Array.from(types);
  };

  const availableTypes = getAvailableContentTypes();

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Content Type</h2>
      <div className="flex flex-wrap gap-4">
        {availableTypes.map((type) => (
          <button
            key={type}
            onClick={() => onContentTypeChange(type)}
            className={`px-4 py-2 rounded-lg border-2 transition-colors
              ${contentType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
          >
            <span className="block text-sm font-medium capitalize">
              {type}
            </span>
          </button>
        ))}
      </div>
      
      {/* Platform compatibility info */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-medium mb-2">Platform Compatibility:</h3>
        <ul className="space-y-1">
          {selectedPlatforms.map(platform => (
            <li key={platform} className="flex items-center">
              <span className="mr-2">{platform}:</span>
              <span className={
                PLATFORM_CONTENT_TYPES[platform].includes(contentType)
                  ? 'text-green-600'
                  : 'text-red-600'
              }>
                {PLATFORM_CONTENT_TYPES[platform].includes(contentType)
                  ? '✓ Supports'
                  : '✗ Does not support'} {contentType}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
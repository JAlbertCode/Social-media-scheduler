import React from 'react';
import { PlatformType } from './PostCreator';

interface PlatformSelectorProps {
  selectedPlatforms: PlatformType[];
  onPlatformsChange: (platforms: PlatformType[]) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformsChange,
}) => {
  const platforms: { id: PlatformType; name: string }[] = [
    { id: 'TWITTER', name: 'Twitter' },
    { id: 'INSTAGRAM', name: 'Instagram' },
    { id: 'TIKTOK', name: 'TikTok' },
    { id: 'LINKEDIN', name: 'LinkedIn' },
    { id: 'YOUTUBE_SHORTS', name: 'YouTube Shorts' }
  ];

  const togglePlatform = (platform: PlatformType) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Select Platforms</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {platforms.map(({ id, name }) => (
          <button
            key={id}
            onClick={() => togglePlatform(id)}
            className={`p-4 rounded-lg border-2 transition-colors
              ${selectedPlatforms.includes(id)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
          >
            <span className="block text-sm font-medium">{name}</span>
          </button>
        ))}
      </div>
      {selectedPlatforms.length === 0 && (
        <p className="text-sm text-red-600">Please select at least one platform</p>
      )}
    </div>
  );
};
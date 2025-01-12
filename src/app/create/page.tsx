'use client';

import React, { useState } from 'react';
import { PostCreator, PlatformType, ContentType } from '../../components/PostCreator';
import { PlatformSelector } from '../../components/PlatformSelector';
import { ContentTypeSelector } from '../../components/ContentTypeSelector';

export default function CreatePage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([]);
  const [contentType, setContentType] = useState<ContentType>('feed');

  const handlePostCreate = async (postData: {
    content: string;
    hashtags: string[];
    mentions: string[];
    urls: string[];
    threads?: string[];
  }) => {
    // Handle post creation - this will be implemented later
    console.log('Creating post:', {
      platforms: selectedPlatforms,
      contentType,
      ...postData
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Post</h1>
      
      <div className="space-y-6">
        <PlatformSelector
          selectedPlatforms={selectedPlatforms}
          onPlatformsChange={setSelectedPlatforms}
        />
        
        {selectedPlatforms.length > 0 && (
          <>
            <ContentTypeSelector
              selectedPlatforms={selectedPlatforms}
              contentType={contentType}
              onContentTypeChange={setContentType}
            />
            
            <PostCreator
              selectedPlatforms={selectedPlatforms}
              contentType={contentType}
              onPostCreate={handlePostCreate}
            />
          </>
        )}
      </div>
    </div>
  );
}
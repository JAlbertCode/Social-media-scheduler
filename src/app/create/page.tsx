'use client';

import React from 'react';
import { PostCreator } from '../../components/PostCreator';

export default function CreatePage() {
  const handlePostCreate = async (postData: {
    content: string;
    hashtags: string[];
    mentions: string[];
    urls: string[];
    threads?: string[];
  }) => {
    // Handle post creation - this will be implemented later
    console.log('Creating post:', postData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Post</h1>
      
      <PostCreator
        selectedPlatforms={['TWITTER', 'INSTAGRAM']}
        onPostCreate={handlePostCreate}
      />
    </div>
  );
}
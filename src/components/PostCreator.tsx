import React, { useState, useCallback } from 'react';

// Platform Types and Requirements
export type PlatformType = 'TWITTER' | 'INSTAGRAM' | 'TIKTOK' | 'LINKEDIN' | 'YOUTUBE_SHORTS';
export type ContentType = 'feed' | 'story' | 'reels';

interface PlatformLimits {
  maxLength: number;
  maxHashtags?: number;
  maxMentions?: number;
  maxUrls?: number;
}

const PLATFORM_LIMITS: Record<PlatformType, PlatformLimits> = {
  TWITTER: {
    maxLength: 280,
    maxHashtags: 30,
    maxMentions: 50,
    maxUrls: 5
  },
  INSTAGRAM: {
    maxLength: 2200,
    maxHashtags: 30
  },
  TIKTOK: {
    maxLength: 2200,
    maxHashtags: 30
  },
  LINKEDIN: {
    maxLength: 3000
  },
  YOUTUBE_SHORTS: {
    maxLength: 1000
  }
};

interface PostCreatorProps {
  selectedPlatforms: PlatformType[];
  contentType?: ContentType;
  onPostCreate: (post: {
    content: string;
    hashtags: string[];
    mentions: string[];
    urls: string[];
    threads?: string[];
  }) => void;
}

export const PostCreator: React.FC<PostCreatorProps> = ({
  selectedPlatforms,
  contentType = 'feed',
  onPostCreate
}) => {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [threads, setThreads] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get the most restrictive limits across all selected platforms
  const getStrictestLimits = useCallback(() => {
    return selectedPlatforms.reduce((limits, platform) => {
      const platformLimits = PLATFORM_LIMITS[platform];
      return {
        maxLength: Math.min(limits.maxLength, platformLimits.maxLength),
        maxHashtags: Math.min(
          limits.maxHashtags || Infinity,
          platformLimits.maxHashtags || Infinity
        ),
        maxMentions: Math.min(
          limits.maxMentions || Infinity,
          platformLimits.maxMentions || Infinity
        ),
        maxUrls: Math.min(
          limits.maxUrls || Infinity,
          platformLimits.maxUrls || Infinity
        )
      };
    }, {
      maxLength: Infinity,
      maxHashtags: Infinity,
      maxMentions: Infinity,
      maxUrls: Infinity
    });
  }, [selectedPlatforms]);

  // Parse content for hashtags, mentions, and URLs
  const parseContent = useCallback((text: string) => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const mentionRegex = /@[\w]+/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    setHashtags(text.match(hashtagRegex) || []);
    setMentions(text.match(mentionRegex) || []);
    setUrls(text.match(urlRegex) || []);
  }, []);

  // Suggest thread breakdown for long content
  const suggestThreads = useCallback((text: string) => {
    const limits = getStrictestLimits();
    if (text.length <= limits.maxLength) {
      setThreads([]);
      return;
    }

    // Split on sentence boundaries while respecting length limits
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const newThreads: string[] = [];
    let currentThread = '';

    sentences.forEach((sentence) => {
      if ((currentThread + sentence).length <= limits.maxLength) {
        currentThread += sentence;
      } else {
        if (currentThread) newThreads.push(currentThread.trim());
        currentThread = sentence;
      }
    });

    if (currentThread) newThreads.push(currentThread.trim());
    setThreads(newThreads);
  }, [getStrictestLimits]);

  // Validate content against platform limits
  const validateContent = useCallback((text: string) => {
    const limits = getStrictestLimits();
    const errors: Record<string, string> = {};

    if (text.length > limits.maxLength && threads.length === 0) {
      errors.length = `Content exceeds maximum length of ${limits.maxLength} characters`;
    }

    parseContent(text);
    suggestThreads(text);

    const hashtagCount = (text.match(/#/g) || []).length;
    if (limits.maxHashtags && hashtagCount > limits.maxHashtags) {
      errors.hashtags = `Too many hashtags (max: ${limits.maxHashtags})`;
    }

    const mentionCount = (text.match(/@/g) || []).length;
    if (limits.maxMentions && mentionCount > limits.maxMentions) {
      errors.mentions = `Too many mentions (max: ${limits.maxMentions})`;
    }

    const urlCount = (text.match(/(https?:\/\/[^\s]+)/g) || []).length;
    if (limits.maxUrls && urlCount > limits.maxUrls) {
      errors.urls = `Too many URLs (max: ${limits.maxUrls})`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [getStrictestLimits, parseContent, suggestThreads, threads.length]);

  // Handle content changes
  const handleContentChange = useCallback((text: string) => {
    setContent(text);
    validateContent(text);
  }, [validateContent]);

  // Handle post creation
  const handleCreate = useCallback(() => {
    if (validateContent(content)) {
      onPostCreate({
        content,
        hashtags,
        mentions,
        urls,
        threads: threads.length > 0 ? threads : undefined
      });
    }
  }, [content, hashtags, mentions, urls, threads, validateContent, onPostCreate]);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* Content Editor */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className={`w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${Object.keys(validationErrors).length > 0 ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Write your post content..."
        />
        <div className="absolute bottom-4 right-4 text-sm text-gray-500">
          {content.length} / {getStrictestLimits().maxLength}
        </div>
      </div>

      {/* Validation Errors */}
      {Object.entries(validationErrors).map(([key, error]) => (
        <div key={key} className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      ))}

      {/* Thread Preview */}
      {threads.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-2">Thread Preview ({threads.length} tweets)</h4>
          <div className="space-y-2">
            {threads.map((thread, index) => (
              <div key={index} className="p-3 bg-white rounded border border-blue-200">
                <span className="text-sm text-blue-600">Tweet {index + 1}</span>
                <p className="mt-1">{thread}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>Hashtags: {hashtags.length}</span>
        <span>Mentions: {mentions.length}</span>
        <span>URLs: {urls.length}</span>
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={Object.keys(validationErrors).length > 0}
        className={`w-full py-2 px-4 rounded-lg text-white font-medium
          ${Object.keys(validationErrors).length > 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        Create Post
      </button>
    </div>
  );
};
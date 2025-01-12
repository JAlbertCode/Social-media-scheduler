import React from 'react';
import { PlatformType } from './PostCreator';

interface PreviewProps {
  platform: PlatformType;
  content: string;
  hashtags: string[];
  mentions: string[];
  mediaFiles: Array<{
    file: File;
    preview: string;
    type: 'image' | 'video';
  }>;
}

interface PlatformStyles {
  container: string;
  header: string;
  content: string;
  mediaContainer: string;
  footer: string;
}

const PLATFORM_STYLES: Record<PlatformType, PlatformStyles> = {
  TWITTER: {
    container: 'bg-white rounded-xl border border-gray-200 max-w-lg',
    header: 'flex items-center p-4 border-b border-gray-200',
    content: 'p-4 whitespace-pre-wrap',
    mediaContainer: 'border-b border-gray-200',
    footer: 'p-4 flex items-center space-x-4 text-gray-500',
  },
  INSTAGRAM: {
    container: 'bg-white rounded-xl border border-gray-200 max-w-lg',
    header: 'flex items-center p-4 border-b border-gray-200',
    content: 'p-4',
    mediaContainer: 'aspect-square bg-black',
    footer: 'p-4 border-t border-gray-200',
  },
  TIKTOK: {
    container: 'bg-black text-white rounded-xl max-w-lg',
    header: 'flex items-center p-4',
    content: 'p-4',
    mediaContainer: 'aspect-[9/16] bg-gray-900',
    footer: 'p-4',
  },
  LINKEDIN: {
    container: 'bg-white rounded-xl border border-gray-200 max-w-2xl',
    header: 'flex items-center p-4 border-b border-gray-200',
    content: 'p-4 text-sm',
    mediaContainer: 'border-t border-b border-gray-200',
    footer: 'p-4 flex items-center space-x-4 text-gray-500',
  },
  YOUTUBE_SHORTS: {
    container: 'bg-white rounded-xl border border-gray-200 max-w-lg',
    header: 'flex items-center p-4 bg-red-600 text-white rounded-t-xl',
    content: 'p-4',
    mediaContainer: 'aspect-[9/16] bg-black',
    footer: 'p-4',
  },
};

const PlatformIcons: Record<PlatformType, JSX.Element> = {
  TWITTER: (
    <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
    </svg>
  ),
  INSTAGRAM: (
    <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
    </svg>
  ),
  TIKTOK: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 004 15.66a6.34 6.34 0 0010.86 4.49V14.5a8.32 8.32 0 004.73 1.49V12.5a4.85 4.85 0 01-2.77-.85v.03c-.01-1.75 0-3.5.02-5.25z" />
    </svg>
  ),
  LINKEDIN: (
    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  YOUTUBE_SHORTS: (
    <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
    </svg>
  ),
};

export const PlatformPreview: React.FC<PreviewProps> = ({
  platform,
  content,
  hashtags,
  mentions,
  mediaFiles,
}) => {
  const styles = PLATFORM_STYLES[platform];

  const formatContent = () => {
    let formattedContent = content;
    // Highlight hashtags
    hashtags.forEach(tag => {
      formattedContent = formattedContent.replace(
        tag,
        `<span class="text-blue-500">${tag}</span>`
      );
    });
    // Highlight mentions
    mentions.forEach(mention => {
      formattedContent = formattedContent.replace(
        mention,
        `<span class="text-blue-500">${mention}</span>`
      );
    });
    return formattedContent;
  };

  return (
    <div className={styles.container}>
      {/* Platform Header */}
      <div className={styles.header}>
        {PlatformIcons[platform]}
        <span className="ml-2 font-medium">{platform}</span>
      </div>

      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <div className={styles.mediaContainer}>
          {mediaFiles[0].type === 'image' ? (
            <img
              src={mediaFiles[0].preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={mediaFiles[0].preview}
              className="w-full h-full object-cover"
              controls
            />
          )}
        </div>
      )}

      {/* Content */}
      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: formatContent() }}
      />

      {/* Footer */}
      <div className={styles.footer}>
        {hashtags.length > 0 && (
          <span className="text-sm text-gray-500">
            {hashtags.length} hashtags
          </span>
        )}
        {mentions.length > 0 && (
          <span className="text-sm text-gray-500 ml-4">
            {mentions.length} mentions
          </span>
        )}
      </div>
    </div>
  );
};
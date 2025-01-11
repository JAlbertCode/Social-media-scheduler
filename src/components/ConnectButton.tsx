'use client';

import React from 'react';

interface ConnectButtonProps {
  serviceName: string;
  icon?: string;
  onClick: () => void;
  connected?: boolean;
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  serviceName,
  icon,
  onClick,
  connected = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
        ${connected 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        } transition-colors`}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{connected ? `Connected to ${serviceName}` : `Connect ${serviceName}`}</span>
    </button>
  );
};
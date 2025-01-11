'use client';

import { ConnectButton } from '@/components/ConnectButton';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';

export default function ConnectionsPage() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (provider: string) => {
    try {
      setError(null);
      switch(provider.toLowerCase()) {
        case 'twitter':
          await signIn('twitter', { callbackUrl: '/settings/connections' });
          break;
        case 'instagram':
          await signIn('instagram', { callbackUrl: '/settings/connections' });
          break;
        case 'linkedin':
          await signIn('linkedin', { callbackUrl: '/settings/connections' });
          break;
        case 'google drive':
          await signIn('google', { callbackUrl: '/settings/connections' });
          break;
        case 'notion':
          await signIn('notion', { callbackUrl: '/settings/connections' });
          break;
        case 'tiktok':
          await signIn('tiktok', { callbackUrl: '/settings/connections' });
          break;
        default:
          setError(`Provider ${provider} not implemented yet`);
      }
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
      setError(`Failed to connect to ${provider}. Please try again.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Connect Your Accounts</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Social Media Platforms */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Social Media Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConnectButton 
              serviceName="Twitter" 
              onClick={() => handleConnect('twitter')} 
            />
            <ConnectButton 
              serviceName="Instagram" 
              onClick={() => handleConnect('instagram')} 
            />
            <ConnectButton 
              serviceName="LinkedIn" 
              onClick={() => handleConnect('linkedin')} 
            />
            <ConnectButton 
              serviceName="TikTok" 
              onClick={() => handleConnect('tiktok')} 
            />
          </div>
        </section>

        {/* Integration Services */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConnectButton 
              serviceName="Google Drive" 
              onClick={() => handleConnect('google drive')} 
              connected={!!session}
            />
            <ConnectButton 
              serviceName="Notion" 
              onClick={() => handleConnect('notion')} 
            />
          </div>
        </section>

        {/* Connection Status */}
        {session && (
          <section className="mt-8 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Connected Accounts</h3>
            <p className="text-sm text-green-600">
              Logged in as: {session.user?.email}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
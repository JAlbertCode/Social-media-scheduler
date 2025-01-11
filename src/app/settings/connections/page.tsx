'use client';

import { ConnectButton } from '@/components/ConnectButton';
import { useSession, signIn } from 'next-auth/react';

export default function ConnectionsPage() {
  const { data: session } = useSession();

  const handleConnect = (service: string) => {
    if (service === 'Google Drive') {
      signIn('google');
    } else {
      console.log(`Connecting to ${service}`);
      // Will implement other service connections later
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Connect Your Accounts</h1>
      
      <div className="space-y-6">
        {/* Social Media Platforms */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Social Media Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConnectButton 
              serviceName="Twitter" 
              onClick={() => handleConnect('Twitter')} 
            />
            <ConnectButton 
              serviceName="Instagram" 
              onClick={() => handleConnect('Instagram')} 
            />
            <ConnectButton 
              serviceName="LinkedIn" 
              onClick={() => handleConnect('LinkedIn')} 
            />
            <ConnectButton 
              serviceName="TikTok" 
              onClick={() => handleConnect('TikTok')} 
            />
          </div>
        </section>

        {/* Integration Services */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConnectButton 
              serviceName="Google Drive" 
              onClick={() => handleConnect('Google Drive')} 
              connected={!!session}
            />
            <ConnectButton 
              serviceName="Notion" 
              onClick={() => handleConnect('Notion')} 
            />
          </div>
        </section>
      </div>
    </div>
  );
}
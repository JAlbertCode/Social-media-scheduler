import { ConnectButton } from '@/components/ConnectButton';
import { getServerSession } from 'next-auth';

export default async function ConnectionsPage() {
  const session = await getServerSession();

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
              onClick={() => {}} 
            />
            <ConnectButton 
              serviceName="Instagram" 
              onClick={() => {}} 
            />
            <ConnectButton 
              serviceName="LinkedIn" 
              onClick={() => {}} 
            />
            <ConnectButton 
              serviceName="TikTok" 
              onClick={() => {}} 
            />
            {/* Add other social media platforms */}
          </div>
        </section>

        {/* Integration Services */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConnectButton 
              serviceName="Google Drive" 
              onClick={() => {}} 
              connected={!!session}
            />
            <ConnectButton 
              serviceName="Notion" 
              onClick={() => {}} 
            />
          </div>
        </section>
      </div>
    </div>
  );
}
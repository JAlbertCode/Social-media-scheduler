'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

interface Provider {
  id: string;
  name: string;
  type: string;
}

interface SignInButtonsProps {
  providers: Record<string, Provider> | null;
}

const providerIcons = {
  google: '/google.svg',
  github: '/github.svg',
  twitter: '/twitter.svg',
  linkedin: '/linkedin.svg',
  instagram: '/instagram.svg',
  tiktok: '/tiktok.svg',
  notion: '/notion.svg'
};

export default function SignInButtons({ providers }: SignInButtonsProps) {
  if (!providers) return null;

  return (
    <div className="mt-8 space-y-4">
      {Object.values(providers).map((provider) => (
        <div key={provider.id}>
          <button
            onClick={() => signIn(provider.id)}
            className="group relative flex w-full justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {providerIcons[provider.id as keyof typeof providerIcons] && (
              <Image
                src={providerIcons[provider.id as keyof typeof providerIcons]}
                alt={`${provider.name} logo`}
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}
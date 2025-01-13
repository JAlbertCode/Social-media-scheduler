'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleProviderSignIn = async (provider: string) => {
    try {
      setIsLoading(true)
      await signIn(provider, { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Social Media Scheduler
        </h1>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={() => handleProviderSignIn('google')}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/google.svg"
                alt="Google logo"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Google
            </button>

            <button
              onClick={() => handleProviderSignIn('github')}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/github.svg"
                alt="GitHub logo"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with GitHub
            </button>
          </div>

          {isLoading && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Connecting to provider...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
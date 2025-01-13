'use client'

import { PostEditor } from '../../components/PostEditor'
import { PlatformType } from '../../components/PostCreator'

export default function ComposePage() {
  const handleSave = (content: string, media: any[], platforms: PlatformType[]) => {
    console.log('Saving post:', { content, media, platforms })
    // Here we would normally save to backend
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Compose New Post</h1>
      <PostEditor onSave={handleSave} />
    </div>
  )
}
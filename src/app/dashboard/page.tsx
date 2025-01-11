import { MediaUpload } from '@/components/upload/MediaUpload';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Media</h2>
        <MediaUpload 
          onUpload={async (files) => {
            // Will implement this functionality later
            console.log('Files to upload:', files);
          }} 
        />
      </div>
    </div>
  );
}
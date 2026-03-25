import React from 'react';
import UploadForm from './UploadForm';
import PhotoFeed from './PhotoFeed';

export default function App() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Photo Feed</h1>
      <UploadForm />
      <PhotoFeed />
    </div>
  );
}

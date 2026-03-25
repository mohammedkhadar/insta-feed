import React from 'react';
import UploadForm from './UploadForm';
import PhotoFeed from './PhotoFeed';

export default function App() {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Photo Feed</h1>
      <UploadForm />
      <PhotoFeed />
    </div>
  );
}

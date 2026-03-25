import React, { useRef, useState } from 'react';
import Modal from './Modal';

export default function UploadForm() {
  const fileInput = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const file = fileInput.current.files[0];
    if (!file) {
      setError('Please select a file.');
      return;
    }
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', title);
    formData.append('tag', tag);
    setLoading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      fileInput.current.value = '';
      setTitle('');
      setTag('');
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ marginBottom: 24 }}>
        Upload Photo
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>
              Title:<br />
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={loading} style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              Tag:<br />
              <input type="text" value={tag} onChange={e => setTag(e.target.value)} disabled={loading} style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <input type="file" accept="image/*" ref={fileInput} disabled={loading} />
          </div>
          <button type="submit" disabled={loading} style={{ marginRight: 8 }}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          <button type="button" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </button>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
      </Modal>
    </>
  );
}

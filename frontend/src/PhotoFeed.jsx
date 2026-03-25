import { useEffect, useRef, useState } from 'react';

export default function PhotoFeed() {
  const [photos, setPhotos] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wsRef = useRef(null);

  // Fetch all tags once for the filter bar
  const fetchTags = () => {
    fetch('/api/pictures')
      .then(res => res.json())
      .then(data => {
        const tags = [...new Set((data.pictures || []).map(p => p.tag).filter(Boolean))];
        setAllTags(tags);
      })
      .catch(() => {});
  };

  // Fetch photos, optionally filtered by tag
  const fetchPhotos = (tag) => {
    setLoading(true);
    const url = tag ? `/api/pictures?tag=${encodeURIComponent(tag)}` : '/api/pictures';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPhotos(data.pictures || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load photos');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPhotos('');
    fetchTags();
  }, []);

  const handleTagClick = (tag) => {
    const next = tag === activeTag ? '' : tag;
    setActiveTag(next);
    fetchPhotos(next);
  };

  // WebSocket for live updates
  useEffect(() => {
    const wsUrl = `ws://${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_photo') {
          // Refresh tags list and re-fetch current filtered view
          fetchTags();
          setActiveTag(prev => { fetchPhotos(prev); return prev; });
        }
      } catch (_) {}
    };

    return () => ws.close();
  }, []);

  if (loading) return <div>Loading photos...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => handleTagClick('')}
            style={{ fontWeight: activeTag === '' ? 'bold' : 'normal', cursor: 'pointer' }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              style={{ fontWeight: activeTag === tag ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
      {!photos.length && <div>No photos yet.</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {photos.map((photo, i) => (
          <div key={i} style={{ width: 180 }}>
            <img
              src={photo.url}
              alt={photo.title || 'Uploaded'}
              style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 8 }}
            />
            <div style={{ fontWeight: 'bold', marginTop: 4 }}>{photo.title}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{photo.tag ? `#${photo.tag}` : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

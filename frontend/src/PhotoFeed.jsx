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

  if (loading) return <div className="text-gray-500">Loading photos...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleTagClick('')}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              activeTag === ''
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                activeTag === tag
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
      {!photos.length && <div className="text-gray-400">No photos yet.</div>}
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, i) => (
          <div key={i} className="rounded-xl overflow-hidden shadow hover:shadow-md transition">
            <img
              src={photo.url}
              alt={photo.title || 'Uploaded'}
              className="w-full h-44 object-cover"
            />
            <div className="p-2">
              <div className="font-semibold text-sm truncate">{photo.title}</div>
              <div className="text-gray-400 text-xs">{photo.tag ? `#${photo.tag}` : ''}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

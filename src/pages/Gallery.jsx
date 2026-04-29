import { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, Play, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Gallery.css';

const CATEGORIES = ['All', 'Wedding', 'Events', 'Portrait', 'Maternity', 'Videography'];

// ── Detect if a gallery row is a video ───────────────────────
function isVideoItem(item) {
  if (!item?.image_url) return false;
  if (item.media_type === 'video') return true;
  if (item.media_type?.startsWith('video/')) return true;
  if (/\.(mp4|mov|avi|webm|mkv|m4v|wmv|flv|3gp)/i.test(item.image_url)) return true;
  return false;
}

// ── Image card ───────────────────────────────────────────────
function ImageGalleryCard({ item, onClick }) {
  return (
    <div className="gallery-card" onClick={() => onClick(item)}>
      <img src={item.image_url} alt={item.title} loading="lazy" />
      <div className="gallery-card__info">
        <ZoomIn size={18} className="gallery-card__zoom" />
        <div>
          <span className="gallery-card__cat">{item.category}</span>
          <span className="gallery-card__title">{item.title}</span>
        </div>
      </div>
    </div>
  );
}

// ── Video card ───────────────────────────────────────────────
function VideoGalleryCard({ item, onClick }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className="gallery-card gallery-card--video"
      onClick={() => onClick(item)}
    >
      <video
        ref={videoRef}
        src={item.image_url}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        style={{ width: '100%', display: 'block', transition: 'transform 0.5s ease' }}
      />
      <button
        className="gallery-card__mute"
        onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
      </button>
      <div className="gallery-card__vid-badge">
        <Play size={9} fill="currentColor" /> Video
      </div>
      <div className="gallery-card__info">
        <Play size={18} className="gallery-card__zoom" />
        <div>
          <span className="gallery-card__cat">{item.category}</span>
          <span className="gallery-card__title">{item.title}</span>
        </div>
      </div>
    </div>
  );
}

// ── Lightbox video ────────────────────────────────────────────
function LightboxVideo({ src }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.play().catch(() => {}); }, [src]);
  return (
    <video
      ref={ref}
      src={src}
      controls
      autoPlay
      playsInline
      style={{ maxHeight: '78vh', width: '100%', objectFit: 'contain', display: 'block' }}
    />
  );
}

// ── Main Gallery component ────────────────────────────────────
export default function Gallery() {
  const [images,   setImages]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState('All');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data?.length) setImages(data);
        setLoading(false);
      });
  }, []);

  const filtered = active === 'All' ? images : images.filter(i => i.category === active);

  return (
    <main className="gallery-page">
      <div className="gallery-page__hero container">
        <p className="section-label">Freddie Visuals</p>
        <h1 className="section-title">The <em>Gallery</em></h1>
        <div className="divider" />
        <p className="gallery-page__sub">
          A curated collection spanning weddings, events, portraits, maternity, and videography — each frame a testament to cinematic storytelling.
        </p>
      </div>

      <div className="gallery-filters container">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`gallery-filter ${active === cat ? 'gallery-filter--active' : ''}`}
            onClick={() => setActive(cat)}
          >
            {cat}
            <span className="gallery-filter__count">
              {cat === 'All' ? images.length : images.filter(i => i.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      <div className="gallery-grid container">
        {loading ? (
          <p style={{ color: 'var(--mid)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--mid)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>No images found.</p>
        ) : (
          filtered.map(item =>
            isVideoItem(item) ? (
              <VideoGalleryCard key={item.id} item={item} onClick={setLightbox} />
            ) : (
              <ImageGalleryCard key={item.id} item={item} onClick={setLightbox} />
            )
          )
        )}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox__close"><X size={24} /></button>
          <div className="lightbox__inner" onClick={e => e.stopPropagation()}>
            {isVideoItem(lightbox)
              ? <LightboxVideo src={lightbox.image_url} />
              : <img src={lightbox.image_url} alt={lightbox.title} />
            }
            <div className="lightbox__meta">
              <span className="lightbox__cat">{lightbox.category}</span>
              <h3 className="lightbox__title">{lightbox.title}</h3>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

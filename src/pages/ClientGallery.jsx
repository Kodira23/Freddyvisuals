import { useState, useEffect, useRef } from 'react';
import { Lock, Download, Eye, LogOut, Image, Play, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './ClientGallery.css';

// ── Video URL detection ──────────────────────────────────────
// Strips query params first so ?token=... doesn't fool the check
function isVideoUrl(url) {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return /\.(mp4|mov|avi|webm|mkv|m4v|wmv|flv|3gp)$/.test(clean);
}

// ── Scroll reveal hook: slides card in from the right ────────
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── Video card ───────────────────────────────────────────────
function VideoCard({ photo, index, onClick }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [visible, setVisible]     = useState(false);
  const [muted, setMuted]         = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Card scroll-reveal
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Video autoplay / pause when in/out of viewport
  useEffect(() => {
    const el = videoRef.current;
    if (!el || loadError) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadError]);

  return (
    <div
      ref={cardRef}
      className={`client-photo client-photo--video${visible ? ' client-photo--visible' : ''}`}
      style={{ '--i': index }}
      onClick={() => !loadError && onClick(photo)}
    >
      {loadError ? (
        <div className="client-photo__video-error">
          <AlertCircle size={20} />
          <span>Video unavailable</span>
          <small style={{ wordBreak: 'break-all', opacity: 0.5, fontSize: '0.6rem' }}>
            {photo.image_url}
          </small>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={photo.image_url}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onError={() => setLoadError(true)}
        />
      )}

      {!loadError && (
        <button
          className="client-photo__mute"
          onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
      )}

      <div className="client-photo__overlay client-photo__overlay--video">
        <Play size={22} />
        {photo.caption && <span>{photo.caption}</span>}
      </div>

      <div className="client-photo__vid-badge">
        <Play size={9} fill="currentColor" /> Video
      </div>
    </div>
  );
}

// ── Image card ───────────────────────────────────────────────
function ImageCard({ photo, index, onClick }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`client-photo${visible ? ' client-photo--visible' : ''}`}
      style={{ '--i': index }}
      onClick={() => onClick(photo)}
    >
      <img src={photo.image_url} alt={photo.caption || ''} loading="lazy" />
      <div className="client-photo__overlay">
        <Eye size={20} />
        {photo.caption && <span>{photo.caption}</span>}
      </div>
    </div>
  );
}

// ── Lightbox video ───────────────────────────────────────────
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

// ── Main component ───────────────────────────────────────────
export default function ClientGallery() {
  const [code,     setCode]    = useState('');
  const [gallery,  setGallery] = useState(null);
  const [photos,   setPhotos]  = useState([]);
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [lbIndex,  setLbIndex]  = useState(0);

  async function handleAccess(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data: gal, error: galErr } = await supabase
      .from('client_galleries')
      .select('*')
      .eq('access_code', code.trim())
      .single();
    if (galErr || !gal) {
      setError('Invalid access code. Please check your code and try again, or contact Freddie Visuals.');
      setLoading(false);
      return;
    }
    const { data: pics } = await supabase
      .from('client_photos')
      .select('*')
      .eq('gallery_id', gal.id)
      .order('created_at');
    setGallery(gal);
    setPhotos(pics || []);
    setLoading(false);
  }

  function openLightbox(photo) {
    const idx = photos.findIndex(p => p.id === photo.id);
    setLbIndex(idx);
    setLightbox(photo);
  }

  function navLightbox(dir) {
    const next = (lbIndex + dir + photos.length) % photos.length;
    setLbIndex(next);
    setLightbox(photos[next]);
  }

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e) {
      if (e.key === 'ArrowRight') navLightbox(1);
      if (e.key === 'ArrowLeft')  navLightbox(-1);
      if (e.key === 'Escape')     setLightbox(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, lbIndex]);

  // ── Gallery view ─────────────────────────────────────────
  if (gallery) {
    return (
      <main className="client-gallery-page">
        <div className="client-gallery-header container">
          <div className="client-gallery-header__text">
            <h1 className="client-gallery-title">{gallery.client_name}</h1>
            {gallery.event_name && <p className="client-gallery-event">{gallery.event_name}</p>}
            {gallery.event_date && (
              <p className="client-gallery-date">
                {new Date(gallery.event_date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            )}
          </div>
          <button
            className="btn btn-outline client-gallery-exit"
            onClick={() => { setGallery(null); setPhotos([]); setCode(''); }}
          >
            <LogOut size={14} /> Exit Gallery
          </button>
        </div>

        <div className="client-gallery-stats container">
          <span><Image size={14} /> {photos.length} Photos &amp; Videos</span>
        </div>

        {photos.length === 0 ? (
          <div className="client-gallery-empty container">
            <Lock size={32} style={{ color: 'var(--gold)', marginBottom: '1rem' }} />
            <p>Your photos are still being processed by Freddie Visuals. Check back soon!</p>
          </div>
        ) : (
          <div className="client-gallery-grid container">
            {photos.map((photo, i) =>
              isVideoUrl(photo.image_url)
                ? <VideoCard key={photo.id} photo={photo} index={i} onClick={openLightbox} />
                : <ImageCard key={photo.id} photo={photo} index={i} onClick={openLightbox} />
            )}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div className="lightbox" onClick={() => setLightbox(null)}>
            <div className="lightbox__inner" onClick={e => e.stopPropagation()}>
              {isVideoUrl(lightbox.image_url)
                ? <LightboxVideo src={lightbox.image_url} />
                : <img src={lightbox.image_url} alt={lightbox.caption || ''} />
              }
              <div className="lightbox__meta">
                <div>
                  <span className="lightbox__counter">{lbIndex + 1} / {photos.length}</span>
                  <span className="lightbox__caption">{lightbox.caption || 'Untitled'}</span>
                </div>
                {!isVideoUrl(lightbox.image_url) && (
                  <a
                    href={lightbox.image_url}
                    download
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.65rem', flexShrink: 0 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <Download size={13} /> Download
                  </a>
                )}
              </div>
            </div>
            {photos.length > 1 && (
              <>
                <button className="lightbox__nav lightbox__nav--prev" onClick={e => { e.stopPropagation(); navLightbox(-1); }}>‹</button>
                <button className="lightbox__nav lightbox__nav--next" onClick={e => { e.stopPropagation(); navLightbox(1); }}>›</button>
              </>
            )}
            <button className="lightbox__close" onClick={() => setLightbox(null)}>✕</button>
          </div>
        )}
      </main>
    );
  }

  // ── Access page ───────────────────────────────────────────
  return (
    <main className="client-access-page">
      <div className="client-access-inner">
        <div className="client-access-logo">
          <span>Freddie</span><span style={{ color: 'var(--gold)' }}>Visuals</span>
        </div>
        <div className="client-access-icon"><Lock size={30} /></div>
        <p className="section-label">Your Private Gallery</p>
        <h1 className="section-title">Client <em>Access</em></h1>
        <div className="divider" style={{ margin: '1.5rem auto' }} />
        <p className="client-access-sub">
          Your gallery is exclusively yours. Enter the private access code sent to you by Freddie Visuals to view and download your photos.
        </p>
        <form className="client-access-form" onSubmit={handleAccess}>
          <div className="client-access-input-wrap">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter your access code"
              className="client-access-input"
              required
            />
          </div>
          {error && <p className="client-access-error">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
          >
            {loading ? 'Verifying…' : 'Access My Gallery'}
          </button>
        </form>
        <p className="client-access-help">
          Don't have a code?{' '}
          <a href="mailto:hello@freddievisuals.com" style={{ color: 'var(--gold)' }}>
            hello@freddievisuals.com
          </a>
        </p>
      </div>
    </main>
  );
}

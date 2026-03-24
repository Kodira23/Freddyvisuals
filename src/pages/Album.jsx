import { useState } from 'react';
import { Lock, Download, Eye, LogOut, Image, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Album.css';

export default function Album() {
  const [code, setCode] = useState('');
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [lbIndex, setLbIndex] = useState(0);

  async function handleAccess(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data: gal, error: galErr } = await supabase
      .from('client_galleries').select('*').eq('access_code', code.trim()).single();
    if (galErr || !gal) {
      setError('Invalid access code. Please check your code or contact Freddie Visuals.');
      setLoading(false);
      return;
    }
    const { data: pics } = await supabase
      .from('client_photos').select('*').eq('gallery_id', gal.id).order('created_at');
    setGallery(gal);
    setPhotos(pics || []);
    setLoading(false);
  }

  function openLightbox(photo, index) {
    setLightbox(photo);
    setLbIndex(index);
  }

  function prevPhoto() {
    const newIdx = (lbIndex - 1 + photos.length) % photos.length;
    setLbIndex(newIdx);
    setLightbox(photos[newIdx]);
  }

  function nextPhoto() {
    const newIdx = (lbIndex + 1) % photos.length;
    setLbIndex(newIdx);
    setLightbox(photos[newIdx]);
  }

  // ── Unlocked Album View ──
  if (gallery) {
    return (
      <main className="album-page">
        <div className="album-header container">
          <div className="album-header__left">
            <p className="section-label">Freddie Visuals · Private Album</p>
            <h1 className="section-title">{gallery.client_name}</h1>
            {gallery.event_name && <p className="album-event">{gallery.event_name}</p>}
            {gallery.event_date && (
              <p className="album-date">
                {new Date(gallery.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <p className="album-count"><Image size={14} /> {photos.length} photographs in your album</p>
          </div>
          <button className="btn btn-outline album-exit" onClick={() => { setGallery(null); setPhotos([]); setCode(''); }}>
            <LogOut size={14} /> Exit Album
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="album-empty container">
            <Lock size={36} />
            <p>Your album is being prepared by Freddie Visuals. Please check back soon!</p>
          </div>
        ) : (
          <div className="album-masonry container">
            {photos.map((photo, i) => (
              <div key={photo.id} className="album-photo" onClick={() => openLightbox(photo, i)}>
                <img src={photo.image_url} alt={photo.caption || `Photo ${i + 1}`} loading="lazy" />
                <div className="album-photo__hover">
                  <Eye size={20} />
                  {photo.caption && <span>{photo.caption}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div className="album-lightbox" onClick={() => setLightbox(null)}>
            <button className="album-lightbox__close" onClick={() => setLightbox(null)}>✕</button>
            <button className="album-lightbox__nav album-lightbox__nav--prev" onClick={e => { e.stopPropagation(); prevPhoto(); }}>‹</button>
            <div className="album-lightbox__inner" onClick={e => e.stopPropagation()}>
              <img src={lightbox.image_url} alt={lightbox.caption || ''} />
              <div className="album-lightbox__meta">
                <div>
                  <span className="album-lightbox__count">{lbIndex + 1} / {photos.length}</span>
                  {lightbox.caption && <h3 className="album-lightbox__caption">{lightbox.caption}</h3>}
                </div>
                <a href={lightbox.image_url} download target="_blank" rel="noreferrer"
                  className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.65rem' }}
                  onClick={e => e.stopPropagation()}>
                  <Download size={13} /> Download
                </a>
              </div>
            </div>
            <button className="album-lightbox__nav album-lightbox__nav--next" onClick={e => { e.stopPropagation(); nextPhoto(); }}>›</button>
          </div>
        )}
      </main>
    );
  }

  // ── Access Gate ──
  return (
    <main className="album-gate">
      <div className="album-gate__inner">
        <div className="album-gate__brand">Freddie<span>Visuals</span></div>
        <div className="album-gate__icon"><BookOpen size={30} /></div>
        <p className="section-label">Your Private Album</p>
        <h1 className="section-title">Access Your <em>Album</em></h1>
        <div className="divider" style={{ margin: '1.5rem auto' }} />
        <p className="album-gate__sub">
          Your photos are exclusively yours. Enter the private access code sent to you by Freddie Visuals to view and download your complete album.
        </p>
        <form className="album-gate__form" onSubmit={handleAccess}>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter your access code"
            className="album-gate__input"
            required
          />
          {error && <p className="album-gate__error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
            {loading ? 'Verifying…' : 'Open My Album'}
          </button>
        </form>
        <p className="album-gate__help">
          Don't have a code? <a href="mailto:hello@freddievisuals.com">hello@freddievisuals.com</a>
        </p>
      </div>
    </main>
  );
}

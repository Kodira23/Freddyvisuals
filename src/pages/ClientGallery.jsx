import { useState } from 'react';
import { Lock, Download, Eye, LogOut, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './ClientGallery.css';

export default function ClientGallery() {
  const [code, setCode] = useState('');
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  async function handleAccess(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data: gal, error: galErr } = await supabase
      .from('client_galleries').select('*').eq('access_code', code.trim()).single();
    if (galErr || !gal) {
      setError('Invalid access code. Please check your code and try again, or contact Freddie Visuals.');
      setLoading(false);
      return;
    }
    const { data: pics } = await supabase
      .from('client_photos').select('*').eq('gallery_id', gal.id).order('created_at');
    setGallery(gal);
    setPhotos(pics || []);
    setLoading(false);
  }

  if (gallery) {
    return (
      <main className="client-gallery-page">
        <div className="client-gallery-header container">
          <div>
            <p className="section-label">Freddie Visuals · Private Gallery</p>
            <h1 className="section-title">{gallery.client_name}</h1>
            {gallery.event_name && <p className="client-gallery-event">{gallery.event_name}</p>}
            {gallery.event_date && (
              <p className="client-gallery-date">
                {new Date(gallery.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
          <button className="btn btn-outline" onClick={() => { setGallery(null); setPhotos([]); setCode(''); }}>
            <LogOut size={14} /> Exit Gallery
          </button>
        </div>

        <div className="client-gallery-stats container">
          <span><Image size={14} /> {photos.length} Photos in your gallery</span>
        </div>

        {photos.length === 0 ? (
          <div className="client-gallery-empty container">
            <Lock size={32} style={{ color: 'var(--gold)', marginBottom: '1rem' }} />
            <p>Your photos are still being processed by Freddie Visuals. Check back soon!</p>
          </div>
        ) : (
          <div className="client-gallery-grid container">
            {photos.map(photo => (
              <div key={photo.id} className="client-photo" onClick={() => setLightbox(photo)}>
                <img src={photo.image_url} alt={photo.caption || ''} loading="lazy" />
                <div className="client-photo__overlay">
                  <Eye size={20} />
                  {photo.caption && <span>{photo.caption}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {lightbox && (
          <div className="lightbox" onClick={() => setLightbox(null)}>
            <div className="lightbox__inner" onClick={e => e.stopPropagation()}>
              <img src={lightbox.image_url} alt={lightbox.caption || ''} />
              <div className="lightbox__meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--white)' }}>
                  {lightbox.caption || 'Untitled'}
                </span>
                <a href={lightbox.image_url} download className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.65rem' }} onClick={e => e.stopPropagation()}>
                  <Download size={13} /> Download
                </a>
              </div>
            </div>
            <button className="lightbox__close" onClick={() => setLightbox(null)}>✕</button>
          </div>
        )}
      </main>
    );
  }

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
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
            {loading ? 'Verifying…' : 'Access My Gallery'}
          </button>
        </form>
        <p className="client-access-help">
          Don't have a code? <a href="mailto:hello@freddievisuals.com" style={{ color: 'var(--gold)' }}>hello@freddievisuals.com</a>
        </p>
      </div>
    </main>
  );
}

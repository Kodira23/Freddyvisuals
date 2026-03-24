import { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Gallery.css';

const CATEGORIES = ['All', 'Wedding', 'Events', 'Portrait', 'Maternity', 'Videography'];

const PLACEHOLDER_GALLERY = [
  { id: 1, title: 'Golden Vows', category: 'Wedding', image_url: '_MG_2261.jpg' },
  { id: 2, title: 'New Life', category: 'Maternity', image_url: 'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=800&q=80' },
  { id: 3, title: 'The Embrace', category: 'Portrait', image_url: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=800&q=80' },
  { id: 4, title: 'Gala Night', category: 'Events', image_url: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&q=80' },
  { id: 5, title: 'Ceremony Arch', category: 'Wedding', image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80' },
  { id: 6, title: 'Urban Soul', category: 'Portrait', image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80' },
  { id: 7, title: 'First Dance', category: 'Wedding', image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
  { id: 8, title: 'Sacred Glow', category: 'Maternity', image_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80' },
  { id: 9, title: 'Product Launch', category: 'Events', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { id: 10, title: 'Behind the Lens', category: 'Videography', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { id: 11, title: 'Bridal Prep', category: 'Wedding', image_url: 'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80' },
  { id: 12, title: 'Fine Art', category: 'Portrait', image_url: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=800&q=80' },
  { id: 13, title: 'Moment of Bliss', category: 'Maternity', image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80' },
  { id: 14, title: 'Conference', category: 'Events', image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80' },
  { id: 15, title: 'Cinematic Cut', category: 'Videography', image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80' },
];

export default function Gallery() {
  const [images, setImages] = useState(PLACEHOLDER_GALLERY);
  const [active, setActive] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    supabase.from('gallery').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) setImages(data); });
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
        {filtered.map(item => (
          <div key={item.id} className="gallery-card" onClick={() => setLightbox(item)}>
            <img src={item.image_url} alt={item.title} loading="lazy" />
            <div className="gallery-card__info">
              <ZoomIn size={18} className="gallery-card__zoom" />
              <div>
                <span className="gallery-card__cat">{item.category}</span>
                <span className="gallery-card__title">{item.title}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox__close"><X size={24} /></button>
          <div className="lightbox__inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.title} />
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Heart, Users, Camera, Baby, Film, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Services.css';

// Placeholder data with KSH prices
const PLACEHOLDER_SERVICES = [
  {
    id: 1,
    icon: Heart,
    title: 'Wedding Photography',
    description: 'From the quiet nervous breaths before the ceremony to the last dance under dimmed lights — we document your wedding day with cinematic artistry and emotional truth. No poses, no clichés. Just real moments, beautifully lit.',
    price_from: 12000,      // KSH
    duration: 'Full Day (8–14 hrs)',
    image_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=80',
    features: ['Pre-wedding consultation & timeline planning', 'Two photographers on the day', 'Bridal prep, ceremony & reception coverage', 'Online delivery gallery (500+ edited images)', 'Print-ready high-resolution files', 'Optional engagement shoot add-on', 'Private client gallery access', '4-week turnaround'],
  },
  {
    id: 2,
    icon: Users,
    title: 'Events Coverage',
    description: 'Galas, corporate nights, product launches, birthday celebrations, and conferences — we blend into the atmosphere and capture the energy, emotion, and detail that make your event unforgettable.',
    price_from: 6000,       // KSH
    duration: 'Half Day or Full Day',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    features: ['Pre-event walk-through', 'Candid & formal shots', 'Team headshots available add-on', 'Quick 48–72hr turnaround', 'Commercial use license', 'Brand colour-graded edits', 'Online delivery gallery'],
  },
  {
    id: 3,
    icon: Camera,
    title: 'Portrait Sessions',
    description: 'Dramatic, moody portraits for individuals, couples, and families. Shot on location across Nairobi or in a controlled studio environment — always soulful, always striking.',
    price_from: 2500,       // KSH
    duration: '1–3 Hours',
    image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80',
    features: ['Style & wardrobe guide sent ahead', 'Outdoor locations or studio options', '30–60 professionally edited images', 'Private online gallery', 'High-resolution downloads', 'Print package options available', '1-week turnaround'],
  },
  {
    id: 4,
    icon: Baby,
    title: 'Maternity Photography',
    description: 'A sacred season deserves sacred images. Our maternity sessions are tender, golden, and cinematic — celebrating the beauty of expecting mothers with warmth, dignity, and artistic vision.',
    price_from: 3000,       // KSH
    duration: '1.5–2 Hours',
    image_url: 'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=900&q=80',
    features: ['Mama-focused style consultation', 'Partner & sibling inclusion welcome', 'Outdoor golden hour or studio options', '30–50 edited images', 'Private gallery access', 'Fine art print options', 'Newborn session bundle available'],
  },
  {
    id: 5,
    icon: Film,
    title: 'Videography',
    description: 'Cinematic short films and highlight reels that let you relive every heartbeat. From wedding films to event recaps and personal brand videos — we shoot, edit, and deliver footage with a filmic eye.',
    price_from: 9000,       // KSH
    duration: 'By Package',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    features: ['Pre-production planning call', 'Cinema-grade camera & audio equipment', '3–5 min cinematic highlight reel', 'Full ceremony / event footage available', 'Licensed soundtrack', 'Colour-graded & sound-mastered', 'Private streaming link delivery', '3–4 week turnaround'],
  },
  {
    id: 6,
    icon: Award,
    title: 'Commercial & Brand',
    description: 'Elevate your brand with imagery that commands attention. Product shoots, corporate headshots, editorial-style brand photography — crafted to convert and impress.',
    price_from: 8000,       // KSH
    duration: 'By Arrangement',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80',
    features: ['Creative direction & mood board', 'Studio or on-location shoot', 'Prop sourcing assistance', 'Professional retouching', 'Commercial license included', 'Multiple format exports', 'Rush delivery available'],
  },
];

export default function Services() {
  const [services, setServices] = useState(PLACEHOLDER_SERVICES);
  const [active, setActive] = useState(0);

  useEffect(() => {
    supabase.from('services').select('*').order('created_at')
      .then(({ data }) => { if (data?.length) setServices(data); });
  }, []);

  const svc = services[active];

  return (
    <main className="services-page">
      <div className="services-hero container">
        <p className="section-label">Freddie Visuals</p>
        <h1 className="section-title">What We <em>Offer</em></h1>
        <div className="divider" />
        <p className="services-hero__sub">
          Six specialisations. One cinematic vision. Whether you're saying "I do," expecting a new arrival, or hosting a landmark event — we're ready.
        </p>
      </div>

      {/* Tabs */}
      <div className="services-tabs container">
        {services.map((s, i) => (
          <button
            key={s.id}
            className={`services-tab ${i === active ? 'services-tab--active' : ''}`}
            onClick={() => setActive(i)}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Active Detail */}
      {svc && (
        <div className="service-detail container" key={svc.id}>
          <div className="service-detail__image">
            <img src={svc.image_url} alt={svc.title} />
            <div className="service-detail__price-badge">
              <span className="service-detail__price-from">From</span>
              {/* --- MODIFIED: price to KSH --- */}
              <span className="service-detail__price-num">KSH {svc.price_from?.toLocaleString()}</span>
            </div>
          </div>
          <div className="service-detail__content">
            <p className="section-label">{svc.duration}</p>
            <h2 className="section-title">{svc.title}</h2>
            <div className="divider" />
            <p className="service-detail__desc">{svc.description}</p>
            <ul className="service-detail__features">
              {(svc.features || []).map((f, i) => (
                <li key={i}><Check size={14} className="check-icon" />{f}</li>
              ))}
            </ul>
            <div className="service-detail__actions">
              <Link to="/contact" className="btn btn-primary">
                Book This Package <ArrowRight size={14} />
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Custom Quote
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      <section className="services-grid-section">
        <div className="container">
          <p className="section-label">All Packages</p>
          <h2 className="section-title" style={{ marginBottom: '3rem' }}>Choose Your <em>Experience</em></h2>
          <div className="services-cards">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className={`service-card ${i === active ? 'service-card--active' : ''}`} onClick={() => { setActive(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <div className="service-card__img">
                    <img src={s.image_url} alt={s.title} />
                    {Icon && <div className="service-card__badge"><Icon size={16} /></div>}
                  </div>
                  <div className="service-card__body">
                    <h3 className="service-card__title">{s.title}</h3>
                    <p className="service-card__duration">{s.duration}</p>
                    <p className="service-card__desc">{s.description?.slice(0, 90)}…</p>
                    <div className="service-card__footer">
                      {/* --- MODIFIED: price to KSH --- */}
                      <span className="service-card__price">From KSH {s.price_from?.toLocaleString()}</span>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.58rem' }}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

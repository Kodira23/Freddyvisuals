import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Camera, Users, Star, Film, Heart, Baby } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Home.css';

const HERO_SLIDES = [
  {
    image: '_MG_2261.jpg',
    label: 'Wedding Photography',
    title: 'Where Love',
    titleItalic: 'Meets Light',
  },
  {
    image: 'DSC_7020.JPG',
    label: 'Maternity Photography',
    title: 'Life\'s Most',
    titleItalic: 'Sacred Moments',
  },
  {
    image: 'Events1.jpeg',
    label: 'Event Coverage',
    title: 'Every Story',
    titleItalic: 'Deserves to Last',
  },
  {
    image: 'Dem!.jpeg',
    label: 'Portrait Sessions',
    title: 'Your True',
    titleItalic: 'Self, Captured',
  },
];

const GALLERY_PLACEHOLDERS = [
  { id: 1, title: 'Golden Vows', category: 'Wedding', image_url: '_MG_2261.jpg' },
  { id: 2, title: 'New Beginnings', category: 'Maternity', image_url: 'DSC_7020.JPG' },
  { id: 3, title: 'The Embrace', category: 'Portrait', image_url: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=800&q=80' },
  { id: 4, title: 'Gala Night', category: 'Event', image_url: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&q=80' },
  { id: 5, title: 'Cinematic Frame', category: 'Videography', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { id: 6, title: 'Ceremony Arch', category: 'Wedding', image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80' },
];

const stats = [
  { icon: Camera, value: '600+', label: 'Sessions Shot' },
  { icon: Heart, value: '200+', label: 'Weddings Covered' },
  { icon: Film, value: '150+', label: 'Videos Delivered' },
  { icon: Star, value: '6 yrs', label: 'Experience' },
];

const niches = [
  { icon: Heart, title: 'Weddings', desc: 'Cinematic coverage of your most precious day, from first look to last dance.', link: '/services', image: '_MG_2261.jpg', video: null },
  { icon: Users, title: 'Events', desc: 'Galas, launches, birthdays — every atmosphere captured with energy and precision.', link: '/services', image: 'Events1.jpeg', video: null },
  { icon: Camera, title: 'Portraits', desc: 'Soulful, dramatic portraits that reveal authentic character and beauty.', link: '/services', image: 'Dem.png', video: null },
  { icon: Baby, title: 'Maternity', desc: 'Tender, glowing imagery celebrating the miracle of new life and motherhood.', link: '/services', image: 'matan.png', video: null },
  { icon: Film, title: 'Videography', desc: 'Short films and highlight reels that let you relive every heartbeat.', link: '/services', image: null, video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { icon: Award, title: 'Commercial', desc: 'Brand imagery and corporate coverage crafted to impress and convert.', link: '/services', image: 'corporates1.jpeg', video: null },
];

export default function Home() {
  const [gallery, setGallery] = useState(GALLERY_PLACEHOLDERS);

  useEffect(() => {
    supabase.from('gallery').select('*').eq('featured', true).limit(6)
      .then(({ data }) => { if (data?.length) setGallery(data); });
  }, []);

  return (
    <main className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__photo-wrap">
          <div className="hero__bg hero__bg--active">
            <img src="mas.jpg" alt="Freddie Visuals" />
          </div>
        </div>

        <div className="hero__card">
          <p className="hero__card-name">Freddie Visuals</p>
          <h1 className="hero__card-title">
            PHOTOGRAPHY<br />STUDIO
          </h1>
          <div className="hero__card-divider" />
          <p className="hero__card-sub">Nairobi, Kenya</p>
          <div className="hero__card-actions">
            <Link to="/contact" className="btn btn-dark">Book Now</Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats">
        <div className="container stats__grid">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="stat">
              <Icon size={20} className="stat__icon" />
              <span className="stat__value">{value}</span>
              <span className="stat__label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section className="about container">
        <div className="about__image-wrap">
          <img src="logos.png" alt="Freddie at work" className="about__image" />
          <div className="about__badge">
            <span className="about__badge-num">6+</span>
            <span className="about__badge-text">Years of<br />Artistry</span>
          </div>
        </div>
        <div className="about__content">
          <p className="section-label">The Story Behind the Lens</p>
          <h2 className="section-title">Darkness is our <em>Canvas</em></h2>
          <div className="divider" />
          <p className="about__body">
            Freddie Visuals was built on one belief: that the most powerful photographs live in the space between light and shadow. Based in Nairobi, we bring a cinematic, moody sensibility to every frame we capture.
          </p>
          <p className="about__body" style={{ marginTop: '1rem' }}>
            Whether it's the quiet tears before a wedding ceremony, the golden glow of a maternity session, or the electric energy of a live event — we're there, invisible, creating art.
          </p>
          <div className="about__tags">
            {['Weddings', 'Events', 'Portraits', 'Maternity', 'Videography'].map(t => (
              <span key={t} className="about__tag">{t}</span>
            ))}
          </div>
          <Link to="/services" className="btn btn-primary" style={{ marginTop: '2rem' }}>
            Our Services
          </Link>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="niches">
        <div className="container niches__header">
          <p className="section-label">What We Do</p>
          <h2 className="section-title">Every Niche, <em>Mastered</em></h2>
        </div>
        <div className="niches__grid container">
          {niches.map(({ icon: Icon, title, desc, link, image, video }) => (
            <div key={title} className="niche-card">
              <div className="niche-card__image">
                {video
                  ? <video src={video} autoPlay muted loop playsInline />
                  : image
                    ? <img src={image} alt={title} />
                    : <div className="niche-card__image-placeholder"><Icon size={28} /></div>
                }
              </div>
              <div className="niche-card__body">
                <h3 className="niche-card__title">{title}</h3>
                <p className="niche-card__desc">{desc}</p>
                <Link to="/contact" className="btn niche-card__btn">Book Now</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gallery Preview ── */}
      <section className="gallery-preview">
        <div className="container gallery-preview__header">
          <div>
            <p className="section-label">Portfolio</p>
            <h2 className="section-title">Selected <em>Work</em></h2>
          </div>
          <Link to="/gallery" className="btn btn-outline">
            Full Gallery
          </Link>
        </div>
        <div className="gallery-preview__grid container">
          {gallery.map((item, i) => (
            <div key={item.id} className={`gallery-preview__item gallery-preview__item--${i}`}>
              <img src={item.image_url} alt={item.title} />
              <div className="gallery-preview__overlay">
                <span className="gallery-preview__cat">{item.category}</span>
                <span className="gallery-preview__title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="testimonial container">
        <div className="testimonial__inner">
          <div className="testimonial__quote">"</div>
          <p className="testimonial__text">
            Freddie didn't just photograph our wedding — he captured the feeling of the entire day. Every image is a masterpiece. We cry happy tears every time we look through the gallery.
          </p>
          <div className="testimonial__author">
            <div className="testimonial__avatar" />
            <div>
              <strong>Amara & James Odhiambo</strong>
              <span>Wedding — Nairobi, 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta container">
        <div className="cta__inner">
          <p className="section-label">Let's Connect</p>
          <h2 className="section-title">Ready to capture your <em>story?</em></h2>
          <p className="cta__sub">
            Weddings, maternity, events, portraits or a cinematic video — let's talk about bringing your vision to life.
          </p>
          <Link to="/contact" className="btn btn-primary" style={{ marginTop: '2.5rem' }}>
            Start the Conversation
          </Link>
        </div>
      </section>
    </main>
  );
}

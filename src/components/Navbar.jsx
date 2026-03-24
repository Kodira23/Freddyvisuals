import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const links = [
  { to: '/',         label: 'Home' },
  { to: '/gallery',  label: 'Gallery' },
  { to: '/services', label: 'Services' },
  { to: '/album',    label: 'Albums' },
  { to: '/contact',  label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const location                = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">

        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-freddie">Freddie </span>
          <span className="navbar__brand-visuals">Visuals</span>
        </Link>

        <ul className="navbar__links">
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`navbar__link ${location.pathname === l.to ? 'navbar__link--active' : ''}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="navbar__hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="navbar__accent" />

      <div className={`navbar__mobile${open ? ' navbar__mobile--open' : ''}`}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`navbar__mobile-link ${location.pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
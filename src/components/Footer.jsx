import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, Youtube } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top container">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-text">Freddie</span>
            <span className="footer__logo-sub">Visuals</span>
          </div>
          <p className="footer__tagline">
            Weddings. Events. Portraits. Maternity. Videography.<br />
            Every story told with soul and cinematic craft.
          </p>
          <div className="footer__socials">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
            <a href="mailto:hello@freddievisuals.com" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>

        <div className="footer__links">
          <h4>Navigate</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/album">Album</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer__contact">
          <h4>Get in Touch</h4>
          <ul>
            <li><Phone size={14} /> +254 700 000 000</li>
            <li><Mail size={14} /> hello@freddievisuals.com</li>
            <li><MapPin size={14} /> Nairobi, Kenya</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom container">
        <p>© {new Date().getFullYear()} Freddie Visuals. All rights reserved.</p>
        <p>Photography & Videography — Nairobi, Kenya</p>
      </div>
    </footer>
  );
}

import { Mail, Phone, MapPin } from 'lucide-react';
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
            <a href="https://www.instagram.com/freddie_visuals?utm_source=qr&igsh=MThzbnZtYnFzanI5cQ==" aria-label="Instagram" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/share/16mfHvVDrD/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://wa.me/message/JZMVENLFTEZAA1" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="https://www.tiktok.com/@freddie_visuals?is_from_webapp=1&sender_device=pc" aria-label="TikTok" target="_blank" rel="noopener noreferrer">TikTok</a>
          </div>
        </div>

        <div className="footer__contact">
          <h4>Get in Touch</h4>
          <ul>
            <li><Phone size={14} /> +254 708422738</li>
            <li><Mail size={14} /> Freddie2074@gmail.com</li>
            <li><MapPin size={14} /> Nairobi, Kenya</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom container">
        <p>© {new Date().getFullYear()} Freddie_Visuals. All rights reserved | Powered by Kodira designers Ltd.</p>
        <p>Photography & Videography — Nairobi, Kenya</p>
      </div>
    </footer>
  );
}

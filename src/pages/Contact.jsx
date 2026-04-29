import { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, CheckCircle, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Contact.css';

const EVENT_TYPES = ['Wedding', 'Event / Gala', 'Portrait Session', 'Maternity Session', 'Videography', 'Commercial / Brand', 'Other'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', event_type: '', event_date: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('inquiries').insert([form]);
    if (err) {
      setError('Something went wrong. Please email us directly at hello@freddievisuals.com');
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  return (
    <main className="contact-page">
      <div className="contact-hero container">
        <p className="section-label">Freddie Visuals</p>
        <h1 className="section-title">Let's Create <em>Together</em></h1>
        <div className="divider" />
      </div>

      <div className="contact-body container">
        <div className="contact-info">
          <p className="contact-info__intro">
            Every great image starts with a conversation. Tell us about your upcoming wedding, event, maternity session, or video project — we'll respond within 24 hours.
          </p>
          <ul className="contact-details">
            <li>
              <div className="contact-detail__icon"><Phone size={16} /></div>
              <div>
                <span className="contact-detail__label">Phone / WhatsApp</span>
                <a href="tel:+254700000000">+254 708422738</a>
              </div>
            </li>
            <li>
              <div className="contact-detail__icon"><Mail size={16} /></div>
              <div>
                <span className="contact-detail__label">Email</span>
                <a href="mailto:hello@freddievisuals.com">freddie2074@gmail.com</a>
              </div>
            </li>
            <li>
              <div className="contact-detail__icon"><MapPin size={16} /></div>
              <div>
                <span className="contact-detail__label">Based In</span>
                <span>Nairobi, Kenya · Available Nationwide</span>
              </div>
            </li>
          </ul>
          <div className="contact-socials">
            <p className="section-label" style={{ marginBottom: '1rem' }}>Follow the Work</p>
            <div className="contact-social-links">
              <a href="#"><Instagram size={18} /> @freddie.visuals</a>
              <a href="#"><Facebook size={18} /> Freddie Visuals</a>
              <a href="#"><Youtube size={18} /> Freddie Visuals Films</a>
            </div>
          </div>
        </div>

        <div className="contact-form-wrap">
          {submitted ? (
            <div className="contact-success">
              <CheckCircle size={52} />
              <h2>Message Received!</h2>
              <p>Thank you for reaching out to Freddie Visuals. We'll get back to you within 24 hours to discuss your vision.</p>
              <button className="btn btn-outline" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', event_type: '', event_date: '', message: '' }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone / WhatsApp</label>
                  <input name="phone" value={form.phone} onChange={onChange} placeholder="+254 ..." />
                </div>
                <div className="form-group">
                  <label>Session / Service Type</label>
                  <select name="event_type" value={form.event_type} onChange={onChange}>
                    <option value="">Select type…</option>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Event / Session Date</label>
                <input name="event_date" type="date" value={form.event_date} onChange={onChange} />
              </div>
              <div className="form-group">
                <label>Tell Us About Your Vision *</label>
                <textarea name="message" value={form.message} onChange={onChange} rows={5} placeholder="Describe your event, style preferences, location, any inspiration — the more detail the better!" required />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                {loading ? 'Sending…' : 'Send Inquiry to Freddie Visuals'}
              </button>
              <p style={{ fontSize: '0.65rem', color: 'var(--muted)', textAlign: 'center' }}>
                We respond to all inquiries within 24 hours.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

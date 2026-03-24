# Freddie Visuals — Photography & Videography Website

A full-featured, dark cinematic photography website built with React + Vite + Supabase.

## Pages
- **Home** — Hero slider (Weddings/Events/Maternity/Portraits), stats, about, niches, gallery preview, testimonial, CTA
- **Gallery** — Filterable masonry grid with lightbox (Wedding, Events, Portrait, Maternity, Videography)
- **Services** — 6 service packages (Wedding, Events, Portraits, Maternity, Videography, Commercial) with tab navigation
- **Client Gallery** — Password-protected private client gallery with download support
- **Contact** — Booking inquiry form saved to Supabase

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Supabase project
Go to https://supabase.com and create a free project.

### 3. Run SQL schema
In your Supabase SQL editor, run the schema found in `src/lib/supabase.js` (copy the commented SQL block).

### 4. Configure environment
```bash
cp .env.example .env.local
# Then fill in your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 5. Run locally
```bash
npm run dev
```

### 6. Deploy
Deploy to Vercel, Netlify, or any static host:
```bash
npm run build
# Upload the /dist folder
```

## Supabase Tables
| Table | Purpose |
|-------|---------|
| `gallery` | Public portfolio images |
| `services` | Service packages |
| `client_galleries` | Client gallery records with access codes |
| `client_photos` | Photos inside client galleries |
| `inquiries` | Contact form submissions |

## Brand
- **Studio**: Freddie Visuals
- **Location**: Nairobi, Kenya
- **Aesthetic**: Dark & Cinematic
- **Niches**: Weddings · Events · Portraits · Maternity · Videography

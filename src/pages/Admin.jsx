import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  Lock, LogOut, LayoutDashboard, Image, Briefcase,
  BookOpen, Mail, Plus, Trash2, Edit3, Save, X, Check,
  Eye, EyeOff, ChevronDown, ChevronUp,
  AlertCircle, CloudUpload, Loader, Star, StarOff,
  Phone, Calendar, MessageSquare,
  CheckCircle2, Upload, Video
} from 'lucide-react';
import './Admin.css';

const ADMIN_PASSWORD = 'freddievisuals2024';
const BUCKET_GALLERY  = 'gallery';
const BUCKET_CLIENTS  = 'client-photos';
const BUCKET_SERVICES = 'service-covers';
const GALLERY_CATS    = ['Wedding','Events','Portrait','Maternity','Videography','Commercial'];
const SERVICE_TITLES  = ['Wedding Photography','Events Coverage','Portrait Sessions','Maternity Photography','Videography','Commercial & Brand'];

// ── File type helpers ─────────────────────────────────────────────────
async function uploadFile(bucket, file) {
  const ext  = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Could not get public URL — is the bucket set to Public?');
  return data.publicUrl;
}

function isImageFile(file) {
  if (file.type.startsWith('image/')) return true;
  return /\.(heic|heif|avif|tiff|tif|jfif|webp|jpg|jpeg|png|gif|bmp|svg)$/i.test(file.name);
}

function isVideoFile(file) {
  if (file.type.startsWith('video/')) return true;
  return /\.(mp4|mov|avi|webm|mkv|m4v|wmv|flv|3gp)$/i.test(file.name);
}

function isMediaFile(file, allowVideo = false) {
  return isImageFile(file) || (allowVideo && isVideoFile(file));
}

// ── Inline delete confirmation (no modal overlay) ─────────────────────
function InlineConfirm({ onConfirm, onCancel }) {
  return (
    <div className="inline-confirm">
      <span>Delete?</span>
      <button className="inline-confirm__yes" onClick={onConfirm}><Check size={11} /> Yes</button>
      <button className="inline-confirm__no"  onClick={onCancel}><X size={11} /> No</button>
    </div>
  );
}

// ── Drag-and-drop upload zone ──────────────────────────────────────────
function DropZone({ onFiles, uploading, multiple = true, label = 'Drag & drop photos here, or click to browse', allowVideo = false }) {
  const ref = useRef();
  const [over, setOver] = useState(false);

  const drop = useCallback(e => {
    e.preventDefault();
    setOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => isMediaFile(f, allowVideo));
    if (files.length) onFiles(files);
  }, [onFiles, allowVideo]);

  const acceptAttr = allowVideo
    ? 'image/*,video/*,.heic,.heif,.avif,.tiff,.tif,.jfif,.mp4,.mov,.avi,.webm,.mkv,.m4v'
    : 'image/*,.heic,.heif,.avif,.tiff,.tif,.jfif';

  const formatHint = allowVideo
    ? 'JPG · PNG · WEBP · HEIC · MP4 · MOV · WEBM · AVI'
    : 'JPG · PNG · WEBP · HEIC · AVIF · TIFF';

  return (
    <div
      className={`dropzone ${over ? 'dropzone--over' : ''} ${uploading ? 'dropzone--busy' : ''}`}
      onClick={() => !uploading && ref.current.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <input
        ref={ref}
        type="file"
        accept={acceptAttr}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={e => {
          const f = Array.from(e.target.files).filter(file => isMediaFile(file, allowVideo));
          if (f.length) onFiles(f);
          e.target.value = '';
        }}
      />
      {uploading
        ? <><Loader size={26} className="spin" /><p>Uploading to Supabase Storage…</p></>
        : <>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <CloudUpload size={28} />
              {allowVideo && <Video size={28} />}
            </div>
            <p>{label}</p>
            <span>{formatHint}</span>
          </>
      }
    </div>
  );
}

// ── Upload progress bar ───────────────────────────────────────────────
function UploadProgress({ items }) {
  if (!items.length) return null;
  return (
    <ul className="upload-list">
      {items.map((p, i) => (
        <li key={i} data-status={p.status}>
          {p.status === 'uploading' && <Loader size={12} className="spin" />}
          {p.status === 'done'      && <CheckCircle2 size={12} />}
          {p.status === 'error'     && <X size={12} />}
          <span>{p.name}</span>
          {p.err && <small style={{ color: '#e74c3c' }}>{p.err}</small>}
        </li>
      ))}
    </ul>
  );
}

// ── Media preview (image or video) ───────────────────────────────────
function MediaPreview({ src, alt, file, className, onError }) {
  const isVid = file ? isVideoFile(file) : /\.(mp4|mov|avi|webm|mkv|m4v|wmv|flv|3gp)$/i.test(src || '');
  if (isVid) {
    return (
      <video
        src={src}
        className={className}
        controls={false}
        muted
        playsInline
        preload="metadata"
        onError={onError}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    );
  }
  return <img src={src} alt={alt} className={className} onError={onError} />;
}

// ── Pre-upload confirm panel ──────────────────────────────────────────
function UploadConfirmPanel({ files, cat, featured, onConfirm, onCancel, uploading }) {
  const [names, setNames] = useState(() =>
    files.map(f => f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  );

  return (
    <div className="upload-confirm-panel">
      <div className="upload-confirm-panel__header">
        <Upload size={15} />
        <strong>Confirm Upload — {files.length} file{files.length > 1 ? 's' : ''}</strong>
        <button className="adm-icon-btn" onClick={onCancel} disabled={uploading}><X size={14} /></button>
      </div>

      <div className="upload-confirm-panel__list">
        {files.map((file, i) => {
          const preview = URL.createObjectURL(file);
          const isVid = isVideoFile(file);
          return (
            <div key={i} className="upload-confirm-item">
              {isVid ? (
                <div className="upload-confirm-item__thumb upload-confirm-item__thumb--video">
                  <video src={preview} muted playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="upload-confirm-item__vid-badge"><Video size={12} /> Video</div>
                </div>
              ) : (
                <img src={preview} alt="" className="upload-confirm-item__thumb" />
              )}
              <div className="upload-confirm-item__info">
                <input
                  className="upload-confirm-item__name"
                  value={names[i]}
                  onChange={e => setNames(n => n.map((v, j) => j === i ? e.target.value : v))}
                  placeholder="File name…"
                />
                <span className="adm-tag">{cat}{featured ? ' · Featured' : ''}{isVid ? ' · Video' : ''}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="upload-confirm-panel__footer">
        <button className="adm-btn-primary" onClick={() => onConfirm(names)} disabled={uploading}>
          {uploading ? <><Loader size={13} className="spin" /> Uploading…</> : <><Check size={13} /> Upload {files.length} File{files.length > 1 ? 's' : ''}</>}
        </button>
        <button className="adm-btn-outline" onClick={onCancel} disabled={uploading}>Cancel</button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════
export default function Admin() {
  const [authed,  setAuthed]  = useState(() => sessionStorage.getItem('fv_admin') === '1');
  const [pwd,     setPwd]     = useState('');
  const [pwdErr,  setPwdErr]  = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [tab,     setTab]     = useState('dashboard');

  function login(e) {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) { sessionStorage.setItem('fv_admin', '1'); setAuthed(true); }
    else setPwdErr('Incorrect password. Try again.');
  }
  function logout() { sessionStorage.removeItem('fv_admin'); setAuthed(false); setPwd(''); }

  if (!authed) return (
    <div className="adm-login">
      <div className="adm-login__card">
        <div className="adm-brand">Freddie<span>Visuals</span></div>
        <div className="adm-login__icon"><Lock size={26} /></div>
        <h1>Admin Dashboard</h1>
        <p>Upload photos · Manage albums · Edit services · View bookings</p>
        <form onSubmit={login}>
          <div className="adm-input-row">
            <input
              className="adm-input"
              type={showPwd ? 'text' : 'password'}
              value={pwd}
              onChange={e => { setPwd(e.target.value); setPwdErr(''); }}
              placeholder="Enter admin password"
              required
            />
            <button type="button" className="adm-eye" onClick={() => setShowPwd(s => !s)}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {pwdErr && <p className="adm-err"><AlertCircle size={13} /> {pwdErr}</p>}
          <button type="submit" className="adm-btn-primary">Enter Dashboard</button>
        </form>
        <p className="adm-hint">Default: <code>freddievisuals2024</code> — change in Admin.jsx line 14</p>
      </div>
    </div>
  );

  const SIDEBAR = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
    { id: 'gallery',   icon: Image,           label: 'Gallery'     },
    { id: 'albums',    icon: BookOpen,         label: 'Albums'      },
    { id: 'services',  icon: Briefcase,        label: 'Services'    },
    { id: 'inquiries', icon: Mail,             label: 'Inquiries'   },
  ];

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__top">
          <div className="adm-brand adm-brand--sm">Freddie<span>Visuals</span><em>Admin</em></div>
          <nav className="adm-nav">
            {SIDEBAR.map(({ id, icon: Icon, label }) => (
              <button key={id} className={`adm-nav__item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                <Icon size={16} />{label}
              </button>
            ))}
          </nav>
        </div>
        <button className="adm-logout" onClick={logout}><LogOut size={14} /> Sign Out</button>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <h2 className="adm-topbar__title">
            {tab === 'dashboard' && 'Dashboard Overview'}
            {tab === 'gallery'   && 'Gallery Management'}
            {tab === 'albums'    && 'Client Albums'}
            {tab === 'services'  && 'Services & Pricing'}
            {tab === 'inquiries' && 'Booking Inquiries'}
          </h2>
          <div className="adm-topbar__right">
            <a href="/" target="_blank" className="adm-btn-ghost">View Website ↗</a>
          </div>
        </header>
        <div className="adm-body">
          {tab === 'dashboard' && <DashboardTab setTab={setTab} />}
          {tab === 'gallery'   && <GalleryTab />}
          {tab === 'albums'    && <AlbumsTab />}
          {tab === 'services'  && <ServicesTab />}
          {tab === 'inquiries' && <InquiriesTab />}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════════
function DashboardTab({ setTab }) {
  const [stats,  setStats]  = useState({ gallery: 0, albums: 0, services: 0, inquiries: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    async function load() {
      const [g, a, s, i] = await Promise.all([
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('client_galleries').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ gallery: g.count || 0, albums: a.count || 0, services: s.count || 0, inquiries: i.count || 0 });
      const { data } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5);
      setRecent(data || []);
    }
    load();
  }, []);

  const cards = [
    { label: 'Gallery Photos', value: stats.gallery,   icon: Image,     color: '#c9a96e', tab: 'gallery'   },
    { label: 'Client Albums',  value: stats.albums,    icon: BookOpen,  color: '#7eb8c9', tab: 'albums'    },
    { label: 'Services',       value: stats.services,  icon: Briefcase, color: '#9ec97e', tab: 'services'  },
    { label: 'New Inquiries',  value: stats.inquiries, icon: Mail,      color: '#c97e9e', tab: 'inquiries' },
  ];

  return (
    <div className="adm-dashboard">
      <div className="adm-stats-grid">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.label} className="adm-stat-card" onClick={() => setTab(c.tab)}>
              <div className="adm-stat-card__icon" style={{ background: c.color + '18', color: c.color }}>
                <Icon size={20} />
              </div>
              <div className="adm-stat-card__info">
                <span className="adm-stat-card__num">{c.value}</span>
                <span className="adm-stat-card__label">{c.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="adm-dash-grid">
        <div className="adm-panel">
          <h3 className="adm-panel__title">Quick Actions</h3>
          <div className="adm-quick-actions">
            {[
              { label: 'Upload Gallery Photos', icon: Image,     tab: 'gallery'   },
              { label: 'Create Client Album',   icon: BookOpen,  tab: 'albums'    },
              { label: 'Add Service Package',   icon: Briefcase, tab: 'services'  },
              { label: 'View Inquiries',        icon: Mail,      tab: 'inquiries' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.tab} className="adm-quick-btn" onClick={() => setTab(a.tab)}>
                  <Icon size={16} /> {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="adm-panel">
          <h3 className="adm-panel__title">Recent Inquiries</h3>
          {recent.length === 0
            ? <p className="adm-muted">No inquiries yet.</p>
            : <ul className="adm-recent-list">
                {recent.map(r => (
                  <li key={r.id}>
                    <div>
                      <strong>{r.name}</strong>
                      <span>{r.event_type || 'General'}</span>
                    </div>
                    <span>{new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  </li>
                ))}
              </ul>
          }
        </div>

        <div className="adm-panel adm-panel--full">
          <h3 className="adm-panel__title">Supabase Setup Checklist</h3>
          <ul className="adm-checklist">
            {[
              { done: true,  text: 'Create Supabase project and add credentials to .env.local' },
              { done: false, text: 'Run SQL schema from src/lib/supabase.js in your Supabase SQL Editor' },
              { done: false, text: 'Create Storage bucket named "gallery" (set to Public) — supports images AND videos' },
              { done: false, text: 'Create Storage bucket named "client-photos" (Private)' },
              { done: false, text: 'Create Storage bucket named "service-covers" (set to Public) — supports images AND videos' },
              { done: false, text: 'Set RLS policies: allow public SELECT on gallery, authenticated INSERT on all' },
              { done: false, text: 'Upload your first gallery photos using the Gallery tab above' },
              { done: false, text: 'Create your first client album using the Albums tab' },
            ].map((item, i) => (
              <li key={i} className={item.done ? 'done' : ''}>
                {item.done ? <CheckCircle2 size={15} /> : <div className="adm-checklist__circle">{i + 1}</div>}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// GALLERY TAB — supports video uploads for Videography category
// ═════════════════════════════════════════════════════════════════════
function GalleryTab() {
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState([]);
  const [cat,         setCat]         = useState('Wedding');
  const [featured,    setFeatured]    = useState(false);
  const [filter,      setFilter]      = useState('All');
  const [msg,         setMsg]         = useState('');
  const [errMsg,      setErrMsg]      = useState('');

  const [pendingFiles,    setPendingFiles]    = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingId,       setEditingId]       = useState(null);
  const [editingName,     setEditingName]     = useState('');

  // Whether the currently selected category allows video
  const isVideography = cat === 'Videography';

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (error) console.error('Gallery load error:', error);
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function handleFiles(files) {
    setPendingFiles(files);
  }

  async function doUpload(names) {
    const files = pendingFiles;
    setPendingFiles(null);
    setUploading(true);
    setErrMsg('');
    setProgress(files.map(f => ({ name: f.name, status: 'pending' })));

    for (let i = 0; i < files.length; i++) {
      setProgress(p => p.map((x, j) => j === i ? { ...x, status: 'uploading' } : x));
      try {
        const url = await uploadFile(BUCKET_GALLERY, files[i]);
        const title = names[i] || files[i].name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        const media_type = isVideoFile(files[i]) ? 'video' : 'image';
        const { error: insertError } = await supabase.from('gallery').insert([{ title, category: cat, image_url: url, featured, media_type }]);
        if (insertError) throw new Error(insertError.message);
        setProgress(p => p.map((x, j) => j === i ? { ...x, status: 'done' } : x));
      } catch (err) {
        setProgress(p => p.map((x, j) => j === i ? { ...x, status: 'error', err: err.message } : x));
        setErrMsg(`Error: ${err.message}`);
      }
    }

    setUploading(false);
    setMsg(`✓ ${files.length} file(s) processed.`);
    setTimeout(() => { setMsg(''); setErrMsg(''); setProgress([]); }, 6000);
    load();
  }

  async function toggleFeatured(item) {
    await supabase.from('gallery').update({ featured: !item.featured }).eq('id', item.id);
    load();
  }

  async function doDelete(item) {
    setDeleteConfirmId(null);
    try {
      const path = item.image_url.split(`/${BUCKET_GALLERY}/`)[1];
      if (path) await supabase.storage.from(BUCKET_GALLERY).remove([path]);
    } catch (e) { console.warn('Storage delete failed:', e); }
    await supabase.from('gallery').delete().eq('id', item.id);
    load();
  }

  async function saveEditName(id) {
    if (editingName.trim()) {
      await supabase.from('gallery').update({ title: editingName.trim() }).eq('id', id);
      load();
    }
    setEditingId(null);
    setEditingName('');
  }

  const filtered = filter === 'All' ? rows : rows.filter(r => r.category === filter);

  return (
    <div>
      <div className="adm-notice">
        <AlertCircle size={14} />
        <span>
          Photos/videos upload to your <strong>Supabase Storage</strong> bucket <code>gallery</code>.
          Make sure the bucket is set to <strong>Public</strong>.
          {' '}<strong>Videography</strong> category accepts both images and videos (MP4, MOV, WEBM).
        </span>
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title">Upload to Gallery</h3>
        <div className="adm-upload-opts">
          <div className="adm-field">
            <label>Category</label>
            <select value={cat} onChange={e => { setCat(e.target.value); setPendingFiles(null); }}>
              {GALLERY_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {isVideography && (
            <div className="adm-notice adm-notice--inline" style={{ marginBottom: 0 }}>
              <Video size={13} />
              <span>Videography mode — accepts <strong>photos and videos</strong> (MP4 · MOV · WEBM · AVI)</span>
            </div>
          )}
          <label className="adm-check">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
            Feature on Home page
          </label>
        </div>

        {pendingFiles ? (
          <UploadConfirmPanel
            files={pendingFiles}
            cat={cat}
            featured={featured}
            onConfirm={doUpload}
            onCancel={() => setPendingFiles(null)}
            uploading={uploading}
          />
        ) : (
          <DropZone
            onFiles={handleFiles}
            uploading={uploading}
            allowVideo={isVideography}
            label={isVideography
              ? 'Drag & drop photos or videos here, or click to browse'
              : 'Drag & drop photos here, or click to browse'}
          />
        )}

        <UploadProgress items={progress} />
        {errMsg && <p className="adm-err" style={{ marginTop: '0.5rem' }}><AlertCircle size={13} /> {errMsg}</p>}
        {msg    && <p className="adm-success">{msg}</p>}
      </div>

      <div className="adm-filter-bar">
        {['All', ...GALLERY_CATS].map(c => (
          <button key={c} className={`adm-filter ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c}
            <span>{c === 'All' ? rows.length : rows.filter(r => r.category === c).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-loading"><Loader size={20} className="spin" /> Loading gallery…</div>
      ) : (
        <div className="adm-gallery-grid">
          {filtered.map(row => {
            const isVid = row.media_type === 'video' || isVideoFile({ name: row.image_url });
            return (
              <div key={row.id} className={`adm-gal-item ${row.featured ? 'adm-gal-item--star' : ''} ${isVid ? 'adm-gal-item--video' : ''}`}>
                {isVid ? (
                  <video
                    src={row.image_url}
                    muted
                    playsInline
                    preload="metadata"
                    controls
                    onError={e => { e.target.style.opacity = '0.2'; e.target.title = 'Failed to load video'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <img
                    src={row.image_url}
                    alt={row.title}
                    onError={e => {
                      e.target.style.opacity = '0.2';
                      e.target.title = 'Failed to load — check bucket is Public in Supabase';
                    }}
                  />
                )}
                {isVid && <div className="adm-gal-item__vid-badge"><Video size={11} /> Video</div>}
                <div className="adm-gal-item__info">
                  <span className="adm-gal-item__cat">{row.category}</span>

                  {editingId === row.id ? (
                    <div className="adm-gal-item__name-edit">
                      <input
                        autoFocus
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEditName(row.id);
                          if (e.key === 'Escape') { setEditingId(null); setEditingName(''); }
                        }}
                        className="adm-gal-item__name-input"
                      />
                      <button onClick={() => saveEditName(row.id)} className="green" title="Save"><Check size={11} /></button>
                      <button onClick={() => { setEditingId(null); setEditingName(''); }} title="Cancel"><X size={11} /></button>
                    </div>
                  ) : (
                    <span
                      className="adm-gal-item__title adm-gal-item__title--editable"
                      title="Click to rename"
                      onClick={() => { setEditingId(row.id); setEditingName(row.title); setDeleteConfirmId(null); }}
                    >
                      {row.title} <Edit3 size={10} className="adm-edit-hint" />
                    </span>
                  )}

                  <div className="adm-gal-item__btns">
                    <button
                      onClick={() => { toggleFeatured(row); }}
                      title={row.featured ? 'Unfeature' : 'Feature'}
                      className={row.featured ? 'gold' : ''}
                    >
                      {row.featured ? <Star size={13} fill="currentColor" /> : <StarOff size={13} />}
                    </button>

                    {deleteConfirmId === row.id ? (
                      <InlineConfirm
                        onConfirm={() => doDelete(row)}
                        onCancel={() => setDeleteConfirmId(null)}
                      />
                    ) : (
                      <button
                        onClick={() => { setDeleteConfirmId(row.id); setEditingId(null); }}
                        className="red"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                {row.featured && <div className="adm-gal-item__badge">Featured</div>}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="adm-empty-grid">No photos yet — upload some above.</div>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// ALBUMS TAB
// ═════════════════════════════════════════════════════════════════════
function AlbumsTab() {
  const [rows,            setRows]            = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [expanded,        setExpanded]        = useState(null);
  const [photos,          setPhotos]          = useState({});
  const [uploading,       setUploading]       = useState(null);
  const [progress,        setProgress]        = useState([]);
  const [form,            setForm]            = useState({ client_name: '', event_name: '', event_date: '', access_code: '' });
  const [saving,          setSaving]          = useState(false);
  const [msg,             setMsg]             = useState('');
  const [deleteAlbumId,   setDeleteAlbumId]   = useState(null);
  const [deletePhotoInfo, setDeletePhotoInfo] = useState(null);

  const [pendingClientFiles, setPendingClientFiles] = useState(null);
  const [pendingGalleryId,   setPendingGalleryId]   = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('client_galleries').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function loadPhotos(gid) {
    const { data } = await supabase.from('client_photos').select('*').eq('gallery_id', gid).order('created_at');
    setPhotos(p => ({ ...p, [gid]: data || [] }));
  }

  function toggleExpand(id) {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next && !photos[next]) loadPhotos(next);
  }

  async function createAlbum(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('client_galleries').insert([form]);
    if (!error) {
      setForm({ client_name: '', event_name: '', event_date: '', access_code: '' });
      setMsg('✓ Album created! Share the access code with your client.');
      load();
    } else {
      setMsg('Error: ' + error.message);
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 5000);
  }

  async function uploadPhotos(gid, files, names) {
    setPendingClientFiles(null);
    setPendingGalleryId(null);
    setUploading(gid);
    setProgress(files.map(f => ({ name: f.name, status: 'pending' })));
    for (let i = 0; i < files.length; i++) {
      setProgress(p => p.map((x, j) => j === i ? { ...x, status: 'uploading' } : x));
      try {
        const url = await uploadFile(BUCKET_CLIENTS, files[i]);
        const caption = names ? names[i] : '';
        const { error } = await supabase.from('client_photos').insert([{ gallery_id: gid, image_url: url, caption }]);
        if (error) throw new Error(error.message);
        setProgress(p => p.map((x, j) => j === i ? { ...x, status: 'done' } : x));
      } catch (err) {
        setProgress(p => p.map((x, j) => j === i ? { ...x, status: 'error', err: err.message } : x));
      }
    }
    setUploading(null);
    setTimeout(() => setProgress([]), 4000);
    loadPhotos(gid);
  }

  async function doDeletePhoto() {
    const { pid, gid } = deletePhotoInfo;
    setDeletePhotoInfo(null);
    const photo = photos[gid]?.find(p => p.id === pid);
    if (photo) {
      try {
        const path = photo.image_url.split(`/${BUCKET_CLIENTS}/`)[1];
        if (path) await supabase.storage.from(BUCKET_CLIENTS).remove([path]);
      } catch (e) { console.warn('Storage delete failed:', e); }
    }
    await supabase.from('client_photos').delete().eq('id', pid);
    loadPhotos(gid);
  }

  async function doDeleteAlbum() {
    const id = deleteAlbumId;
    setDeleteAlbumId(null);
    await supabase.from('client_galleries').delete().eq('id', id);
    load();
  }

  function autoCode(name) {
    const slug = name.toLowerCase().replace(/\s+/g, '').slice(0, 6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    setForm(f => ({ ...f, access_code: `${slug}${rand}` }));
  }

  return (
    <div>
      <div className="adm-notice">
        <AlertCircle size={14} />
        <span>Photos upload to Supabase Storage bucket <code>client-photos</code>. Clients access their album using the code at <strong>/album</strong>.</span>
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title">Create New Client Album</h3>
        <form onSubmit={createAlbum}>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label>Client Name *</label>
              <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="e.g. Amara & James" required />
            </div>
            <div className="adm-field">
              <label>Event Name</label>
              <input value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} placeholder="e.g. Wedding Day" />
            </div>
            <div className="adm-field">
              <label>Event Date</label>
              <input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
            </div>
            <div className="adm-field">
              <label>Access Code *</label>
              <div className="adm-field__row">
                <input value={form.access_code} onChange={e => setForm(f => ({ ...f, access_code: e.target.value }))} placeholder="e.g. amara8472" required />
                <button type="button" className="adm-btn-outline adm-btn-sm" onClick={() => autoCode(form.client_name)}>Auto</button>
              </div>
            </div>
          </div>
          <button type="submit" className="adm-btn-primary" disabled={saving}>
            <Plus size={14} /> {saving ? 'Creating…' : 'Create Album'}
          </button>
          {msg && <p className="adm-success" style={{ marginTop: '0.75rem' }}>{msg}</p>}
        </form>
      </div>

      {loading ? <div className="adm-loading"><Loader size={18} className="spin" /> Loading…</div> : (
        <div className="adm-album-list">
          {rows.map(row => (
            <div key={row.id} className="adm-album-card">
              <div className="adm-album-card__header" onClick={() => toggleExpand(row.id)}>
                <div className="adm-album-card__info">
                  <h3>{row.client_name}</h3>
                  <div className="adm-album-card__meta">
                    {row.event_name && <span className="adm-tag">{row.event_name}</span>}
                    {row.event_date && <span className="adm-muted-sm">{new Date(row.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    <span className="adm-code-badge"><Lock size={11} /> {row.access_code}</span>
                    {photos[row.id] && <span className="adm-muted-sm">{photos[row.id].length} photos</span>}
                  </div>
                </div>
                <div className="adm-album-card__actions">
                  {deleteAlbumId === row.id ? (
                    <InlineConfirm
                      onConfirm={doDeleteAlbum}
                      onCancel={() => setDeleteAlbumId(null)}
                    />
                  ) : (
                    <button className="adm-icon-btn red" onClick={e => { e.stopPropagation(); setDeleteAlbumId(row.id); }}><Trash2 size={14} /></button>
                  )}
                  {expanded === row.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expanded === row.id && (
                <div className="adm-album-card__body">
                  {pendingClientFiles && pendingGalleryId === row.id ? (
                    <UploadConfirmPanel
                      files={pendingClientFiles}
                      cat={row.client_name}
                      featured={false}
                      onConfirm={names => uploadPhotos(row.id, pendingClientFiles, names)}
                      onCancel={() => { setPendingClientFiles(null); setPendingGalleryId(null); }}
                      uploading={uploading === row.id}
                    />
                  ) : (
                    <DropZone
                      onFiles={files => { setPendingClientFiles(files); setPendingGalleryId(row.id); }}
                      uploading={uploading === row.id}
                      label={`Drop photos for ${row.client_name} here`}
                    />
                  )}
                  {uploading === row.id && <UploadProgress items={progress} />}
                  <div className="adm-client-photos-grid">
                    {(photos[row.id] || []).map(p => (
                      <div key={p.id} className="adm-client-photo">
                        <img src={p.image_url} alt="" onError={e => { e.target.style.opacity = '0.2'; }} />
                        {deletePhotoInfo?.pid === p.id ? (
                          <div className="adm-client-photo__inline-del">
                            <InlineConfirm
                              onConfirm={doDeletePhoto}
                              onCancel={() => setDeletePhotoInfo(null)}
                            />
                          </div>
                        ) : (
                          <button className="adm-client-photo__del" onClick={() => setDeletePhotoInfo({ pid: p.id, gid: row.id })}><X size={11} /></button>
                        )}
                      </div>
                    ))}
                    {(photos[row.id] || []).length === 0 && !uploading && (
                      <p className="adm-muted" style={{ gridColumn: '1/-1', padding: '1rem 0' }}>No photos yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && <div className="adm-empty">No albums yet. Create one above.</div>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// SERVICES TAB — supports video cover for Videography service
// ═════════════════════════════════════════════════════════════════════
function ServicesTab() {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(null);
  const [open,       setOpen]       = useState(false);
  const [imgFile,    setImgFile]    = useState(null);
  const [imgPrev,    setImgPrev]    = useState('');
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState('');
  const [deleteId,   setDeleteId]   = useState(null);
  const [form,       setForm]       = useState({ title: '', description: '', price_from: '', duration: '', image_url: '', features: '' });

  // Is the current form for Videography?
  const isVideographyService = form.title === 'Videography';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('created_at');
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    let image_url = form.image_url;
    if (imgFile) {
      try { image_url = await uploadFile(BUCKET_SERVICES, imgFile); }
      catch (err) { setMsg('Upload failed: ' + err.message); setSaving(false); return; }
    }
    const payload = {
      ...form,
      price_from: parseFloat(form.price_from) || null,
      image_url,
      features: form.features ? form.features.split('\n').map(s => s.trim()).filter(Boolean) : [],
    };
    if (editing) await supabase.from('services').update(payload).eq('id', editing);
    else         await supabase.from('services').insert([payload]);
    setEditing(null); setOpen(false); setImgFile(null); setImgPrev('');
    setForm({ title: '', description: '', price_from: '', duration: '', image_url: '', features: '' });
    setMsg('✓ Service saved!');
    load();
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  }

  function startEdit(row) {
    setEditing(row.id); setOpen(true); setImgFile(null); setImgPrev('');
    setForm({
      title: row.title || '', description: row.description || '',
      price_from: row.price_from || '', duration: row.duration || '',
      image_url: row.image_url || '', features: (row.features || []).join('\n'),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function doDelete() {
    const id = deleteId;
    setDeleteId(null);
    await supabase.from('services').delete().eq('id', id);
    load();
  }

  // Determine if current cover is a video
  const coverIsVideo = imgFile ? isVideoFile(imgFile) : /\.(mp4|mov|avi|webm|mkv|m4v)$/i.test(form.image_url || '');

  return (
    <div>
      <div className="adm-section-actions">
        {!open && (
          <button className="adm-btn-primary" onClick={() => {
            setOpen(true); setEditing(null); setImgFile(null); setImgPrev('');
            setForm({ title: '', description: '', price_from: '', duration: '', image_url: '', features: '' });
          }}>
            <Plus size={14} /> Add Service
          </button>
        )}
      </div>

      {open && (
        <div className="adm-card">
          <h3 className="adm-card__title">{editing ? 'Edit Service' : 'New Service Package'}</h3>
          <form onSubmit={save}>
            <div className="adm-form-grid">
              <div className="adm-field">
                <label>Service Title *</label>
                <select value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required>
                  <option value="">Select…</option>
                  {SERVICE_TITLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="adm-field">
                <label>Starting Price (KSH)</label>
                <input
                  type="number"
                  value={form.price_from}
                  onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))}
                  placeholder="e.g. 12000"
                />
              </div>
              <div className="adm-field">
                <label>Duration</label>
                <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. Full Day (8–12 hrs)" />
              </div>
              <div className="adm-field adm-field--wide">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe this package…" />
              </div>
              <div className="adm-field adm-field--wide">
                <label>Inclusions <small>(one per line)</small></label>
                <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={5} placeholder={'Two photographers\nOnline gallery\n...'} />
              </div>
              <div className="adm-field adm-field--wide">
                <label>
                  Cover {isVideographyService ? 'Photo or Video' : 'Photo'}
                  {isVideographyService && (
                    <span className="adm-tag" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
                      <Video size={10} /> Video supported
                    </span>
                  )}
                </label>

                {/* Preview existing cover */}
                {(imgPrev || form.image_url) && (
                  <div className="adm-img-preview">
                    {coverIsVideo ? (
                      <video
                        src={imgPrev || form.image_url}
                        muted
                        playsInline
                        controls
                        preload="metadata"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    ) : (
                      <img src={imgPrev || form.image_url} alt="cover" />
                    )}
                    <button type="button" onClick={() => { setImgFile(null); setImgPrev(''); setForm(f => ({ ...f, image_url: '' })); }}><X size={13} /></button>
                  </div>
                )}

                <DropZone
                  onFiles={files => { setImgFile(files[0]); setImgPrev(URL.createObjectURL(files[0])); }}
                  uploading={false}
                  multiple={false}
                  allowVideo={isVideographyService}
                  label={isVideographyService
                    ? 'Upload service cover photo or video'
                    : 'Upload service cover photo'}
                />
              </div>
            </div>
            <div className="adm-form-actions">
              <button type="submit" className="adm-btn-primary" disabled={saving}>
                <Save size={14} /> {saving ? 'Saving…' : (editing ? 'Update Service' : 'Add Service')}
              </button>
              <button type="button" className="adm-btn-outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</button>
              {msg && <span className="adm-success">{msg}</span>}
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="adm-loading"><Loader size={18} className="spin" /> Loading…</div> : (
        <div className="adm-services-list">
          {rows.map(row => {
            const serviceIsVid = /\.(mp4|mov|avi|webm|mkv|m4v)$/i.test(row.image_url || '');
            return (
              <div key={row.id} className="adm-service-card">
                {row.image_url && (
                  serviceIsVid ? (
                    <video
                      src={row.image_url}
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      onMouseOver={e => e.target.play()}
                      onMouseOut={e => e.target.pause()}
                      className="adm-service-card__img"
                      onError={e => { e.target.style.opacity = '0.2'; }}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={row.image_url}
                      alt={row.title}
                      className="adm-service-card__img"
                      onError={e => { e.target.style.opacity = '0.2'; }}
                    />
                  )
                )}
                <div className="adm-service-card__body">
                  <div className="adm-service-card__top">
                    <div>
                      <h3>{row.title}</h3>
                      <span className="adm-tag">{row.duration}</span>
                      {serviceIsVid && <span className="adm-tag" style={{ marginLeft: '0.25rem' }}><Video size={10} /> Video cover</span>}
                    </div>
                    <div className="adm-service-card__price">
                      KSH {Number(row.price_from || 0).toLocaleString()}
                      <small>from</small>
                    </div>
                  </div>
                  <p className="adm-service-card__desc">{row.description?.slice(0, 110)}…</p>
                  {row.features?.length > 0 && (
                    <ul className="adm-service-card__feats">
                      {row.features.slice(0, 4).map((f, i) => <li key={i}><Check size={11} /> {f}</li>)}
                      {row.features.length > 4 && <li className="adm-muted">+{row.features.length - 4} more</li>}
                    </ul>
                  )}
                  <div className="adm-service-card__actions">
                    <button className="adm-btn-outline adm-btn-sm" onClick={() => startEdit(row)}><Edit3 size={12} /> Edit</button>
                    {deleteId === row.id ? (
                      <InlineConfirm
                        onConfirm={doDelete}
                        onCancel={() => setDeleteId(null)}
                      />
                    ) : (
                      <button className="adm-icon-btn red" onClick={() => setDeleteId(row.id)}><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && <div className="adm-empty">No services. Click "Add Service" above.</div>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// INQUIRIES TAB
// ═════════════════════════════════════════════════════════════════════
function InquiriesTab() {
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) console.error('Inquiries load error:', error);
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function doDelete() {
    const id = deleteId;
    setDeleteId(null);
    await supabase.from('inquiries').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <p className="adm-muted" style={{ marginBottom: '1.5rem' }}>{rows.length} total inquiries from your contact form.</p>

      {loading ? <div className="adm-loading"><Loader size={18} className="spin" /> Loading…</div> : (
        <div className="adm-inquiries">
          {rows.map(row => (
            <div key={row.id} className="adm-inquiry">
              <div className="adm-inquiry__header" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                <div className="adm-inquiry__left">
                  <strong>{row.name}</strong>
                  {row.event_type && <span className="adm-tag">{row.event_type}</span>}
                  <span className="adm-muted-sm">{new Date(row.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="adm-inquiry__right">
                  <a href={`mailto:${row.email}`} className="adm-btn-outline adm-btn-sm" onClick={e => e.stopPropagation()}>Reply</a>
                  {deleteId === row.id ? (
                    <span onClick={e => e.stopPropagation()}>
                      <InlineConfirm
                        onConfirm={doDelete}
                        onCancel={() => setDeleteId(null)}
                      />
                    </span>
                  ) : (
                    <button className="adm-icon-btn red" onClick={e => { e.stopPropagation(); setDeleteId(row.id); }}><Trash2 size={13} /></button>
                  )}
                  {expanded === row.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expanded === row.id && (
                <div className="adm-inquiry__body">
                  <div className="adm-inquiry__details">
                    <div><span><Mail size={11} /> Email</span><a href={`mailto:${row.email}`}>{row.email}</a></div>
                    {row.phone      && <div><span><Phone size={11} /> Phone</span><a href={`tel:${row.phone}`}>{row.phone}</a></div>}
                    {row.event_type && <div><span><Briefcase size={11} /> Service</span><strong>{row.event_type}</strong></div>}
                    {row.event_date && <div><span><Calendar size={11} /> Date</span><strong>{new Date(row.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>}
                  </div>
                  {row.message && (
                    <div className="adm-inquiry__msg">
                      <span><MessageSquare size={11} /> Message</span>
                      <p>{row.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && <div className="adm-empty">No inquiries yet.</div>}
        </div>
      )}
    </div>
  );
}

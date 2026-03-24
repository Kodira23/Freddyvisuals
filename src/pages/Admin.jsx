import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  Lock, LogOut, LayoutDashboard, Image, Briefcase,
  BookOpen, Mail, Plus, Trash2, Edit3, Save, X, Check,
  Eye, EyeOff, ChevronDown, ChevronUp, RefreshCw,
  AlertCircle, CloudUpload, Loader, Star, StarOff,
  Phone, Calendar, MessageSquare, Camera, Users, TrendingUp,
  CheckCircle2
} from 'lucide-react';
import './Admin.css';

const ADMIN_PASSWORD = 'freddievisuals2024';
const BUCKET_GALLERY  = 'gallery';
const BUCKET_CLIENTS  = 'client-photos';
const BUCKET_SERVICES = 'service-covers';
const GALLERY_CATS    = ['Wedding','Events','Portrait','Maternity','Videography','Commercial'];
const SERVICE_TITLES  = ['Wedding Photography','Events Coverage','Portrait Sessions','Maternity Photography','Videography','Commercial & Brand'];

// ── Upload file to Supabase Storage → return public URL ───────────────
async function uploadFile(bucket, file) {
  const ext  = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600' });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// ── Drag-and-drop upload zone ──────────────────────────────────────────
function DropZone({ onFiles, uploading, multiple = true, label = 'Drag & drop photos here, or click to browse' }) {
  const ref = useRef();
  const [over, setOver] = useState(false);
  const drop = useCallback(e => {
    e.preventDefault(); setOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
  }, [onFiles]);
  return (
    <div
      className={`dropzone ${over ? 'dropzone--over' : ''} ${uploading ? 'dropzone--busy' : ''}`}
      onClick={() => !uploading && ref.current.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <input ref={ref} type="file" accept="image/*" multiple={multiple} style={{ display:'none' }}
        onChange={e => { const f = Array.from(e.target.files); if (f.length) onFiles(f); e.target.value=''; }} />
      {uploading
        ? <><Loader size={26} className="spin" /><p>Uploading to Supabase Storage…</p></>
        : <><CloudUpload size={30} /><p>{label}</p><span>JPG · PNG · WEBP</span></>
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
          {p.err && <small>{p.err}</small>}
        </li>
      ))}
    </ul>
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
    if (pwd === ADMIN_PASSWORD) { sessionStorage.setItem('fv_admin','1'); setAuthed(true); }
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
            <button type="button" className="adm-eye" onClick={() => setShowPwd(s=>!s)}>
              {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          {pwdErr && <p className="adm-err"><AlertCircle size={13}/> {pwdErr}</p>}
          <button type="submit" className="adm-btn-primary">Enter Dashboard</button>
        </form>
        <p className="adm-hint">Default: <code>freddievisuals2024</code> — change in Admin.jsx line 14</p>
      </div>
    </div>
  );

  const SIDEBAR = [
    { id:'dashboard', icon: LayoutDashboard, label:'Dashboard'   },
    { id:'gallery',   icon: Image,           label:'Gallery'      },
    { id:'albums',    icon: BookOpen,         label:'Albums'       },
    { id:'services',  icon: Briefcase,        label:'Services'     },
    { id:'inquiries', icon: Mail,             label:'Inquiries'    },
  ];

  return (
    <div className="adm-layout">
      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__top">
          <div className="adm-brand adm-brand--sm">Freddie<span>Visuals</span><em>Admin</em></div>
          <nav className="adm-nav">
            {SIDEBAR.map(({ id, icon: Icon, label }) => (
              <button key={id} className={`adm-nav__item ${tab===id?'active':''}`} onClick={() => setTab(id)}>
                <Icon size={16} />{label}
              </button>
            ))}
          </nav>
        </div>
        <button className="adm-logout" onClick={logout}><LogOut size={14}/> Sign Out</button>
      </aside>

      {/* ── Main ── */}
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
// DASHBOARD OVERVIEW
// ═════════════════════════════════════════════════════════════════════
function DashboardTab({ setTab }) {
  const [stats, setStats] = useState({ gallery:0, albums:0, services:0, inquiries:0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    async function load() {
      const [g, a, s, i] = await Promise.all([
        supabase.from('gallery').select('id', { count:'exact', head:true }),
        supabase.from('client_galleries').select('id', { count:'exact', head:true }),
        supabase.from('services').select('id', { count:'exact', head:true }),
        supabase.from('inquiries').select('id', { count:'exact', head:true }),
      ]);
      setStats({ gallery: g.count||0, albums: a.count||0, services: s.count||0, inquiries: i.count||0 });
      const { data } = await supabase.from('inquiries').select('*').order('created_at', { ascending:false }).limit(5);
      setRecent(data || []);
    }
    load();
  }, []);

  const cards = [
    { label:'Gallery Photos',   value: stats.gallery,   icon: Image,       color:'#c9a96e', tab:'gallery'   },
    { label:'Client Albums',    value: stats.albums,    icon: BookOpen,    color:'#7eb8c9', tab:'albums'    },
    { label:'Services',         value: stats.services,  icon: Briefcase,   color:'#9ec97e', tab:'services'  },
    { label:'New Inquiries',    value: stats.inquiries, icon: Mail,        color:'#c97e9e', tab:'inquiries' },
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
        {/* Quick actions */}
        <div className="adm-panel">
          <h3 className="adm-panel__title">Quick Actions</h3>
          <div className="adm-quick-actions">
            {[
              { label:'Upload Gallery Photos', icon: Image,    tab:'gallery'   },
              { label:'Create Client Album',   icon: BookOpen, tab:'albums'    },
              { label:'Add Service Package',   icon: Briefcase,tab:'services'  },
              { label:'View Inquiries',        icon: Mail,     tab:'inquiries' },
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

        {/* Recent inquiries */}
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
                    <span>{new Date(r.created_at).toLocaleDateString('en-US',{day:'numeric',month:'short'})}</span>
                  </li>
                ))}
              </ul>
          }
        </div>

        {/* Setup checklist */}
        <div className="adm-panel adm-panel--full">
          <h3 className="adm-panel__title">Supabase Setup Checklist</h3>
          <ul className="adm-checklist">
            {[
              { done:true,  text:'Create Supabase project and add credentials to .env.local' },
              { done:false, text:'Run SQL schema from src/lib/supabase.js in your Supabase SQL Editor' },
              { done:false, text:'Create Storage bucket named "gallery" (Public)' },
              { done:false, text:'Create Storage bucket named "client-photos" (Private)' },
              { done:false, text:'Create Storage bucket named "service-covers" (Public)' },
              { done:false, text:'Set RLS policies: allow public SELECT on gallery, authenticated INSERT on all' },
              { done:false, text:'Upload your first gallery photos using the Gallery tab above' },
              { done:false, text:'Create your first client album using the Albums tab' },
            ].map((item, i) => (
              <li key={i} className={item.done ? 'done' : ''}>
                {item.done ? <CheckCircle2 size={15}/> : <div className="adm-checklist__circle">{i+1}</div>}
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
// GALLERY TAB
// ═════════════════════════════════════════════════════════════════════
function GalleryTab() {
  const [rows,      setRows]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState([]);
  const [cat,       setCat]       = useState('Wedding');
  const [featured,  setFeatured]  = useState(false);
  const [filter,    setFilter]    = useState('All');
  const [msg,       setMsg]       = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('gallery').select('*').order('created_at',{ascending:false});
    setRows(data||[]); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleFiles(files) {
    setUploading(true);
    setProgress(files.map(f => ({ name:f.name, status:'pending' })));
    for (let i=0; i<files.length; i++) {
      setProgress(p => p.map((x,j) => j===i ? {...x, status:'uploading'} : x));
      try {
        const url = await uploadFile(BUCKET_GALLERY, files[i]);
        const title = files[i].name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
        await supabase.from('gallery').insert([{ title, category:cat, image_url:url, featured }]);
        setProgress(p => p.map((x,j) => j===i ? {...x, status:'done'} : x));
      } catch(err) {
        setProgress(p => p.map((x,j) => j===i ? {...x, status:'error', err:err.message} : x));
      }
    }
    setUploading(false);
    setMsg(`✓ ${files.length} photo(s) uploaded successfully!`);
    setTimeout(() => { setMsg(''); setProgress([]); }, 4000);
    load();
  }

  async function toggleFeatured(item) {
    await supabase.from('gallery').update({ featured: !item.featured }).eq('id', item.id);
    load();
  }

  async function del(item) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    const path = item.image_url.split(`/${BUCKET_GALLERY}/`)[1];
    if (path) await supabase.storage.from(BUCKET_GALLERY).remove([path]);
    await supabase.from('gallery').delete().eq('id', item.id);
    load();
  }

  const filtered = filter==='All' ? rows : rows.filter(r=>r.category===filter);

  return (
    <div>
      <div className="adm-notice">
        <AlertCircle size={14}/>
        <span>Photos upload directly to your <strong>Supabase Storage</strong> bucket <code>gallery</code>. Create this bucket in Supabase → Storage before uploading.</span>
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title">Upload Photos to Gallery</h3>
        <div className="adm-upload-opts">
          <div className="adm-field">
            <label>Category</label>
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              {GALLERY_CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <label className="adm-check">
            <input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/>
            Feature on Home page
          </label>
        </div>
        <DropZone onFiles={handleFiles} uploading={uploading} />
        <UploadProgress items={progress} />
        {msg && <p className="adm-success">{msg}</p>}
      </div>

      {/* Filter */}
      <div className="adm-filter-bar">
        {['All',...GALLERY_CATS].map(c=>(
          <button key={c} className={`adm-filter ${filter===c?'active':''}`} onClick={()=>setFilter(c)}>
            {c}
            <span>{c==='All' ? rows.length : rows.filter(r=>r.category===c).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-loading"><Loader size={20} className="spin"/> Loading gallery…</div>
      ) : (
        <div className="adm-gallery-grid">
          {filtered.map(row => (
            <div key={row.id} className={`adm-gal-item ${row.featured?'adm-gal-item--star':''}`}>
              <img src={row.image_url} alt={row.title}/>
              <div className="adm-gal-item__info">
                <span className="adm-gal-item__cat">{row.category}</span>
                <span className="adm-gal-item__title">{row.title}</span>
                <div className="adm-gal-item__btns">
                  <button onClick={()=>toggleFeatured(row)} title={row.featured?'Unfeature':'Feature'} className={row.featured?'gold':''}>
                    {row.featured ? <Star size={13} fill="currentColor"/> : <StarOff size={13}/>}
                  </button>
                  <button onClick={()=>del(row)} className="red"><Trash2 size={13}/></button>
                </div>
              </div>
              {row.featured && <div className="adm-gal-item__badge">Featured</div>}
            </div>
          ))}
          {filtered.length===0 && <div className="adm-empty-grid">No photos yet — upload some above.</div>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// ALBUMS TAB
// ═════════════════════════════════════════════════════════════════════
function AlbumsTab() {
  const [rows,      setRows]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);
  const [photos,    setPhotos]    = useState({});
  const [uploading, setUploading] = useState(null);
  const [progress,  setProgress]  = useState([]);
  const [form,      setForm]      = useState({ client_name:'', event_name:'', event_date:'', access_code:'' });
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('client_galleries').select('*').order('created_at',{ascending:false});
    setRows(data||[]); setLoading(false);
  }
  useEffect(() => { load(); },[]);

  async function loadPhotos(gid) {
    const { data } = await supabase.from('client_photos').select('*').eq('gallery_id',gid).order('created_at');
    setPhotos(p=>({...p,[gid]:data||[]}));
  }

  function toggleExpand(id) {
    const next = expanded===id ? null : id;
    setExpanded(next);
    if (next && !photos[next]) loadPhotos(next);
  }

  async function createAlbum(e) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('client_galleries').insert([form]);
    if (!error) {
      setForm({ client_name:'', event_name:'', event_date:'', access_code:'' });
      setMsg('✓ Album created! Share the access code with your client.');
      load();
    } else setMsg('Error: ' + error.message);
    setSaving(false);
    setTimeout(()=>setMsg(''), 5000);
  }

  async function uploadPhotos(gid, files) {
    setUploading(gid);
    setProgress(files.map(f=>({ name:f.name, status:'pending' })));
    for (let i=0; i<files.length; i++) {
      setProgress(p=>p.map((x,j)=>j===i?{...x,status:'uploading'}:x));
      try {
        const url = await uploadFile(BUCKET_CLIENTS, files[i]);
        await supabase.from('client_photos').insert([{ gallery_id:gid, image_url:url, caption:'' }]);
        setProgress(p=>p.map((x,j)=>j===i?{...x,status:'done'}:x));
      } catch(err) {
        setProgress(p=>p.map((x,j)=>j===i?{...x,status:'error',err:err.message}:x));
      }
    }
    setUploading(null);
    setTimeout(()=>setProgress([]),3000);
    loadPhotos(gid);
  }

  async function delPhoto(pid, gid) {
    const photo = photos[gid]?.find(p=>p.id===pid);
    if (photo) {
      const path = photo.image_url.split(`/${BUCKET_CLIENTS}/`)[1];
      if (path) await supabase.storage.from(BUCKET_CLIENTS).remove([path]);
    }
    await supabase.from('client_photos').delete().eq('id',pid);
    loadPhotos(gid);
  }

  async function delAlbum(id) {
    if (!confirm('Delete this entire album and all its photos?')) return;
    await supabase.from('client_galleries').delete().eq('id',id);
    load();
  }

  function autoCode(name) {
    const slug = name.toLowerCase().replace(/\s+/g,'').slice(0,6);
    const rand = Math.floor(1000+Math.random()*9000);
    setForm(f=>({...f, access_code:`${slug}${rand}`}));
  }

  return (
    <div>
      <div className="adm-notice">
        <AlertCircle size={14}/>
        <span>Photos upload to Supabase Storage bucket <code>client-photos</code>. Clients access their album using the code at <strong>/album</strong>.</span>
      </div>

      {/* Create album */}
      <div className="adm-card">
        <h3 className="adm-card__title">Create New Client Album</h3>
        <form onSubmit={createAlbum}>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label>Client Name *</label>
              <input value={form.client_name} onChange={e=>setForm(f=>({...f,client_name:e.target.value}))} placeholder="e.g. Amara & James" required/>
            </div>
            <div className="adm-field">
              <label>Event Name</label>
              <input value={form.event_name} onChange={e=>setForm(f=>({...f,event_name:e.target.value}))} placeholder="e.g. Wedding Day"/>
            </div>
            <div className="adm-field">
              <label>Event Date</label>
              <input type="date" value={form.event_date} onChange={e=>setForm(f=>({...f,event_date:e.target.value}))}/>
            </div>
            <div className="adm-field">
              <label>Access Code *</label>
              <div className="adm-field__row">
                <input value={form.access_code} onChange={e=>setForm(f=>({...f,access_code:e.target.value}))} placeholder="e.g. amara8472" required/>
                <button type="button" className="adm-btn-outline adm-btn-sm" onClick={()=>autoCode(form.client_name)}>Auto</button>
              </div>
            </div>
          </div>
          <button type="submit" className="adm-btn-primary" disabled={saving}>
            <Plus size={14}/> {saving?'Creating…':'Create Album'}
          </button>
          {msg && <p className="adm-success" style={{marginTop:'0.75rem'}}>{msg}</p>}
        </form>
      </div>

      {/* Album list */}
      {loading ? <div className="adm-loading"><Loader size={18} className="spin"/> Loading…</div> : (
        <div className="adm-album-list">
          {rows.map(row => (
            <div key={row.id} className="adm-album-card">
              <div className="adm-album-card__header" onClick={()=>toggleExpand(row.id)}>
                <div className="adm-album-card__info">
                  <h3>{row.client_name}</h3>
                  <div className="adm-album-card__meta">
                    {row.event_name && <span className="adm-tag">{row.event_name}</span>}
                    {row.event_date && <span className="adm-muted-sm">{new Date(row.event_date).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'})}</span>}
                    <span className="adm-code-badge"><Lock size={11}/> {row.access_code}</span>
                    {photos[row.id] && <span className="adm-muted-sm">{photos[row.id].length} photos</span>}
                  </div>
                </div>
                <div className="adm-album-card__actions">
                  <button className="adm-icon-btn red" onClick={e=>{e.stopPropagation();delAlbum(row.id)}}><Trash2 size={14}/></button>
                  {expanded===row.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
              </div>

              {expanded===row.id && (
                <div className="adm-album-card__body">
                  <DropZone
                    onFiles={files=>uploadPhotos(row.id,files)}
                    uploading={uploading===row.id}
                    label={`Drop photos for ${row.client_name} here`}
                  />
                  {uploading===row.id && <UploadProgress items={progress}/>}
                  <div className="adm-client-photos-grid">
                    {(photos[row.id]||[]).map(p=>(
                      <div key={p.id} className="adm-client-photo">
                        <img src={p.image_url} alt=""/>
                        <button className="adm-client-photo__del" onClick={()=>delPhoto(p.id,row.id)}><X size={11}/></button>
                      </div>
                    ))}
                    {(photos[row.id]||[]).length===0 && !uploading && (
                      <p className="adm-muted" style={{gridColumn:'1/-1',padding:'1rem 0'}}>No photos yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {rows.length===0 && <div className="adm-empty">No albums yet. Create one above.</div>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// SERVICES TAB
// ═════════════════════════════════════════════════════════════════════
function ServicesTab() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open,    setOpen]    = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPrev, setImgPrev] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');
  const [form,    setForm]    = useState({ title:'', description:'', price_from:'', duration:'', image_url:'', features:'' });

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('created_at');
    setRows(data||[]); setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function save(e) {
    e.preventDefault(); setSaving(true);
    let image_url = form.image_url;
    if (imgFile) {
      try { image_url = await uploadFile(BUCKET_SERVICES, imgFile); }
      catch(err) { setMsg('Upload failed: ' + err.message); setSaving(false); return; }
    }
    const payload = { ...form, price_from: parseFloat(form.price_from)||null, image_url,
      features: form.features ? form.features.split('\n').map(s=>s.trim()).filter(Boolean) : [] };
    if (editing) await supabase.from('services').update(payload).eq('id',editing);
    else         await supabase.from('services').insert([payload]);
    setEditing(null); setOpen(false); setImgFile(null); setImgPrev('');
    setForm({ title:'',description:'',price_from:'',duration:'',image_url:'',features:'' });
    setMsg('✓ Service saved!'); load(); setSaving(false);
    setTimeout(()=>setMsg(''),3000);
  }

  function startEdit(row) {
    setEditing(row.id); setOpen(true); setImgFile(null); setImgPrev('');
    setForm({ title:row.title||'', description:row.description||'', price_from:row.price_from||'',
      duration:row.duration||'', image_url:row.image_url||'', features:(row.features||[]).join('\n') });
    window.scrollTo({top:0,behavior:'smooth'});
  }

  async function del(id) {
    if(!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id',id); load();
  }

  return (
    <div>
      <div className="adm-section-actions">
        {!open && (
          <button className="adm-btn-primary" onClick={()=>{ setOpen(true); setEditing(null); setImgFile(null); setImgPrev(''); setForm({title:'',description:'',price_from:'',duration:'',image_url:'',features:''}); }}>
            <Plus size={14}/> Add Service
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
                <select value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required>
                  <option value="">Select…</option>
                  {SERVICE_TITLES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="adm-field">
                <label>Starting Price</label>
                <input type="number" value={form.price_from} onChange={e=>setForm(f=>({...f,price_from:e.target.value}))} placeholder="e.g. 1200"/>
              </div>
              <div className="adm-field">
                <label>Duration</label>
                <input value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} placeholder="e.g. Full Day (8–12 hrs)"/>
              </div>
              <div className="adm-field adm-field--wide">
                <label>Description</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="Describe this package…"/>
              </div>
              <div className="adm-field adm-field--wide">
                <label>Inclusions <small>(one per line)</small></label>
                <textarea value={form.features} onChange={e=>setForm(f=>({...f,features:e.target.value}))} rows={5} placeholder={"Two photographers\nOnline gallery\n..."}/>
              </div>
              <div className="adm-field adm-field--wide">
                <label>Cover Photo</label>
                {(imgPrev||form.image_url) && (
                  <div className="adm-img-preview">
                    <img src={imgPrev||form.image_url} alt="cover"/>
                    <button type="button" onClick={()=>{setImgFile(null);setImgPrev('');setForm(f=>({...f,image_url:''}))}}><X size={13}/></button>
                  </div>
                )}
                <DropZone onFiles={files=>{setImgFile(files[0]);setImgPrev(URL.createObjectURL(files[0]));}} uploading={false} multiple={false} label="Upload service cover photo"/>
              </div>
            </div>
            <div className="adm-form-actions">
              <button type="submit" className="adm-btn-primary" disabled={saving}>
                <Save size={14}/> {saving?'Saving…':(editing?'Update Service':'Add Service')}
              </button>
              <button type="button" className="adm-btn-outline" onClick={()=>{setOpen(false);setEditing(null);}}>Cancel</button>
              {msg && <span className="adm-success">{msg}</span>}
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="adm-loading"><Loader size={18} className="spin"/> Loading…</div> : (
        <div className="adm-services-list">
          {rows.map(row=>(
            <div key={row.id} className="adm-service-card">
              {row.image_url && <img src={row.image_url} alt={row.title} className="adm-service-card__img"/>}
              <div className="adm-service-card__body">
                <div className="adm-service-card__top">
                  <div>
                    <h3>{row.title}</h3>
                    <span className="adm-tag">{row.duration}</span>
                  </div>
                  <div className="adm-service-card__price">
                    ${Number(row.price_from||0).toLocaleString()}
                    <small>from</small>
                  </div>
                </div>
                <p className="adm-service-card__desc">{row.description?.slice(0,110)}…</p>
                {row.features?.length>0 && (
                  <ul className="adm-service-card__feats">
                    {row.features.slice(0,4).map((f,i)=><li key={i}><Check size={11}/> {f}</li>)}
                    {row.features.length>4 && <li className="adm-muted">+{row.features.length-4} more</li>}
                  </ul>
                )}
                <div className="adm-service-card__actions">
                  <button className="adm-btn-outline adm-btn-sm" onClick={()=>startEdit(row)}><Edit3 size={12}/> Edit</button>
                  <button className="adm-icon-btn red" onClick={()=>del(row.id)}><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
          {rows.length===0 && <div className="adm-empty">No services. Click "Add Service" above.</div>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// INQUIRIES TAB
// ═════════════════════════════════════════════════════════════════════
function InquiriesTab() {
  const [rows,     setRows]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [expanded, setExpanded]= useState(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('inquiries').select('*').order('created_at',{ascending:false});
    setRows(data||[]); setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function del(id) {
    if(!confirm('Delete this inquiry?')) return;
    await supabase.from('inquiries').delete().eq('id',id); load();
  }

  return (
    <div>
      <p className="adm-muted" style={{marginBottom:'1.5rem'}}>{rows.length} total inquiries from your contact form.</p>
      {loading ? <div className="adm-loading"><Loader size={18} className="spin"/> Loading…</div> : (
        <div className="adm-inquiries">
          {rows.map(row=>(
            <div key={row.id} className="adm-inquiry">
              <div className="adm-inquiry__header" onClick={()=>setExpanded(expanded===row.id?null:row.id)}>
                <div className="adm-inquiry__left">
                  <strong>{row.name}</strong>
                  {row.event_type && <span className="adm-tag">{row.event_type}</span>}
                  <span className="adm-muted-sm">{new Date(row.created_at).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'})}</span>
                </div>
                <div className="adm-inquiry__right">
                  <a href={`mailto:${row.email}`} className="adm-btn-outline adm-btn-sm" onClick={e=>e.stopPropagation()}>Reply</a>
                  <button className="adm-icon-btn red" onClick={e=>{e.stopPropagation();del(row.id)}}><Trash2 size={13}/></button>
                  {expanded===row.id?<ChevronUp size={16}/>:<ChevronDown size={16}/>}
                </div>
              </div>
              {expanded===row.id && (
                <div className="adm-inquiry__body">
                  <div className="adm-inquiry__details">
                    <div><span><Mail size={11}/> Email</span><a href={`mailto:${row.email}`}>{row.email}</a></div>
                    {row.phone && <div><span><Phone size={11}/> Phone</span><a href={`tel:${row.phone}`}>{row.phone}</a></div>}
                    {row.event_type && <div><span><Briefcase size={11}/> Service</span><strong>{row.event_type}</strong></div>}
                    {row.event_date && <div><span><Calendar size={11}/> Date</span><strong>{new Date(row.event_date).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</strong></div>}
                  </div>
                  {row.message && (
                    <div className="adm-inquiry__msg">
                      <span><MessageSquare size={11}/> Message</span>
                      <p>{row.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {rows.length===0 && <div className="adm-empty">No inquiries yet.</div>}
        </div>
      )}
    </div>
  );
}

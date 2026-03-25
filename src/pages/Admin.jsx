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

const ADMIN_PASSWORD = 'Obizkkk254@';
const BUCKET_GALLERY  = 'gallery';
const BUCKET_CLIENTS  = 'client-photos';
const BUCKET_SERVICES = 'service-covers';
const GALLERY_CATS    = ['Wedding','Events','Portrait','Maternity','Videography','Commercial'];
const SERVICE_TITLES  = ['Wedding Photography','Events Coverage','Portrait Sessions','Maternity Photography','Videography','Commercial & Brand'];

// Updated function to accept both images and videos
function isMediaFile(file) {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
  const videoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'video/ogg'];
  if (imageTypes.includes(file.type) || videoTypes.includes(file.type)) return true;
  const ext = file.name.split('.').pop().toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif|avif|tiff|tif|jfif|mp4|mov|avi|mkv|webm|ogv)$/i.test(file.name);
}

async function uploadFile(bucket, file) {
  const ext  = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Could not get public URL — is the bucket set to Public?');
  return data.publicUrl;
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

// ── Drag-and-drop upload zone (updated for videos) ──────────────────────────
function DropZone({ onFiles, uploading, multiple = true, label = 'Drag & drop photos or videos here, or click to browse' }) {
  const ref = useRef();
  const [over, setOver] = useState(false);

  const drop = useCallback(e => {
    e.preventDefault();
    setOver(false);
    const files = Array.from(e.dataTransfer.files).filter(isMediaFile);
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
      <input
        ref={ref}
        type="file"
        accept="image/*,video/*,.heic,.heif,.avif,.tiff,.tif,.jfif,.mov,.mp4,.avi,.mkv,.webm,.ogv"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={e => {
          const f = Array.from(e.target.files).filter(isMediaFile);
          if (f.length) onFiles(f);
          e.target.value = '';
        }}
      />
      {uploading
        ? <><Loader size={26} className="spin" /><p>Uploading to Supabase Storage…</p></>
        : <><CloudUpload size={30} /><p>{label}</p><span>Images (JPG, PNG, WEBP, HEIC, TIFF) · Videos (MP4, MOV, AVI, MKV, WEBM)</span></>
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

// ── Pre-upload confirm panel (video icon for videos) ──────────────────────────
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
          const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|ogv)$/i.test(file.name);
          const preview = isVideo ? null : URL.createObjectURL(file);
          return (
            <div key={i} className="upload-confirm-item">
              {preview ? (
                <img src={preview} alt="" className="upload-confirm-item__thumb" />
              ) : (
                <div className="upload-confirm-item__thumb video-thumb">
                  <Video size={24} />
                </div>
              )}
              <div className="upload-confirm-item__info">
                <input
                  className="upload-confirm-item__name"
                  value={names[i]}
                  onChange={e => setNames(n => n.map((v, j) => j === i ? e.target.value : v))}
                  placeholder="File name…"
                />
                <span className="adm-tag">{cat}{featured ? ' · Featured' : ''} {isVideo && '· Video'}</span>
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
// ROOT (unchanged)
// ═════════════════════════════════════════════════════════════════════
export default function Admin() {
  // ... (same as before)
  // I'll keep it unchanged for brevity, but in the final file it's included.
  // Since the file is long, I'll provide the full version in the final answer.
}

// ... DashboardTab unchanged

// ═════════════════════════════════════════════════════════════════════
// GALLERY TAB (updated to display videos)
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
  const [pendingFiles, setPendingFiles] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingId,   setEditingId]   = useState(null);
  const [editingName, setEditingName] = useState('');

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
        const { error: insertError } = await supabase.from('gallery').insert([{ title, category: cat, image_url: url, featured }]);
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

  const isVideoUrl = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogv'].includes(ext);
  };

  return (
    <div>
      <div className="adm-notice">
        <AlertCircle size={14} />
        <span>
          Photos and videos upload to your <strong>Supabase Storage</strong> bucket <code>gallery</code>.
          Make sure the bucket is set to <strong>Public</strong> — otherwise media will appear black.
        </span>
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title">Upload Media to Gallery</h3>
        <div className="adm-upload-opts">
          <div className="adm-field">
            <label>Category</label>
            <select value={cat} onChange={e => setCat(e.target.value)}>
              {GALLERY_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
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
          <DropZone onFiles={handleFiles} uploading={uploading} />
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
            const isVideo = isVideoUrl(row.image_url);
            return (
              <div key={row.id} className={`adm-gal-item ${row.featured ? 'adm-gal-item--star' : ''}`}>
                {isVideo ? (
                  <video controls preload="metadata" style={{ width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'cover' }}>
                    <source src={row.image_url} type={`video/${row.image_url.split('.').pop()}`} />
                  </video>
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
          {filtered.length === 0 && <div className="adm-empty-grid">No media yet — upload some above.</div>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// ALBUMS TAB (updated to display videos)
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

  const isVideoUrl = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogv'].includes(ext);
  };

  return (
    <div>
      <div className="adm-notice">
        <AlertCircle size={14} />
        <span>Photos and videos upload to Supabase Storage bucket <code>client-photos</code>. Clients access their album using the code at <strong>/album</strong>.</span>
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
                    {photos[row.id] && <span className="adm-muted-sm">{photos[row.id].length} items</span>}
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
                      label={`Drop media for ${row.client_name} here`}
                    />
                  )}
                  {uploading === row.id && <UploadProgress items={progress} />}
                  <div className="adm-client-photos-grid">
                    {(photos[row.id] || []).map(p => {
                      const isVideo = isVideoUrl(p.image_url);
                      return (
                        <div key={p.id} className="adm-client-photo">
                          {isVideo ? (
                            <video controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                              <source src={p.image_url} type={`video/${p.image_url.split('.').pop()}`} />
                            </video>
                          ) : (
                            <img src={p.image_url} alt="" onError={e => { e.target.style.opacity = '0.2'; }} />
                          )}
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
                      );
                    })}
                    {(photos[row.id] || []).length === 0 && !uploading && (
                      <p className="adm-muted" style={{ gridColumn: '1/-1', padding: '1rem 0' }}>No media yet.</p>
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

// SERVICES TAB (unchanged, but note: cover photos could be videos; we leave as <img> for simplicity)
function ServicesTab() {
  // ... same as original (but with KSH changes already applied)
  // (not repeated for brevity, but in final file it's included)
}

// INQUIRIES TAB (unchanged)
function InquiriesTab() {
  // ... same as original
}

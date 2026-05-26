import { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Image as ImageIcon, Video,
  ChevronDown, Loader2, Zap, Save, Tag, FileText,
  User, Calendar, RefreshCw, Eye, EyeOff, X, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { compressImage } from '../../lib/compressImage';

/* ─── Types ──────────────────────────────────────── */
interface SavedProject {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  video_url: string | null;
  published: boolean;
  created_at: string;
  description?: string;
  client?: string;
  role?: string;
  tools?: string;
}

/* ─── Constants ──────────────────────────────────── */
const PHOTO_CATS = ['Design Printing', 'Social Media', 'Photography', 'Personal Project'];
const VIDEO_CATS = ['Video/Motion Graphic'];
const inputCls = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder-gray-700";

/* ─── Tab Button ─────────────────────────────────── */
function TabBtn({ active, onClick, icon, label, count }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-colors ${active ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
    >
      {active && (
        <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/30"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
      )}
      <span className="relative z-10 flex items-center gap-2.5">
        {icon}
        {label}
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${active ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-500'}`}>{count}</span>
      </span>
    </button>
  );
}

/* ─── Custom Dropdown ────────────────────────────── */
function CategorySelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition-all ${open ? 'bg-white/[0.07] border-primary/40' : 'bg-black/50 border-white/10 hover:border-white/20'}`}>
        <span className={value ? 'text-white' : 'text-gray-600'}>{value || 'Select category...'}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} className="text-gray-500" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(10,10,10,0.97)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            {options.map(opt => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all ${value === opt ? 'text-primary bg-primary/10' : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'}`}>
                <span className="font-medium">{opt}</span>
                {value === opt && (
                  <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#39FF14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Saved Project Card ─────────────────────────── */
function SavedCard({ project, onDelete, onToggle, onEdit }: {
  project: SavedProject;
  onDelete: (id: string) => void;
  onToggle: (id: string, published: boolean) => void;
  onEdit: (project: SavedProject) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden group hover:border-white/15 transition-colors">
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-black/40 relative overflow-hidden">
        {project.image_url
          ? <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-700"><ImageIcon size={28} /></div>}
        {/* Overlay actions on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => onEdit(project)}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:border-blue-500/50 hover:text-blue-400 transition-all"
            title="Edit Project"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onToggle(project.id, project.published)}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:border-primary/50 hover:text-primary transition-all"
            title={project.published ? 'Unpublish' : 'Publish'}
          >
            {project.published ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={async () => { setDeleting(true); await onDelete(project.id); setDeleting(false); }}
            disabled={deleting}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider ${project.published ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/10 text-gray-500 border border-white/10'}`}>
            {project.published ? 'LIVE' : 'DRAFT'}
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-white text-sm font-bold truncate">{project.title}</p>
        <p className="text-gray-600 text-[11px] mt-0.5">{project.category}</p>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────── */
export default function ProjectsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'photo' | 'video'>('photo');

  /* Saved projects */
  const [saved, setSaved] = useState<SavedProject[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const fetchSaved = async () => {
    setLoadingSaved(true);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setSaved(data);
    setLoadingSaved(false);
  };

  useEffect(() => { fetchSaved(); }, []);

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { toast('error', 'Error', error.message); return; }
    setSaved(prev => prev.filter(p => p.id !== id));
    toast('warning', 'Deleted', 'Project removed.');
  };

  const togglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from('projects').update({ published: !current }).eq('id', id);
    if (error) { toast('error', 'Error', error.message); return; }
    setSaved(prev => prev.map(p => p.id === id ? { ...p, published: !current } : p));
    toast('success', current ? 'Unpublished' : 'Published', current ? 'Project set to draft.' : 'Project is now live!');
  };

  /* Project form */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [role, setRole] = useState('');
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeMB, setSizeMB] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleImage = (files: FileList | null) => {
    if (!files?.[0]) return;
    const f = files[0];
    setImage(f);
    setPreview(URL.createObjectURL(f));
    setSizeMB(f.size / (1024 * 1024));
  };

  const handleVideo = (files: FileList | null) => {
    if (!files?.[0]) return;
    setVideoFile(files[0]);
  };

  const resetForm = () => { setEditingId(null); setTitle(''); setCategory(''); setDescription(''); setClient(''); setRole(''); setTools([]); setToolInput(''); setImage(null); setPreview(null); setSizeMB(0); setVideoFile(null); };

  const handleEdit = (p: SavedProject) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description || '');
    setClient(p.client || '');
    setRole(p.role || '');
    setTools(p.tools ? p.tools.split(',').map(t => t.trim()) : []);
    setPreview(p.image_url);
    setImage(null);
    setVideoFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveProject = async () => {
    if (!title.trim()) return toast('error', 'Error', 'Project title is required.');
    if (!category) return toast('error', 'Error', 'Please select a category.');
    if (!editingId && !image) return toast('error', 'Error', 'Please upload a cover image.');
    if (tab === 'video' && !editingId && !videoFile) return toast('error', 'Error', 'Please upload a video file.');

    setUploading(true);
    try {
      let imgUrl = preview; // if editing, keep old preview url if image is null
      let imgW = 1920;
      let imgH = 1080;

      if (image) {
        setUploadStatus('Compressing cover...');
        const { file: compressed, width, height } = await compressImage(image, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 });
        imgW = width;
        imgH = height;
        setUploadStatus('Uploading cover...');
        imgUrl = await uploadToCloudinary(compressed, 'portfolio/photos');
      }

      let vidUrl = editingId ? saved.find(s => s.id === editingId)?.video_url || null : null;
      if (tab === 'video' && videoFile) {
        setUploadStatus('Uploading video...');
        vidUrl = await uploadToCloudinary(videoFile, 'portfolio/videos');
      }

      setUploadStatus('Saving...');
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        client: client.trim(),
        role: role.trim(),
        tools: tools.join(', '),
        image_url: imgUrl,
        image_width: imgW,
        image_height: imgH,
        video_url: vidUrl,
        published: true,
      };

      if (editingId) {
        const { data, error } = await supabase.from('projects').update(payload).eq('id', editingId).select().single();
        if (error) throw error;
        setSaved(prev => prev.map(p => p.id === editingId ? data : p));
        toast('success', 'Updated!', `"${title}" updated successfully ✓`);
      } else {
        const { data, error } = await supabase.from('projects').insert(payload).select().single();
        if (error) throw error;
        if (data) setSaved(prev => [data, ...prev]);
        toast('success', 'Saved!', `"${title}" saved successfully ✓`);
      }

      resetForm();
      setShowForm(false);
    } catch (e: any) {
      toast('error', 'Upload failed', e.message);
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  const photoSaved = saved.filter(p => !p.video_url);
  const videoSaved = saved.filter(p => !!p.video_url);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Projects</h1>
          <p className="text-gray-400 mt-1 text-sm">Kelola portfolio — foto dan video terpisah.</p>
        </div>
        <button onClick={fetchSaved} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-all w-full sm:w-auto self-start sm:self-auto">
          <RefreshCw size={13} className={loadingSaved ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs & CTA Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 bg-white/[0.03] border border-white/[0.06] p-1.5 rounded-2xl self-start sm:self-auto w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
            <TabBtn active={tab === 'photo'} onClick={() => { setTab('photo'); setShowForm(false); resetForm(); }} icon={<ImageIcon size={15} />} label="Photo" count={photoSaved.length} />
            <TabBtn active={tab === 'video'} onClick={() => { setTab('video'); setShowForm(false); resetForm(); }} icon={<Video size={15} />} label="Video" count={videoSaved.length} />
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-black text-sm font-bold rounded-xl hover:bg-[#32e612] active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus size={15} /> {showForm ? 'Close Form' : `Add ${tab === 'photo' ? 'Photo' : 'Video'}`}
        </button>
      </div>

      {/* ADD FORM (SHARED FOR BOTH TABS) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white/[0.04] border border-primary/20 rounded-3xl p-7 space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-primary uppercase tracking-widest">{editingId ? 'Edit' : 'New'} {tab === 'photo' ? 'Photo' : 'Video'} Project</p>
                {editingId && (
                  <button onClick={resetForm} className="text-[10px] text-gray-400 hover:text-white uppercase tracking-wider font-bold">Cancel Edit</button>
                )}
              </div>

                    {/* Title + Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Project Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mesas Traditional" className={inputCls} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Category</label>
                        <CategorySelect value={category} onChange={setCategory} options={tab === 'photo' ? PHOTO_CATS : VIDEO_CATS} />
                      </div>
                    </div>

                    {/* Details: Client, Role, Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Client</label>
                        <input value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Internal Concept" className={inputCls} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Role</label>
                        <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Art Director" className={inputCls} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tools</label>
                        <div className="flex flex-wrap gap-2 p-2 min-h-[46px] bg-black/50 border border-white/10 rounded-xl focus-within:border-primary/50 transition-colors">
                          {tools.map(t => (
                            <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/10 text-white text-xs rounded-lg">
                              {t}
                              <button type="button" onClick={() => setTools(tools.filter(tool => tool !== t))} className="text-gray-400 hover:text-white transition-colors"><X size={12} /></button>
                            </span>
                          ))}
                          <input
                            value={toolInput}
                            onChange={e => setToolInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                const val = toolInput.trim().replace(',', '');
                                if (val && !tools.includes(val)) setTools([...tools, val]);
                                setToolInput('');
                              }
                            }}
                            placeholder={tools.length === 0 ? "e.g. Figma (Tekan Enter)" : ""}
                            className="flex-1 min-w-[120px] bg-transparent text-white text-sm focus:outline-none placeholder-gray-700 px-2 py-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Overview / Description */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Overview / Description</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ceritakan detail proyek ini..." className={`${inputCls} min-h-[100px] resize-y`} />
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Cover Image</label>
                      <label htmlFor="cover-img" className="block cursor-pointer">
                        {preview ? (
                          <div className="relative h-52 rounded-2xl overflow-hidden border border-white/10 group/img">
                            <img src={preview} className="w-full h-full object-cover" alt="preview" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <ImageIcon size={16} className="text-white" />
                              <p className="text-white text-sm font-bold">Change Image</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-52 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-primary/40 hover:bg-white/[0.02] transition-all">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                              <ImageIcon size={20} className="text-gray-600" />
                            </div>
                            <p className="text-white font-bold text-sm mb-1">Upload Cover Image</p>
                            <p className="text-xs text-gray-600">JPG, PNG, WEBP · Max 1 file</p>
                          </div>
                        )}
                        <input id="cover-img" type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files)} />
                      </label>
                    </div>

                    {/* Video File (hanya muncul jika tab video) */}
                    {tab === 'video' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Video File</label>
                        <label htmlFor="video-file" className="block cursor-pointer">
                          <div className={`h-24 border-2 border-dashed ${videoFile ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/40'} rounded-2xl flex items-center justify-center transition-all px-6`}>
                            {videoFile ? (
                              <div className="flex items-center gap-3 text-primary w-full">
                                <Video size={24} className="shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm truncate">{videoFile.name}</p>
                                  <p className="text-xs opacity-70">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                </div>
                                <div className="text-xs font-bold px-3 py-1 bg-primary/20 rounded-lg">CHANGE</div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                  <Video size={18} className="text-gray-600" />
                                </div>
                                <div className="text-left">
                                  <p className="text-white font-bold text-sm">Upload Video File</p>
                                  <p className="text-xs text-gray-600">MP4, WEBM · Max 100MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <input id="video-file" type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => handleVideo(e.target.files)} />
                        </label>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {image && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Zap size={12} className="text-primary" />
                          <span>{sizeMB.toFixed(1)} MB (Cover) → akan dikompres</span>
                        </div>
                      )}
                      <button
                        onClick={saveProject}
                        disabled={uploading}
                        className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-primary text-black text-sm font-bold rounded-xl hover:bg-[#32e612] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {uploading ? <><Loader2 size={15} className="animate-spin" /> {uploadStatus || 'Processing...'}</> : <><Save size={15} /> {editingId ? 'Update Project' : 'Save Project'}</>}
                      </button>
                    </div>
                  </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TAB CONTENT ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === 'photo' && (
          <motion.div key="photo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-6">
            {/* SAVED PROJECTS GRID */}
            {loadingSaved ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-white/[0.04] border border-white/[0.06]">
                    <div className="aspect-[4/3] bg-white/[0.06]" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                      <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : photoSaved.length === 0 && !showForm ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/[0.07] rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                  <ImageIcon size={28} className="text-gray-700" />
                </div>
                <p className="text-white font-bold text-base mb-1">No photo projects yet</p>
                <p className="text-gray-600 text-sm mb-6 max-w-[260px]">Klik "Add Photo" di atas untuk upload project pertama.</p>
                <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black text-sm font-bold rounded-xl hover:bg-[#32e612] transition-all">
                  <Plus size={15} /> Add Photo Project
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photoSaved.map(p => (
                    <SavedCard key={p.id} project={p} onDelete={deleteProject} onToggle={togglePublish} onEdit={handleEdit} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {/* ── VIDEO TAB ─── */}
        {tab === 'video' && (
          <motion.div key="video" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-6">
            
            {/* SAVED VIDEO GRID */}
            {loadingSaved ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-white/[0.04] border border-white/[0.06]">
                    <div className="aspect-[16/9] bg-white/[0.06]" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                      <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : videoSaved.length === 0 && !showForm ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/[0.07] rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                  <Video size={28} className="text-gray-700" />
                </div>
                <p className="text-white font-bold text-base mb-1">No video projects yet</p>
                <p className="text-gray-600 text-sm mb-6 max-w-[260px]">Klik "Add Video" di atas untuk upload project pertama.</p>
                <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black text-sm font-bold rounded-xl hover:bg-[#32e612] transition-all">
                  <Plus size={15} /> Add Video Project
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {videoSaved.map(p => (
                    <SavedCard key={p.id} project={p} onDelete={deleteProject} onToggle={togglePublish} onEdit={handleEdit} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { compressImage } from '../../lib/compressImage';

interface SiteSettings {
  id: string;
  display_name: string;
  job_title: string;
  hero_description: string;
  profile_image_url?: string;
}

const inputCls = 'w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-primary/50 transition-colors';

export default function SettingsPage() {
  const { toast } = useToast();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName,     setDisplayName]     = useState('');
  const [jobTitle,        setJobTitle]         = useState('');
  const [heroDescription, setHeroDescription]  = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  /* ════════════════════════════════════
     FETCH
  ════════════════════════════════════ */
  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, display_name, job_title, hero_description, profile_image_url')
      .limit(1)
      .single();

    if (data) {
      setSettings(data);
      setDisplayName(data.display_name      ?? '');
      setJobTitle(data.job_title            ?? '');
      setHeroDescription(data.hero_description ?? '');
      setProfileImageUrl(data.profile_image_url ?? '');
      setProfileImage(null);
    }
    if (error && error.code !== 'PGRST116') {
      toast('error', 'Load failed', error.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  /* ════════════════════════════════════
     SAVE
  ════════════════════════════════════ */
  const saveSettings = async () => {
    if (!displayName.trim()) return toast('error', 'Error', 'Display name is required.');
    if (!jobTitle.trim())    return toast('error', 'Error', 'Job title is required.');

    setSaving(true);
    try {
      let finalImgUrl = profileImageUrl;
      if (profileImage) {
        toast('success', 'Compressing...', 'Sedang mengkompres gambar profil...');
        const { file: compressed } = await compressImage(profileImage, { maxWidth: 1000, maxHeight: 1000, quality: 0.8 });
        toast('success', 'Uploading...', 'Sedang mengunggah gambar profil...');
        finalImgUrl = await uploadToCloudinary(compressed, 'portfolio/photos');
        setProfileImageUrl(finalImgUrl);
      }

      const payload = {
        display_name:     displayName.trim(),
        job_title:        jobTitle.trim(),
        hero_description: heroDescription.trim(),
        profile_image_url: finalImgUrl,
        updated_at:       new Date().toISOString(),
      };

      if (settings?.id) {
        const { error } = await supabase.from('site_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('site_settings').insert(payload).select().single();
        if (error) throw error;
        if (data) setSettings(data);
      }

      toast('success', 'Settings saved!', 'Hero section has been updated on your homepage.');
    } catch (e: any) {
      toast('error', 'Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-gray-400 mt-2">Edit nama, job title, dan deskripsi yang tampil di hero section homepage.</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Hero Settings ───────────────────────── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">🏠</span>
          Hero / Header Section
        </h2>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-14 bg-white/5 rounded-xl" />
              <div className="h-14 bg-white/5 rounded-xl" />
            </div>
            <div className="h-28 bg-white/5 rounded-xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Aditya Tri Nuryanto"
                  className={inputCls + ' text-lg font-bold'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title / Role</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Graphic Designer"
                  className={inputCls + ' text-lg font-bold'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hero Description</label>
              <textarea
                rows={4}
                value={heroDescription}
                onChange={e => setHeroDescription(e.target.value)}
                placeholder="Tagline singkat yang muncul di homepage..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
              />
              <p className="text-xs text-gray-600">Teks ini muncul di bawah nama Anda di homepage.</p>
            </div>
          </>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={saveSettings}
            disabled={saving || loading}
            className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-[#32e612] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ── Profile Section Settings ────────────── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">👤</span>
          Profile Section
        </h2>

        {loading ? (
          <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Profile Image</label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative w-40 h-32 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                {(profileImage || profileImageUrl) ? (
                  <>
                    <img 
                      src={profileImage ? URL.createObjectURL(profileImage) : profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => { setProfileImage(null); setProfileImageUrl(''); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <ImageIcon size={32} className="text-gray-600" />
                )}
              </div>
              <div className="flex-1 w-full space-y-3">
                <p className="text-sm text-gray-400">Upload gambar untuk bagian Profile. Gunakan gambar dengan aspect ratio 4:3 (landscape) untuk hasil terbaik.</p>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setProfileImage(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="px-6 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors text-center cursor-pointer">
                    Click to browse or drag image here
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={saveSettings}
            disabled={saving || loading}
            className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-[#32e612] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Image'}
          </button>
        </div>
      </div>

      {/* ── Live Preview ────────────────────────── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-white/10 text-gray-400 flex items-center justify-center">👁</span>
          Preview Hero
          <span className="text-xs text-gray-600 font-normal normal-case tracking-normal ml-1">— live sesuai input di atas</span>
        </h2>
        <div className="bg-black/50 border border-white/5 rounded-2xl p-8">
          <p className="text-sm text-primary font-bold tracking-widest uppercase mb-3">Portfolio</p>
          <h1 className="text-4xl font-black text-white mb-2 break-words">{displayName || 'Display Name'}</h1>
          <p className="text-xl text-primary font-semibold mb-4">{jobTitle || 'Job Title'}</p>
          <p className="text-gray-400 leading-relaxed max-w-md">{heroDescription || 'Hero description...'}</p>
        </div>
      </div>

    </div>
  );
}

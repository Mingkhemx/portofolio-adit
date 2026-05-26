import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Loader2, RefreshCw, Upload, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';

/* ─── Types ──────────────────────────────────────── */
interface Education {
  id: string;
  school: string;
  major: string;
  year: string;
  sort_order: number;
}

interface Skill {
  id: string;
  name: string;
  percent: number;
  icon_url: string | null;
  sort_order: number;
}

/* ─── Reusable input style ───────────────────────── */
const inputCls =
  'w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors font-semibold';

/* ─── Skill Icon Upload Button ───────────────────── */
function SkillIconUpload({
  skillId,
  iconUrl,
  uploading,
  onUpload,
  onRemove,
}: {
  skillId: string;
  iconUrl: string | null;
  uploading: boolean;
  onUpload: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="relative shrink-0 group/icon">
      <label
        htmlFor={`skill-icon-${skillId}`}
        className={`w-14 h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all border overflow-hidden
          ${iconUrl
            ? 'border-primary/30 hover:border-primary/60'
            : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5'
          }`}
        title="Upload ikon skill"
      >
        {uploading ? (
          <Loader2 size={18} className="text-primary animate-spin" />
        ) : iconUrl ? (
          <img src={iconUrl} alt="icon" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary transition-colors">
            <Upload size={16} />
            <span className="text-[8px] uppercase font-bold">Icon</span>
          </div>
        )}
        <input
          id={`skill-icon-${skillId}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            if (e.target.files?.[0]) onUpload(skillId, e.target.files[0]);
            e.target.value = '';
          }}
        />
      </label>

      {/* Remove button saat ada icon */}
      {iconUrl && !uploading && (
        <button
          onClick={() => onRemove(skillId)}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity shadow-lg"
          title="Hapus ikon"
        >
          <X size={9} />
        </button>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────── */
export default function ProfilePage() {
  const { toast } = useToast();

  /* ── Description state ── */
  const [description, setDescription] = useState('');
  const [descLoading, setDescLoading] = useState(true);
  const [descSaving, setDescSaving] = useState(false);
  const [descId, setDescId] = useState<string | null>(null);

  /* ── Education state ── */
  const [education, setEducation] = useState<Education[]>([]);
  const [eduLoading, setEduLoading] = useState(true);
  const [eduSaving, setEduSaving] = useState(false);

  /* ── Skills state ── */
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsSaving, setSkillsSaving] = useState(false);
  // Track which skill IDs are uploading their icon
  const [iconUploading, setIconUploading] = useState<Record<string, boolean>>({});

  /* ════════════════════════════════════════
     FETCH ALL DATA
  ════════════════════════════════════════ */
  const fetchAll = async () => {
    setDescLoading(true);
    setEduLoading(true);
    setSkillsLoading(true);

    const [descRes, eduRes, skillsRes] = await Promise.all([
      supabase.from('profile_description').select('*').limit(1).single(),
      supabase.from('education').select('*').order('sort_order', { ascending: true }),
      supabase.from('skills').select('*').order('sort_order', { ascending: true }),
    ]);

    if (descRes.data) { setDescription(descRes.data.content); setDescId(descRes.data.id); }
    if (eduRes.data) setEducation(eduRes.data);
    if (skillsRes.data) setSkills(skillsRes.data);

    setDescLoading(false);
    setEduLoading(false);
    setSkillsLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  /* ════════════════════════════════════════
     DESCRIPTION — SAVE
  ════════════════════════════════════════ */
  const saveDescription = async () => {
    setDescSaving(true);
    try {
      if (descId) {
        const { error } = await supabase
          .from('profile_description')
          .update({ content: description, updated_at: new Date().toISOString() })
          .eq('id', descId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('profile_description')
          .insert({ content: description })
          .select().single();
        if (error) throw error;
        if (data) setDescId(data.id);
      }
      toast('success', 'Description saved!', 'Your profile description has been updated.');
    } catch (e: any) {
      toast('error', 'Error', e.message);
    } finally {
      setDescSaving(false);
    }
  };

  /* ════════════════════════════════════════
     EDUCATION
  ════════════════════════════════════════ */
  const addEducation = () => {
    setEducation(prev => [...prev, { id: `temp-${Date.now()}`, school: '', major: '', year: '', sort_order: prev.length }]);
  };

  const updateEducation = (id: string, field: keyof Omit<Education, 'id' | 'sort_order'>, value: string) => {
    setEducation(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteEducation = async (id: string) => {
    if (id.startsWith('temp-')) { setEducation(prev => prev.filter(e => e.id !== id)); return; }
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (error) { toast('error', 'Error', error.message); return; }
    setEducation(prev => prev.filter(e => e.id !== id));
    toast('warning', 'Deleted', 'Education entry removed.');
  };

  const saveEducation = async () => {
    setEduSaving(true);
    try {
      for (const edu of education) {
        const payload = { school: edu.school, major: edu.major, year: edu.year, sort_order: edu.sort_order };
        if (edu.id.startsWith('temp-')) {
          const { error } = await supabase.from('education').insert(payload);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('education').update(payload).eq('id', edu.id);
          if (error) throw error;
        }
      }
      toast('success', 'Education saved!', 'Your education history has been updated.');
      const { data } = await supabase.from('education').select('*').order('sort_order', { ascending: true });
      if (data) setEducation(data);
    } catch (e: any) {
      toast('error', 'Error', e.message);
    } finally {
      setEduSaving(false);
    }
  };

  /* ════════════════════════════════════════
     SKILLS
  ════════════════════════════════════════ */
  const addSkill = () => {
    setSkills(prev => [...prev, { id: `temp-${Date.now()}`, name: 'New Skill', percent: 50, icon_url: null, sort_order: prev.length }]);
  };

  const updateSkill = (id: string, field: 'name' | 'percent', value: string | number) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSkill = async (id: string) => {
    if (id.startsWith('temp-')) { setSkills(prev => prev.filter(s => s.id !== id)); return; }
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) { toast('error', 'Error', error.message); return; }
    setSkills(prev => prev.filter(s => s.id !== id));
    toast('warning', 'Deleted', 'Skill removed.');
  };

  /* ── Upload icon for a skill ── */
  const handleIconUpload = async (skillId: string, file: File) => {
    setIconUploading(prev => ({ ...prev, [skillId]: true }));
    try {
      const url = await uploadToCloudinary(file, 'portfolio/skill-icons');

      // Update di DB jika bukan temp
      if (!skillId.startsWith('temp-')) {
        const { error } = await supabase.from('skills').update({ icon_url: url }).eq('id', skillId);
        if (error) throw error;
      }

      // Update local state
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, icon_url: url } : s));
      toast('success', 'Icon uploaded!', 'Skill icon has been updated.');
    } catch (e: any) {
      toast('error', 'Upload failed', e.message);
    } finally {
      setIconUploading(prev => ({ ...prev, [skillId]: false }));
    }
  };

  /* ── Remove icon for a skill ── */
  const handleIconRemove = async (skillId: string) => {
    if (!skillId.startsWith('temp-')) {
      const { error } = await supabase.from('skills').update({ icon_url: null }).eq('id', skillId);
      if (error) { toast('error', 'Error', error.message); return; }
    }
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, icon_url: null } : s));
    toast('warning', 'Icon removed', 'Skill icon has been cleared.');
  };

  const saveSkills = async () => {
    setSkillsSaving(true);
    try {
      for (const skill of skills) {
        const payload = { name: skill.name, percent: skill.percent, icon_url: skill.icon_url, sort_order: skill.sort_order };
        if (skill.id.startsWith('temp-')) {
          const { error } = await supabase.from('skills').insert(payload);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('skills').update(payload).eq('id', skill.id);
          if (error) throw error;
        }
      }
      toast('success', 'Tech stack saved!', 'Your skill percentages have been updated.');
      const { data } = await supabase.from('skills').select('*').order('sort_order', { ascending: true });
      if (data) setSkills(data);
    } catch (e: any) {
      toast('error', 'Error', e.message);
    } finally {
      setSkillsSaving(false);
    }
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Profile</h1>
          <p className="text-gray-400 mt-2">Edit your personal description, education history, and skill percentages.</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-all"
        >
          <RefreshCw size={13} className={(descLoading || eduLoading || skillsLoading) ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Profile Description ─────────────────── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">📝</span>
          About / Description
        </h2>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400">Profile Description</label>
          {descLoading
            ? <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
            : (
              <textarea
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
              />
            )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveDescription}
            disabled={descSaving || descLoading}
            className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-[#32e612] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {descSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {descSaving ? 'Saving...' : 'Save Description'}
          </button>
        </div>
      </div>

      {/* ── Education ──────────────────────────── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">🎓</span>
            Education
          </h2>
          <button
            onClick={addEducation}
            className="text-primary text-sm font-bold bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Education
          </button>
        </div>

        <div className="space-y-4">
          {eduLoading
            ? <div className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            : education.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/[0.07] rounded-2xl">
                  <p className="text-gray-600 text-sm">Belum ada data pendidikan. Klik "Add Education".</p>
                </div>
              )
              : education.map(edu => (
                <div key={edu.id} className="bg-black/30 border border-white/5 rounded-2xl p-6 relative group hover:border-white/20 transition-colors">
                  <button
                    onClick={() => deleteEducation(edu.id)}
                    className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white/5 p-2 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pr-10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">School / University</label>
                      <input type="text" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Major / Degree</label>
                      <input type="text" value={edu.major} onChange={e => updateEducation(edu.id, 'major', e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Year</label>
                      <input type="text" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>
              ))
          }
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveEducation}
            disabled={eduSaving || eduLoading}
            className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-[#32e612] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {eduSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {eduSaving ? 'Saving...' : 'Save Education'}
          </button>
        </div>
      </div>

      {/* ── Tech Stack & Skills ─────────────────── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">⚡</span>
            Tech Stack &amp; Skills
          </h2>
          <button
            onClick={addSkill}
            className="text-primary text-sm font-bold bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Skill
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-600">
          💡 Klik kotak ikon untuk upload gambar logo software/skill (PNG transparan direkomendasikan).
        </p>

        {skillsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/[0.07] rounded-2xl">
            <p className="text-gray-600 text-sm">Belum ada skill. Klik "Add Skill".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map(skill => (
              <div
                key={skill.id}
                className="bg-black/30 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/20 transition-colors group"
              >
                {/* Icon Upload */}
                <SkillIconUpload
                  skillId={skill.id}
                  iconUrl={skill.icon_url}
                  uploading={!!iconUploading[skill.id]}
                  onUpload={handleIconUpload}
                  onRemove={handleIconRemove}
                />

                {/* Skill Name + Slider */}
                <div className="flex-1 space-y-3 min-w-0">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={e => updateSkill(skill.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 pb-1 text-white font-bold text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.percent}
                      onChange={e => updateSkill(skill.id, 'percent', Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <span className="text-primary font-black text-sm w-10 text-right">{skill.percent}%</span>
                  </div>
                  {/* Visual bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${skill.percent}%` }}
                    />
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteSkill(skill.id)}
                  className="text-gray-600 hover:text-red-500 transition-colors p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={saveSkills}
            disabled={skillsSaving || skillsLoading}
            className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-[#32e612] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {skillsSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {skillsSaving ? 'Saving...' : 'Save Tech Stack'}
          </button>
        </div>
      </div>
    </div>
  );
}

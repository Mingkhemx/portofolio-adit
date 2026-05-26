import { useState, useEffect } from 'react';
import { Check, Loader2, Save, ImageIcon, RefreshCw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  highlighted: boolean;
}

export default function HighlightPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, category, image_url, highlighted')
      .order('created_at', { ascending: false });

    if (data) {
      setProjects(data);
      setSelected(new Set(data.filter(p => p.highlighted).map(p => p.id)));
    }
    if (error) toast('error', 'Error', error.message);
    setLoading(false);
    setDirty(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      // Set all to false first, then true for selected
      const updates = projects.map(p => ({
        id: p.id,
        highlighted: selected.has(p.id),
      }));

      for (const u of updates) {
        const { error } = await supabase
          .from('projects')
          .update({ highlighted: u.highlighted })
          .eq('id', u.id);
        if (error) throw error;
      }

      toast('success', 'Saved!', `${selected.size} project${selected.size !== 1 ? 's' : ''} di-highlight di homepage.`);
      setDirty(false);
    } catch (e: any) {
      toast('error', 'Failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Highlight Projects</h1>
          <p className="text-gray-400 mt-2">Pilih project yang ingin ditampilkan di bagian <span className="text-primary font-semibold">Highlight</span> homepage.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchProjects} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black text-sm font-bold rounded-xl hover:bg-[#32e612] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-primary/[0.08] border border-primary/20">
        <Star size={15} className="text-primary shrink-0" />
        <p className="text-sm text-gray-300">
          <span className="text-primary font-bold">{selected.size}</span> project dipilih — akan tampil di scrolling marquee homepage.
          {selected.size === 0 && <span className="text-gray-500 ml-1">Pilih minimal 1 project.</span>}
        </p>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-white/[0.04] border border-white/[0.06]">
              <div className="aspect-[3/4] bg-white/[0.06]" />
              <div className="p-3 space-y-1.5">
                <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/[0.07] rounded-3xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
            <ImageIcon size={28} className="text-gray-700" />
          </div>
          <p className="text-white font-bold text-base mb-1">Belum ada project</p>
          <p className="text-gray-600 text-sm">Upload project di menu <span className="text-primary">Projects</span> terlebih dahulu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {projects.map(p => {
              const isSelected = selected.has(p.id);
              return (
                <motion.button
                  key={p.id}
                  layout
                  onClick={() => toggle(p.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group ${
                    isSelected
                      ? 'border-primary shadow-[0_0_20px_rgba(57,255,20,0.2)]'
                      : 'border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-black/40 relative overflow-hidden">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-700"><ImageIcon size={24} /></div>}

                    {/* Dark overlay on hover */}
                    <div className={`absolute inset-0 transition-all duration-200 ${isSelected ? 'bg-primary/10' : 'bg-transparent group-hover:bg-black/20'}`} />

                    {/* Checkmark badge */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
                        >
                          <Check size={14} className="text-black" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Unselected circle */}
                    {!isSelected && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-white/30 bg-black/30" />
                    )}
                  </div>

                  {/* Info */}
                  <div className={`p-3 transition-colors ${isSelected ? 'bg-primary/5' : 'bg-white/[0.03]'}`}>
                    <p className="text-white text-xs font-bold truncate">{p.title}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{p.category}</p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

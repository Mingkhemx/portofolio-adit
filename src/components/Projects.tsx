import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Project {
  id: string;
  title: string;
  image_url: string | null;
}

const ProjectCard = ({ img, title }: { img: string; title: string }) => (
  <div className="relative overflow-hidden rounded-xl aspect-[3/4] w-[220px] md:w-[260px] shrink-0 mx-2 border border-white/[0.07] group">
    <img
      src={img}
      alt={title}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      referrerPolicy="no-referrer"
      draggable={false}
      onContextMenu={e => e.preventDefault()}
    />
    {/* subtle gradient bottom */}
    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    <p className="absolute bottom-2 left-3 right-3 text-white text-[11px] font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">{title}</p>
  </div>
);

// Fallback images jika belum ada data di DB
const FALLBACK = [
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572044162444-ad60f128bde3?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541462608141-ad6b39735d64?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=600&auto=format&fit=crop',
].map((url, i) => ({ id: `fb-${i}`, title: 'Portfolio', image_url: url }));

export default function Projects() {
  const navigate = useNavigate();
  const [highlighted, setHighlighted] = useState<Project[]>([]);

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, title, image_url')
      .eq('highlighted', true)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setHighlighted(data);
      });
  }, []);

  const items = highlighted.length > 0 ? highlighted : FALLBACK;

  // Pastikan cukup item untuk mengisi layar — minimal 20 item sebelum diduplikat
  const minCount = 20;
  const repeatTimes = Math.ceil(minCount / items.length);
  const base = Array.from({ length: repeatTimes }, () => items).flat();

  // Duplikat sekali lagi untuk seamless loop (CSS translateX -50%)
  const row1 = [...base, ...base];
  const row2 = [...base, ...base].reverse();

  return (
    <section className="py-24 relative overflow-hidden" id="projects">
      <div className="flex flex-col items-center mb-16 space-y-4 px-6">
        <p className="text-[#39FF14] text-xs font-bold tracking-[0.4em] uppercase">Featured Work</p>
        <h2 className="text-3xl font-bold tracking-[0.2em] text-white uppercase text-center">Highlight Project</h2>
      </div>

      {/* Row 1 — scroll left */}
      <div className="mb-6 w-full">
        <div className="relative w-full overflow-hidden pb-4">
          <div className="flex w-max animate-marquee">
            {row1.map((p, i) => (
              <ProjectCard key={`r1-${i}`} img={p.image_url ?? ''} title={p.title} />
            ))}
          </div>


        </div>
      </div>

      {/* Row 2 — scroll right */}
      <div className="mb-16 w-full">
        <div className="relative w-full overflow-hidden pb-4">
          <div className="flex w-max animate-marquee-reverse">
            {row2.map((p, i) => (
              <ProjectCard key={`r2-${i}`} img={p.image_url ?? ''} title={p.title} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#39FF14] hover:text-black hover:border-[#39FF14] transition-all duration-300"
        >
          View Full Portfolio
        </motion.button>
      </div>
    </section>
  );
}

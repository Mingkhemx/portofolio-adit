import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Clock, X, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import LightRays from '../components/LightRays';
import { useRef, useState, useEffect } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { supabase } from '../lib/supabase';
import { applyWatermark } from '../lib/watermark';

/* ─── Supabase project type ──────────────────────── */
interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  video_url: string | null;
  published: boolean;
}

// Card untuk Video/Motion Graphic
function FullTiltCard({ item, index, onNavigate }: { item: Project; index: number; onNavigate: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { damping: 30, stiffness: 100, mass: 2 });
  const rotateY = useSpring(useMotionValue(0), { damping: 30, stiffness: 100, mass: 2 });
  const scale   = useSpring(1,                 { damping: 30, stiffness: 100, mass: 2 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rotateX.set(((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -10);
    rotateY.set(((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  10);
  }
  function handleMouseEnter() { scale.set(1.04); }
  function handleMouseLeave() { scale.set(1); rotateX.set(0); rotateY.set(0); }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d', willChange: 'transform' }}
        className="flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-[#39FF14]/30 transition-colors duration-300"
      >
        {/* Image Showcase (Landscape Aspect) */}
        <div className="relative overflow-hidden aspect-video w-full">
          <img
            src={item.image_url ?? ''}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-sm text-[#39FF14] border border-[#39FF14]/30 px-2.5 py-1 rounded-full">
              {item.category}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        {/* Info */}
        <div className="p-4 flex flex-col gap-3">
          <h3 className="text-white font-bold text-[15px] leading-snug">{item.title}</h3>
          <p className="text-gray-400 text-[12px] leading-relaxed line-clamp-2">{item.description}</p>
          <button
            onClick={() => onNavigate(item.id)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-bold tracking-widest uppercase hover:bg-[#39FF14] hover:text-black hover:border-[#39FF14] transition-all duration-300"
          >
            <ExternalLink size={13} /> Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Skeleton loading card
function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/[0.06]" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/[0.06] rounded w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded w-1/2" />
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProjects(data);
        setLoading(false);
      });
  }, []);

  /* Lightbox */
  const [lightbox, setLightbox] = useState<{ src: string; wmSrc: string; title: string; items: Project[]; index: number } | null>(null);
  const [wmLoading, setWmLoading] = useState(false);

  const openLightbox = async (items: Project[], index: number) => {
    const item = items[index];
    if (!item.image_url) return;
    setWmLoading(true);
    // Start with original, apply watermark async
    setLightbox({ src: item.image_url, wmSrc: item.image_url, title: item.title, items, index });
    try {
      const wmSrc = await applyWatermark(item.image_url, '© Aditya Tri · aditya.id');
      setLightbox(prev => prev ? { ...prev, wmSrc } : null);
    } catch {
      // fallback to original if CORS blocked
    } finally {
      setWmLoading(false);
    }
  };
  const closeLightbox = () => setLightbox(null);
  const lightboxNav = async (dir: 1 | -1) => {
    if (!lightbox) return;
    const next = (lightbox.index + dir + lightbox.items.length) % lightbox.items.length;
    const item = lightbox.items[next];
    if (!item.image_url) return;
    setLightbox({ ...lightbox, src: item.image_url, wmSrc: item.image_url, title: item.title, index: next });
    try {
      const wmSrc = await applyWatermark(item.image_url, '© Aditya Tri · aditya.id');
      setLightbox(prev => prev ? { ...prev, wmSrc } : null);
    } catch { /* fallback */ }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxNav(1);
      if (e.key === 'ArrowLeft') lightboxNav(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightbox]);

  const formattedTime = time.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <>
    <div className="relative min-h-screen bg-transparent">

      {/* Pure black base layer */}
      <div className="fixed inset-0 bg-black" style={{ zIndex: -30 }} />

      {/* LightRays WebGL Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -20 }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#39FF14"
          raysSpeed={0.8}
          lightSpread={1.8}
          rayLength={2.5}
          pulsating={true}
          fadeDistance={1.8}
          saturation={1.0}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.03}
          distortion={0.05}
        />
      </div>

      {/* Overlay gelap tipis supaya teks tetap terbaca */}
      <div className="fixed inset-0 bg-black/30 pointer-events-none" style={{ zIndex: -10 }} />

      {/* Floating Header */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl"
      >
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-4 md:px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/50">
          
          {/* Back Button */}
          <div className="flex-1 flex justify-start">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 hover:border-[#39FF14] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-300 hover:bg-[#39FF14] hover:text-black group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="hidden sm:block">Back Home</span>
            </button>
          </div>

          {/* Page Title (Center) */}
          <div className="shrink-0 flex flex-col items-center px-1">
            <span className="text-[8px] md:text-[9px] text-[#39FF14] tracking-[0.3em] uppercase mb-0.5 font-bold">Directory</span>
            <h1 className="text-white font-black tracking-widest uppercase text-xs md:text-sm drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Portfolio</h1>
          </div>

          {/* Local Time */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] cursor-default group">
              <Clock size={12} className="text-[#39FF14] shrink-0" />
              <span className="text-gray-300 font-medium text-[9px] md:text-[10px] tracking-wider group-hover:text-white transition-colors duration-300 whitespace-nowrap tabular-nums">
                {formattedTime}
              </span>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Hero Title */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 md:pb-32 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#39FF14] text-sm font-bold tracking-[0.4em] uppercase mb-4"
        >
          All Works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4"
        >
          Portfolio
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg max-w-xl mx-auto"
        >
          Kumpulan karya desain grafis, branding, dan visual komunikasi terbaik.
        </motion.p>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-6 pb-24 space-y-24">

        {['Social Media', 'Design Printing', 'Photography', 'Personal Project', 'Video/Motion Graphic'].map((categoryName, idx) => {
          const items = projects.filter(p => p.category === categoryName);
          const gradientColor = idx % 2 === 0 ? 'from-[#39FF14]/50' : 'from-white/20';

          // Loading state
          if (loading) return (
            <section key={categoryName}>
              <div className="flex items-center justify-center gap-6 mb-12">
                <div className={`h-px w-16 sm:w-32 bg-gradient-to-l ${gradientColor} to-transparent`} />
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight whitespace-nowrap">{categoryName}</h2>
                <div className={`h-px w-16 sm:w-32 bg-gradient-to-r ${gradientColor} to-transparent`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            </section>
          );

          if (items.length === 0) return null;

          return (
            <section key={categoryName}>
              <div className="flex items-center justify-center gap-6 mb-12">
                <div className={`h-px w-16 sm:w-32 bg-gradient-to-l ${gradientColor} to-transparent`} />
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight whitespace-nowrap">{categoryName}</h2>
                <div className={`h-px w-16 sm:w-32 bg-gradient-to-r ${gradientColor} to-transparent`} />
              </div>

              {categoryName === 'Video/Motion Graphic' ? (
                <div className="flex flex-wrap justify-center gap-6">
                  {items.map((item, index) => (
                    <div key={item.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] max-w-sm">
                      <FullTiltCard item={item} index={index} onNavigate={(id) => navigate(`/portfolio/${id}`)} />
                    </div>
                  ))}
                </div>
              ) : (
                /* CSS Columns Masonry — gambar tampil sesuai rasio asli, tidak di-crop */
                <div
                  style={{
                    columns: 'var(--photo-cols)',
                    columnGap: '12px',
                  }}
                  className="[--photo-cols:2] sm:[--photo-cols:3] lg:[--photo-cols:4]"
                >
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.04 }}
                      className="break-inside-avoid mb-3 rounded-xl overflow-hidden border border-white/[0.07] hover:border-[#39FF14]/30 transition-all duration-300 group cursor-zoom-in relative"
                      onClick={() => openLightbox(items, index)}
                    >
                      <img
                        src={item.image_url ?? ''}
                        alt={item.title}
                        loading="lazy"
                        draggable={false}
                        onContextMenu={e => e.preventDefault()}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          aspectRatio: item.image_width && item.image_height
                            ? `${item.image_width} / ${item.image_height}`
                            : undefined,
                          WebkitUserDrag: 'none',
                        } as any}
                        className="object-cover w-full transition-transform duration-500 group-hover:scale-[1.02] pointer-events-none select-none"
                      />
                      {/* Invisible overlay to block direct right-click on image */}
                      <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          );
        })}

      </div>
    </div>

    {/* ── LIGHTBOX ──────────────────────────────────── */}
    <AnimatePresence>
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10"
          style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(20px)' }}
          onClick={closeLightbox}
        >
          <motion.img
            key={lightbox.wmSrc}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            src={lightbox.wmSrc}
            alt={lightbox.title}
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            onClick={e => e.stopPropagation()}
            className="object-contain rounded-2xl shadow-2xl select-none pointer-events-auto"
            style={{ maxHeight: '90vh', maxWidth: '90vw', WebkitUserDrag: 'none' } as any}
          />
          {/* WM badge */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] text-white/30 select-none">
            <Shield size={10} /> © Aditya Tri — All rights reserved
          </div>

          {/* Close */}
          <button onClick={closeLightbox}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <X size={18} />
          </button>

          {/* Prev / Next */}
          {lightbox.items.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); lightboxNav(-1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={e => { e.stopPropagation(); lightboxNav(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-black/50 px-4 py-1.5 rounded-full">
            {lightbox.index + 1} / {lightbox.items.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

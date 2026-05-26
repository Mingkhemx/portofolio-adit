import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ExternalLink, Calendar, User, Tag, Loader2, Play, Pause, Volume2, VolumeX, Maximize, RotateCw } from 'lucide-react';
import { portfolioItems } from '../data/portfolio';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface NormalizedProject {
  title: string;
  category: string;
  desc: string;
  img: string | null;
  type: 'video' | 'image';
  videoUrl: string | null;
  client?: string;
  role?: string;
  tools?: string[];
}

function CustomVideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [centerAction, setCenterAction] = useState<'play' | 'pause' | null>(null);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }
    const delay = setTimeout(() => {
      setShowControls(false);
    }, 2000);
    return () => clearTimeout(delay);
  }, [isPlaying, currentTime]);

  const triggerCenterAction = (action: 'play' | 'pause') => {
    setCenterAction(action);
    const t = setTimeout(() => setCenterAction(null), 500);
    return () => clearTimeout(t);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      triggerCenterAction('pause');
    } else {
      videoRef.current.play();
      triggerCenterAction('play');
      setHasStarted(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    triggerCenterAction('play');
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = Number(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    if (vol > 0) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group w-full bg-black rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl transition-all duration-300 ${
        !hasStarted ? 'cursor-pointer' : (showControls ? 'cursor-default' : 'cursor-none')
      }`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <style>{`
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #39FF14;
          cursor: pointer;
          box-shadow: 0 0 8px #39FF14;
          transition: transform 0.1s ease;
        }
        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }
        .custom-slider::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border: none;
          border-radius: 50%;
          background: #39FF14;
          cursor: pointer;
          box-shadow: 0 0 8px #39FF14;
          transition: transform 0.1s ease;
        }
        .custom-slider::-moz-range-thumb:hover {
          transform: scale(1.3);
        }
      `}</style>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="w-full h-auto object-cover max-h-[75vh] block"
        playsInline
      />

      {/* First-load Circular Play Button Overlay */}
      {!hasStarted && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-30 transition-all duration-500">
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-[#39FF14]/30 hover:border-[#39FF14] text-[#39FF14] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] group/firstplay active:scale-95 cursor-pointer z-40"
          >
            <Play size={28} fill="currentColor" className="ml-1.5 transition-transform group-hover/firstplay:scale-115 duration-300" />
          </button>
        </div>
      )}

      {/* Big Center Action Indicator (Netflix/Youtube style) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {centerAction && (
          <div className="w-16 h-16 rounded-full bg-black/60 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] animate-[ping_0.5s_ease-in-out_infinite] opacity-90">
            {centerAction === 'play' ? <Play size={26} fill="currentColor" className="ml-1" /> : <Pause size={26} fill="currentColor" />}
          </div>
        )}
      </div>

      {/* Floating Control Card (Apple TV / Vimeo Pro style) */}
      <div 
        className={`absolute inset-x-4 bottom-4 z-20 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all duration-500 transform ${
          (hasStarted && showControls) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Timeline Slider with Hover Glow */}
        <div className="flex items-center gap-3 w-full group/timeline">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="custom-slider w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer group-hover/timeline:h-1.5 transition-all duration-200"
            style={{
              background: `linear-gradient(to right, #39FF14 0%, #39FF14 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>

        {/* Buttons and Info Row */}
        <div className="flex items-center justify-between w-full text-white text-xs">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause Button with neon hover glow */}
            <button 
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#39FF14] hover:text-[#39FF14] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_12px_rgba(57,255,20,0.2)] active:scale-90"
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Skip +10s with smooth rotate hover */}
            <button 
              onClick={skipForward}
              title="Skip +10s"
              className="h-8 px-3 rounded-full bg-white/5 border border-white/10 hover:border-[#39FF14] hover:text-[#39FF14] flex items-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_12px_rgba(57,255,20,0.2)] active:scale-90"
            >
              <RotateCw size={12} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[9px] font-bold tracking-wider uppercase">10s</span>
            </button>

            {/* Time Stamp display */}
            <span className="text-gray-400 font-medium tracking-wide tabular-nums select-none">
              {formatTime(currentTime)} <span className="text-white/20 mx-1">/</span> {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Volume controller with pop-out slider */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-full group/volume hover:border-[#39FF14]/30 hover:bg-white/[0.08] transition-all duration-300">
              <button 
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors duration-200 active:scale-95 shrink-0"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div className="overflow-hidden flex items-center w-0 group-hover/volume:w-16 transition-all duration-300 ease-out">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="custom-slider w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none ml-1.5 shrink-0"
                  style={{
                    background: `linear-gradient(to right, #39FF14 0%, #39FF14 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
            </div>

            {/* Maximize Fullscreen with glow */}
            <button 
              onClick={handleFullscreen}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#39FF14] hover:text-[#39FF14] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_12px_rgba(57,255,20,0.2)] active:scale-90"
            >
              <Maximize size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<NormalizedProject | null>(null);
  const [loading, setLoading] = useState(true);

  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadProject = async () => {
      setLoading(true);
      // Try local static items first
      const staticItem = portfolioItems.find((p) => p.id === Number(id));
      if (staticItem) {
        setProject({
          title: staticItem.title,
          category: staticItem.category,
          desc: staticItem.desc,
          img: staticItem.img,
          type: staticItem.type as 'video' | 'image',
          videoUrl: staticItem.videoUrl || null,
          client: 'Internal Concept / Mockup',
          role: 'Lead Designer, Art Director',
          tools: ['Adobe Illustrator', 'Photoshop', 'Figma'],
        });
        setLoading(false);
        return;
      }

      // Fetch from Supabase if static item not found (UUID)
      if (id) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

          if (data && !error) {
            setProject({
              title: data.title,
              category: data.category,
              desc: data.description || 'Tidak ada deskripsi proyek.',
              img: data.image_url,
              type: data.video_url ? 'video' : 'image',
              videoUrl: data.video_url,
              client: data.client,
              role: data.role,
              tools: data.tools ? data.tools.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
            });
          }
        } catch (err) {
          console.error('Error fetching project detail:', err);
        }
      }
      setLoading(false);
      // Ensure we scroll to top after loading finishes
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 100);
    };

    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[#39FF14]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <button 
            onClick={() => navigate('/portfolio')}
            className="text-[#39FF14] hover:underline"
          >
            Return to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#39FF14] selection:text-black">
      
      {/* Sticky Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/[0.06] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase bg-white/5 border border-white/10 hover:border-[#39FF14]/40 hover:bg-white/[0.08] text-gray-300 hover:text-white px-4.5 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(57,255,20,0.1)] group active:scale-95"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Portfolio
          </button>
          
          <button className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-widest uppercase bg-[#39FF14] text-black border border-[#39FF14] hover:bg-transparent hover:text-[#39FF14] px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] active:scale-95">
            Launch Project <ExternalLink size={13} />
          </button>
        </div>
      </header>

      {/* Hero Banner with Parallax */}
      <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden mt-16 md:mt-0">
        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ y: yHero, opacity: opacityHero }}
        >
          {project.type === 'video' && project.videoUrl ? (
            <video 
              src={project.videoUrl} 
              autoPlay loop muted playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={project.img || ''} 
              alt={project.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* Hero Content */}
        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-6 pb-16 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase border border-[#39FF14]/50 text-[#39FF14] rounded-full bg-black/50 backdrop-blur-sm">
              {project.category}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              {project.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#39FF14]" />
                <span>2024</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#39FF14]" />
                <span>Adit Studio</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#39FF14]" />
                <span>Creative, Design</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-20 relative z-20 bg-black">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Column (Main Text) */}
          <motion.div 
            className="lg:col-span-8 space-y-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Video Showcase (Top Placement) */}
            {project.type === 'video' && project.videoUrl && (
              <section className="space-y-6">
                <CustomVideoPlayer src={project.videoUrl} poster={project.img || undefined} />
              </section>
            )}

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Overview</h2>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {project.desc}
              </p>
            </section>

            {/* Image Showcase (Only for non-video) */}
            {project.type !== 'video' && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold mb-8 text-white">Visual Showcase</h2>
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <img src={project.img || ''} alt="Showcase 1" className="w-full h-auto grayscale-[30%] hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square">
                     <img src={project.img || ''} alt="Detail" className="w-full h-full object-cover scale-150 transform-origin-top-left" />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square">
                     <img src={project.img || ''} alt="Detail" className="w-full h-full object-cover scale-150 transform-origin-bottom-right" />
                  </div>
                </div>
              </section>
            )}

          </motion.div>

          {/* Right Column (Sidebar) */}
          <motion.div 
            className="lg:col-span-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="sticky top-32 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
              {(project.client || project.role || (project.tools && project.tools.length > 0)) && (
                <>
                  <h3 className="text-lg font-bold mb-6 text-white border-b border-white/10 pb-4">Project Details</h3>
                  <ul className="space-y-6">
                    {project.client && (
                      <li>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Client</p>
                        <p className="text-sm text-gray-300">{project.client}</p>
                      </li>
                    )}
                    {project.role && (
                      <li>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Role</p>
                        <p className="text-sm text-gray-300">{project.role}</p>
                      </li>
                    )}
                    {project.tools && project.tools.length > 0 && (
                      <li>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Tools</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.tools.map(tool => (
                            <span key={tool} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-gray-400">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </li>
                    )}
                  </ul>
                </>
              )}

              <div className={(project.client || project.role || (project.tools && project.tools.length > 0)) ? "mt-10 pt-6 border-t border-white/10" : ""}>
                <p className="text-sm text-gray-400 mb-4 text-center">Share this project</p>
                <div className="flex gap-4 justify-center">
                  <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#39FF14] hover:text-black flex items-center justify-center transition-colors border border-white/10">
                    <span className="font-bold text-xs">X</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#39FF14] hover:text-black flex items-center justify-center transition-colors border border-white/10">
                    <span className="font-bold text-xs">IN</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

    </div>
  );
}

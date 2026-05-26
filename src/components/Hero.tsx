import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import profilePic from '../image/Profile_Picture2.png';

interface SiteSettings {
  display_name: string;
  job_title: string;
  hero_description: string;
}

/* Split nama menjadi dua baris: kata pertama & sisanya */
function splitName(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length <= 1) return { first: name, rest: '' };
  const first = parts[0];
  const rest = parts.slice(1).join(' ');
  return { first, rest };
}

export default function Hero() {
  const [settings, setSettings] = useState<SiteSettings>({
    display_name: 'Aditya Tri Nuryanto',
    job_title: 'Graphic Designer',
    hero_description: 'I believe strong visuals speak first. I design with imagery as the main language.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('display_name, job_title, hero_description')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data);
      })
      .catch((err) => {
        console.warn('Hero data fetch failed:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const { first, rest } = splitName(settings.display_name);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12">
      {/* CSS Mask to fade out the sharp horizontal chest crop of the photo, making it blend seamlessly into the background */}
      <style>{`
        .fade-photo {
          -webkit-mask-image: linear-gradient(to bottom, black 65%, transparent 98%);
          mask-image: linear-gradient(to bottom, black 65%, transparent 98%);
        }
      `}</style>
      <div className="container max-w-7xl mx-auto flex items-center justify-center mt-6 lg:mt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full"
        >
          {/* Card utama (Overflow hidden on mobile to clip photo cleanly, overflow visible on desktop to allow pop-out) */}
          <div
            className="glass-card relative rounded-[2rem] lg:rounded-[2.5rem] border border-white/20 bg-white/5 backdrop-blur-xl shadow-[inset_0_0_40px_rgba(255,255,255,0.15)] lg:shadow-[inset_0_0_60px_rgba(255,255,255,0.15)] flex flex-col-reverse lg:flex-row items-center lg:items-stretch transition-all duration-300 w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[480px] overflow-hidden lg:overflow-visible"
          >
            {/* Konten teks di bawah foto pada mobile, di kiri pada desktop (With adjusted top/bottom paddings for symmetric breathing room) */}
            <div className="relative z-10 px-6 pt-4 pb-10 sm:px-10 sm:pt-6 sm:pb-12 lg:px-16 lg:py-16 w-full lg:max-w-[60%] flex flex-col items-start text-left">

              {loading ? (
                /* Skeleton loader */
                <div className="space-y-4 animate-pulse w-full">
                  <div className="h-10 md:h-16 bg-white/10 rounded-2xl w-3/4" />
                  <div className="h-10 md:h-16 bg-white/10 rounded-2xl w-1/2" />
                  <div className="h-8 bg-primary/20 rounded-lg w-40 mt-2" />
                  <div className="h-4 bg-white/10 rounded w-64 mt-2" />
                  <div className="h-4 bg-white/10 rounded w-52" />
                </div>
              ) : (
                <>
                  <h1
                    className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 text-white"
                    style={{ lineHeight: '1.1' }}
                  >
                    {first}
                    {rest && <><br className="hidden lg:block" /> {rest}</>}
                  </h1>

                  <div className="inline-block bg-[#39FF14] text-black px-4 py-1.5 md:px-5 md:py-2 font-bold text-base md:text-xl mb-4 rounded-md">
                    {settings.job_title}
                  </div>

                  <p className="text-gray-300 text-sm md:text-lg max-w-sm md:max-w-md leading-relaxed">
                    {settings.hero_description}
                  </p>
                </>
              )}
            </div>

            {/* Foto (Desktop: Absolute pop-out z-20, Mobile/Tablet: Flows naturally at the top of the card as relative flex-child with gentle breathing space) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative lg:absolute bottom-0 right-auto lg:right-10 h-[300px] sm:h-[360px] lg:h-[120%] z-20 pointer-events-none scale-100 lg:scale-[1.25] origin-bottom flex justify-center lg:block w-full lg:w-auto opacity-100 transition-all duration-300 shrink-0 mt-4 lg:mt-0"
            >
              <img
                src={profilePic}
                alt={settings.display_name}
                className="h-full w-auto max-w-none object-contain object-bottom fade-photo mix-blend-screen"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

/* ─── Types ─────────────────────────────── */
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
  sort_order: number;
  icon_url?: string;
}

/* ─── Skeleton ───────────────────────────── */
function SkeletonLine({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-white/10 rounded-full animate-pulse`} />;
}

export default function Profile() {
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch semua data paralel
      const [descRes, eduRes, skillsRes, settingsRes] = await Promise.all([
        supabase.from('profile_description').select('content').limit(1).single(),
        supabase.from('education').select('*').order('sort_order', { ascending: true }),
        supabase.from('skills').select('*').order('sort_order', { ascending: true }),
        supabase.from('site_settings').select('profile_image_url').limit(1).single(),
      ]);

      if (descRes.data)   setDescription(descRes.data.content);
      if (settingsRes.data) setProfileImage(settingsRes.data.profile_image_url);
      if (eduRes.data)    setEducation(eduRes.data);
      if (skillsRes.data) setSkills(skillsRes.data);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <section className="relative pt-40 pb-24 px-6" id="profile">
      <div className="container max-w-6xl mx-auto">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center text-4xl font-bold tracking-[0.2em] mb-20 text-white uppercase"
        >
          Profile
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* ── Education Card (kiri) ─────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 glass-card p-6 lg:p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="rounded-[1.25rem] overflow-hidden mb-8 aspect-[4/3] w-full">
              <img
                src={profileImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop"}
                alt="Profile Work"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-xl uppercase tracking-widest text-white">Education</h3>

              {loading ? (
                /* Skeleton loader */
                <div className="space-y-5">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <SkeletonLine w="w-3/4" h="h-4" />
                      <SkeletonLine w="w-1/2" h="h-3" />
                    </div>
                  ))}
                </div>
              ) : education.length === 0 ? (
                <p className="text-gray-600 text-sm italic">Belum ada data pendidikan.</p>
              ) : (
                <div className="space-y-5">
                  {education.map((edu, i) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                      <p className="text-white font-bold text-[15px] uppercase mb-1">{edu.school}</p>
                      <p className="text-gray-100 text-[13px] font-medium">
                        {edu.major}{edu.year ? ` (${edu.year})` : ''}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Description & Skills (kanan) ─────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-12 pt-4"
          >
            {/* Description */}
            {loading ? (
              <div className="space-y-3">
                <SkeletonLine />
                <SkeletonLine w="w-5/6" />
                <SkeletonLine w="w-4/6" />
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-gray-300 leading-relaxed text-[16px] max-w-2xl"
              >
                {description || 'Visual-driven graphic designer with a background in Visual Communication Design.'}
              </motion.p>
            )}

            {/* Skills */}
            <div className="space-y-8">
              <h3 className="font-bold text-2xl text-white tracking-wide">Software & Skills</h3>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-[14px] animate-pulse shrink-0" />
                      <SkeletonLine w="w-28" h="h-4" />
                    </div>
                  ))}
                </div>
              ) : skills.length === 0 ? (
                <p className="text-gray-600 text-sm italic">Belum ada skill yang ditambahkan.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07, duration: 0.4 }}
                      className="relative h-14 group cursor-pointer flex items-center"
                    >
                      {/* Hover Pill Background */}
                      <div className="absolute -inset-x-3 inset-y-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative flex items-center gap-4 w-full z-10 px-1">
                        {/* Icon / Image */}
                        <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/20 rounded-[14px] text-white text-[13px] font-extrabold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden">
                          {skill.icon_url
                            ? <img src={skill.icon_url} alt={skill.name} className="w-full h-full object-contain p-1.5" />
                            : skill.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')
                          }
                        </div>

                        {/* Name + Progress Bar */}
                        <div className="flex flex-col justify-center relative w-full pr-4 h-12 overflow-visible">
                          <div className="flex items-center justify-between w-full transition-all duration-300 transform group-hover:-translate-y-2">
                            <span className="text-white text-[15px] font-semibold whitespace-nowrap transition-all duration-300 group-hover:text-xs">
                              {skill.name}
                            </span>
                            <span className="text-primary text-[13px] font-black opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:text-[11px] pr-2">
                              {skill.percent}%
                            </span>
                          </div>

                          {/* Progress Bar (muncul saat hover) */}
                          <div className="absolute bottom-1 left-0 w-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-700 ease-out w-0 group-hover:w-[var(--level)]"
                                style={{ '--level': `${skill.percent}%` } as React.CSSProperties}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

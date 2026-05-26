import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Linkedin, Instagram, Mail, ArrowUpRight, MapPin } from 'lucide-react';
import React from 'react';
import { supabase } from '../lib/supabase';

interface ContactSettings {
  display_name: string;
  whatsapp_number: string;
  instagram_url: string;
  linkedin_url: string;
  email: string;
}

const DEFAULT: ContactSettings = {
  display_name:     'Aditya Tri Nuryanto',
  whatsapp_number:  '6281234567890',
  instagram_url:    'https://www.instagram.com/adityatrinuryanto',
  linkedin_url:     'https://www.linkedin.com/in/adityatrinuryanto',
  email:            'adityatrinuryanto370@gmail.com',
};

const navLinks = [
  { label: 'Home',     href: '#' },
  { label: 'Profile',  href: '#profile' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact',  href: '#contact' },
];

export default function Contact() {
  const [settings, setSettings] = useState<ContactSettings>(DEFAULT);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('display_name, whatsapp_number, instagram_url, linkedin_url, email')
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setSettings(data); });
  }, []);

  // Ambil username IG dari URL
  const igUsername = settings.instagram_url.replace(/\/$/, '').split('/').pop() ?? '';

  const contactLinks = [
    {
      icon: <Linkedin size={20} />,
      label: settings.display_name,
      sub: 'Connect with me on LinkedIn',
      href: settings.linkedin_url,
    },
    {
      icon: <Instagram size={20} />,
      label: igUsername.startsWith('@') ? igUsername : `@${igUsername}`,
      sub: 'Follow me on Instagram',
      href: settings.instagram_url,
    },
    {
      icon: <Mail size={20} />,
      label: settings.email,
      sub: 'Send me an email',
      href: `mailto:${settings.email}`,
    },
  ];

  const waHref = `https://wa.me/${settings.whatsapp_number}?text=Halo%20${encodeURIComponent(settings.display_name.split(' ')[0])}%2C%20saya%20tertarik%20untuk%20berkolaborasi%20dengan%20Anda!`;

  return (
    <section className="py-16 px-6 relative" id="contact">
      <div className="container max-w-6xl mx-auto">

        {/* Card utama */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10">

          {/* Baris atas: Contact kiri + CTA hijau kanan */}
          <div className="flex flex-col lg:flex-row min-h-[280px]">

            {/* Kiri: Contact info */}
            <div className="flex-1 p-6 sm:p-10 space-y-7">
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">CONTACT</h2>
                <div className="w-12 h-[2px] bg-primary" />
              </div>
              <div className="space-y-6">
                {contactLinks.map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.href}
                    target={link.href.startsWith('mailto') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-xl text-white border border-white/10 shrink-0 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                      {link.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-xs sm:text-sm group-hover:text-primary transition-colors break-all">{link.label}</p>
                      <p className="text-gray-500 text-xs">{link.sub}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Kanan: CTA hijau */}
            <div className="flex-[1.2] bg-primary flex flex-col justify-center p-8 sm:p-10 lg:pl-16 relative z-0">
              {/* S-Curve Wave */}
              <svg
                className="absolute left-[-149px] top-0 w-[150px] h-full hidden lg:block text-primary pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path d="M100,0 C100,40 0,60 0,100 L100,100 Z" fill="currentColor" />
              </svg>
              <div className="space-y-5">
                <h2 className="text-3xl sm:text-4xl font-black text-black leading-tight">Let's Work Together</h2>
                <p className="text-black/80 text-xs sm:text-sm max-w-xs leading-relaxed">
                  I'm available for freelance and creative collaborations.
                  Let's create something impactful and meaningful.
                </p>
                <motion.a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95"
                >
                  <ArrowUpRight size={16} className="text-primary" />
                  Contact Me
                </motion.a>
              </div>
            </div>
          </div>

          {/* Baris bawah: nav + lokasi */}
          <div className="border-t border-white/10 px-6 py-6 md:px-10 md:py-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {navLinks.map((link, i) => (
                <React.Fragment key={i}>
                  <a href={link.href} className="text-xs font-semibold text-white hover:text-primary transition-colors">
                    {link.label}
                  </a>
                  {i < navLinks.length - 1 && <span className="text-primary text-xs">•</span>}
                </React.Fragment>
              ))}
            </nav>
            <div className="hidden md:block w-[1px] h-5 bg-white/20" />
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">Based on Indonesia</p>
                <p className="text-[10px] text-gray-400 leading-tight">Available Worldwide</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/5 px-10 py-4 text-center">
            <p className="text-[10px] text-gray-500">© 2026 {settings.display_name}</p>
          </div>

        </div>
      </div>
    </section>
  );
}

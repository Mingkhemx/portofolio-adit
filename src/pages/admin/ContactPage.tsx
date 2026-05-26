import { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw, Phone, Instagram, Linkedin, Mail } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';

interface ContactSettings {
  id: string;
  whatsapp_number: string;
  instagram_url: string;
  linkedin_url: string;
  email: string;
}

const inputCls = 'w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-primary/50 transition-colors';

export default function ContactPage() {
  const { toast } = useToast();

  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl,   setInstagramUrl]   = useState('');
  const [linkedinUrl,    setLinkedinUrl]    = useState('');
  const [email,          setEmail]          = useState('');

  /* ════════════════════════════════════
     FETCH
  ════════════════════════════════════ */
  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, whatsapp_number, instagram_url, linkedin_url, email')
      .limit(1)
      .single();

    if (data) {
      setSettings(data);
      setWhatsappNumber(data.whatsapp_number ?? '');
      setInstagramUrl(data.instagram_url     ?? '');
      setLinkedinUrl(data.linkedin_url       ?? '');
      setEmail(data.email                    ?? '');
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
    if (!whatsappNumber.trim()) return toast('error', 'Error', 'Nomor WhatsApp tidak boleh kosong.');
    if (!email.trim())          return toast('error', 'Error', 'Email tidak boleh kosong.');

    setSaving(true);
    try {
      const payload = {
        whatsapp_number: whatsappNumber.trim().replace(/\D/g, ''),
        instagram_url:   instagramUrl.trim(),
        linkedin_url:    linkedinUrl.trim(),
        email:           email.trim(),
        updated_at:      new Date().toISOString(),
      };

      if (settings?.id) {
        const { error } = await supabase.from('site_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('site_settings').insert(payload).select().single();
        if (error) throw error;
        if (data) setSettings(data);
      }

      toast('success', 'Contact saved!', 'Info kontak berhasil diperbarui di homepage.');
    } catch (e: any) {
      toast('error', 'Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ─── WA Preview URL ─── */
  const waPreview = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Contact</h1>
          <p className="text-gray-400 mt-1 text-sm">Kelola nomor WhatsApp, Instagram, LinkedIn, dan email yang tampil di homepage.</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-all w-full sm:w-auto self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Form ───────────────────────────────── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 space-y-7">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">📞</span>
          Social &amp; Contact Links
        </h2>

        {loading ? (
          <div className="space-y-5 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-32 bg-white/10 rounded" />
                <div className="h-12 bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">

            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Phone size={12} className="text-primary" /> Nomor WhatsApp
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold select-none">+</span>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="628123456789"
                  className={inputCls + ' pl-8'}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <p className="text-xs text-gray-600">
                  Format: kode negara + nomor tanpa 0. Contoh: <span className="text-primary font-bold">628123456789</span>
                </p>
                {whatsappNumber && (
                  <a
                    href={waPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-semibold self-start sm:self-auto"
                  >
                    Test link ↗
                  </a>
                )}
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Instagram size={12} className="text-primary" /> Instagram URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/username"
                className={inputCls}
              />
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-semibold inline-block"
                >
                  Test link ↗
                </a>
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Linkedin size={12} className="text-primary" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/username"
                className={inputCls}
              />
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-semibold inline-block"
                >
                  Test link ↗
                </a>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Mail size={12} className="text-primary" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                className={inputCls}
              />
            </div>

          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={saveSettings}
            disabled={saving || loading}
            className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-[#32e612] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Contact'}
          </button>
        </div>
      </div>

      {/* ── Preview Card ───────────────────────── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-white/10 text-gray-400 flex items-center justify-center">👁</span>
          Preview Contact Section
        </h2>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
          {[
            { icon: <Linkedin size={18} />, label: 'LinkedIn',  value: linkedinUrl || '—' },
            { icon: <Instagram size={18} />, label: 'Instagram', value: instagramUrl.replace(/\/$/, '').split('/').pop() ? `@${instagramUrl.replace(/\/$/, '').split('/').pop()}` : '—' },
            { icon: <Mail size={18} />,     label: 'Email',     value: email || '—' },
            { icon: <Phone size={18} />,    label: 'WhatsApp',  value: whatsappNumber ? `+${whatsappNumber}` : '—' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-primary border border-white/10 shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-white text-sm font-medium truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

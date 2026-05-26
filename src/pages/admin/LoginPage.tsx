import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import profilePic from '../../image/Profile_Picture2.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.ok) {
      navigate('/admin');
    } else {
      setError(result.error ?? 'Login failed.');
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated background */}
      <motion.div
        animate={{ rotate: [0, 360], borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '60% 40% 30% 70% / 60% 30% 70% 40%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-[#39FF14] blur-[180px] opacity-[0.08]"
      />
      <motion.div
        animate={{ x: [40, -40, 40], y: [-30, 30, -30], scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vh] bg-[#39FF14] blur-[200px] opacity-[0.06] rounded-full"
      />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(57,255,20,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
      />

      {/* Card */}
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div
          className="rounded-3xl p-8 border border-white/10"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(32px)' }}
        >
          {/* Top: Profile photo + title */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex flex-col items-center gap-4">
              {/* Profile photo with neon ring */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden">
                  <img src={profilePic} alt="Aditya Tri" className="w-full h-full object-cover" />
                </div>
                {/* Online dot */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-black shadow-[0_0_8px_#39FF14]" />
              </div>
              <div className="text-center">
                <h1 className="text-white font-black text-2xl tracking-tight">Admin Panel</h1>
                <p className="text-gray-500 text-sm mt-1">Sign in to manage your portfolio</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-[#32e612] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-gray-700 text-xs mt-6">
            Protected area · Portfolio Admin
          </p>
        </div>

        {/* Back to website — under card */}
        <div className="mt-5 text-center">
          <a href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors inline-flex items-center gap-1.5">
            ← Back to website
          </a>
        </div>
      </motion.div>
    </div>
  );
}

import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, Toast, ToastType } from '../../hooks/useToast';

const config: Record<ToastType, { icon: React.ReactNode; color: string; glow: string; bg: string; border: string }> = {
  success: {
    icon: <CheckCircle2 size={20} />,
    color: 'text-[#39FF14]',
    glow: 'shadow-[0_0_20px_rgba(57,255,20,0.25)]',
    bg: 'bg-[#39FF14]/10',
    border: 'border-[#39FF14]/25',
  },
  error: {
    icon: <XCircle size={20} />,
    color: 'text-red-400',
    glow: 'shadow-[0_0_20px_rgba(248,113,113,0.2)]',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    color: 'text-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(250,204,21,0.2)]',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/25',
  },
  info: {
    icon: <Info size={20} />,
    color: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(96,165,250,0.2)]',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast();
  const c = config[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative flex items-start gap-3 w-[320px] px-4 py-4 rounded-2xl
        backdrop-blur-2xl border ${c.border} ${c.bg} ${c.glow}
        bg-black/60 overflow-hidden
      `}
    >
      {/* Animated shimmer line at top */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        style={{ originX: 0 }}
        className={`absolute top-0 left-0 h-[2px] w-full ${
          toast.type === 'success' ? 'bg-[#39FF14]' :
          toast.type === 'error' ? 'bg-red-400' :
          toast.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
        }`}
      />

      {/* Icon */}
      <div className={`${c.color} mt-0.5 shrink-0`}>
        {c.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => dismiss(toast.id)}
        className="shrink-0 text-gray-500 hover:text-white transition-colors mt-0.5"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

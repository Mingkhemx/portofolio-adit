import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Star, FolderOpen, User, Settings, LogOut, Globe, Phone, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import LiquidEther from '../LiquidEther';
import { ToastProvider } from '../../hooks/useToast';
import ToastContainer from './ToastContainer';
import { useAuth } from '../../hooks/useAuth';
import profilePic from '../../image/Profile_Picture2.png';


const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, end: true, desc: 'Analytics & overview' },
  { label: 'Highlight', href: '/admin/highlight', icon: Star, end: false, desc: 'Homepage feature image' },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen, end: false, desc: 'Manage portfolio work' },
  { label: 'Profile', href: '/admin/profile', icon: User, end: false, desc: 'Bio, education & skills' },
  { label: 'Contact', href: '/admin/contact', icon: Phone, end: false, desc: 'WA, IG, LinkedIn & email' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, end: false, desc: 'Hero section content' },
];

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside 
      className={`w-[260px] fixed h-full z-40 flex flex-col transition-all duration-300 ease-in-out lg:left-0 ${
        isOpen ? 'left-0' : '-left-[260px]'
      }`} 
      style={{ 
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 100%)', 
        backdropFilter: 'blur(24px)', 
        borderRight: '1px solid rgba(255,255,255,0.06)' 
      }}
    >
      
      {/* Top: Brand + Profile Card + Mobile Close */}
      <div className="px-5 pt-8 pb-6 flex items-center justify-between gap-2">
        {/* Profile Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden">
            <img src={profilePic} alt="Aditya Tri" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-sm leading-tight truncate">Aditya Tri</p>
            <p className="text-gray-500 text-xs truncate mt-0.5">Graphic Designer</p>
          </div>
          <div className="shrink-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_#39FF14]" />
        </div>

        {/* Close Drawer Button on Mobile/Tablet */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all active:scale-90"
        >
          <X size={18} />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-5" />

      {/* Nav Label */}
      <div className="px-6 mb-3">
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em]">Navigation</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className="block group"
            >
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10'
                  : 'hover:bg-white/[0.04]'
              }`}>
                {/* Active left bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full shadow-[0_0_8px_#39FF14]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-white/[0.04] text-gray-500 group-hover:text-gray-300 group-hover:bg-white/[0.07]'
                }`}>
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                {/* Label + desc */}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold leading-tight transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                  }`}>
                    {item.label}
                  </p>
                  <p className={`text-[11px] leading-tight mt-0.5 truncate transition-colors duration-200 ${
                    isActive ? 'text-primary/70' : 'text-gray-600 group-hover:text-gray-500'
                  }`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-4 py-6 space-y-2">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-4" />
        {/* Back to website */}
        <a
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.07] transition-colors">
            <Globe size={14} />
          </div>
          <span className="text-sm font-medium">Visit Website</span>
        </a>
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
            <LogOut size={14} />
          </div>
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar drawer automatically on navigation/route changes (mobile only)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#000000] text-white relative overflow-hidden">
        {/* BACKGROUND ANIMATION */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-[0.35] mix-blend-screen blur-[60px]">
            <LiquidEther
              colors={['#000000', '#0a4a0a', '#1a7a0a', '#39FF14']}
              mouseForce={20}
              cursorSize={150}
              isViscous={false}
              viscous={20}
              iterationsViscous={10}
              iterationsPoisson={10}
              resolution={0.25}
              dt={0.005}
              isBounce={false}
              autoDemo={true}
              autoSpeed={0.3}
              autoIntensity={1.2}
              takeoverDuration={0.25}
              autoResumeDelay={0}
              autoRampDuration={0.6}
            />
          </div>
          <motion.div
            animate={{ x: [-30, 30, -30], y: [30, -30, 30], scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#39FF14] blur-[150px] rounded-full opacity-[0.12]"
          />
        </div>

        {/* Mobile/Tablet Header */}
        <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white active:scale-95 transition-all"
          >
            <Menu size={20} />
          </button>
          <span className="text-white font-bold text-xs tracking-widest uppercase">Admin Panel</span>
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
            <img src={profilePic} alt="Aditya" className="w-full h-full object-cover" />
          </div>
        </header>

        {/* Mobile Sidebar Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          />
        )}

        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main content (Responsive padding and margins) */}
        <main className="flex-1 lg:ml-[260px] p-6 sm:p-10 pt-24 lg:pt-10 overflow-y-auto relative z-10 h-screen w-full min-w-0">
          <Outlet />
        </main>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}


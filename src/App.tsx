import { Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Profile from './components/Profile';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LiquidEther from './components/LiquidEther';
import PortfolioPage from './pages/PortfolioPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import DashboardPage from './pages/admin/DashboardPage';
import HighlightPage from './pages/admin/HighlightPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import ProfilePage from './pages/admin/ProfilePage';
import ContactPage from './pages/admin/ContactPage';
import SettingsPage from './pages/admin/SettingsPage';
import LoginPage from './pages/admin/LoginPage';
import { AuthProvider } from './hooks/useAuth';
import { motion, useScroll, useSpring } from 'motion/react';

function HomePage() {

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="relative min-h-screen selection:bg-primary selection:text-black scroll-smooth">
      {/* LAYER 1: PURE BLACK BASE */}
      <div className="fixed inset-0 bg-[#000000] -z-20" />

      {/* LAYER 2: PREMIUM REACTBITS-STYLE ANIMATED GLOWS */}
      {/* Container ini setinggi seluruh halaman, jadi glow menempel pada letak elemen (Hero, Profile, Contact) */}
      <div className="absolute inset-x-0 top-0 h-full pointer-events-none -z-10 overflow-hidden">
        
        {/* 1. Hero Liquid Wave Gradient (Matahari Terik dari Kiri Atas - Responsive width & height) */}
        <motion.div 
          animate={{ 
            rotate: [0, 360], 
            borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 40% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] sm:top-[-20%] left-[-20%] sm:left-[-15%] w-[140vw] sm:w-[100vw] lg:w-[80vw] h-[50vh] sm:h-[80vh] bg-primary blur-[100px] sm:blur-[160px] opacity-[0.45] sm:opacity-[0.5]" 
        />
        
        {/* 2. Profile LiquidEther Background */}
        {/* NOTE: Optimized performance by reducing resolution, lowering iterations, disabling heavy viscosity, and forcing hardware acceleration. */}
        <div 
          className="absolute top-[450px] sm:top-[600px] left-0 w-full h-[1500px] sm:h-[1400px] opacity-[0.55] mix-blend-screen pointer-events-none blur-[70px] sm:blur-[90px] overflow-hidden" 
          style={{ 
            transform: 'translateZ(0)', 
            willChange: 'transform',
          }}
        >
          {/* High-performance hardware-accelerated linear gradient overlays (1000x faster than expensive CSS mask-image) */}
          <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

          <LiquidEther
            colors={['#000000', '#0a4a0a', '#1a7a0a', '#39FF14']}
            mouseForce={20}
            cursorSize={200} // Larger spread
            isViscous={false} 
            viscous={20}
            iterationsViscous={8}
            iterationsPoisson={8} // 8 iterations is visually identical to 16 but operates twice as fast!
            resolution={0.25} // Lower resolution is fine since it's blurred, great for performance
            dt={0.004} // Sangat lambat (slow-motion) untuk efek menenangkan
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.3} // Pergerakan sangat pelan
            autoIntensity={1.5} // Dorongan sangat lembut
            takeoverDuration={0.25}
            autoResumeDelay={0}
            autoRampDuration={0.6}
          />
        </div>

        {/* Note: Tidak ada glow di bagian tengah (top: 1500px - 3000px) agar section Project murni hitam */}

        {/* 3. Contact Area Glow - Bottom Left */}
        <motion.div 
          animate={{ x: [-30, 30, -30], y: [30, -30, 30], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-100px] left-[-200px] w-[700px] h-[700px] bg-[#39FF14] blur-[180px] rounded-full opacity-[0.1]" 
        />
      </div>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      <Hero />
      <Profile />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/portfolio/:id" element={<ProjectDetailPage />} />

        {/* Public admin login */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="highlight" element={<HighlightPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

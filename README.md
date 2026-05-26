<div align="center">

# ✦ ADITYA TRI — Portfolio ✦

### *Visual-Driven Graphic Designer & Creative Professional*

<br />

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0D1117)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0D1117)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=0D1117)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white&labelColor=0D1117)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0D1117)

<br />

*A high-end, dark-mode portfolio website featuring neon-green aesthetics, glassmorphism UI, cinematic WebGL backgrounds, and a full-featured admin dashboard — built with React, TypeScript & Supabase.*

<br />

---

</div>

## 🎨 Overview

This is a **premium personal portfolio** website for **Aditya Tri**, a Visual Communication Design professional. The site showcases graphic design work across multiple categories with stunning visual effects and smooth animations.

The project features a **fully dynamic CMS** powered by Supabase, allowing real-time content management through a secure admin dashboard — no code changes needed to update portfolio content.

<br />

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🖥️ Frontend
- **Cinematic WebGL Backgrounds** — LightRays, LiquidEther & Aurora shaders
- **Glassmorphism UI** — Frosted glass cards with neon-green (`#39FF14`) accents
- **Smooth Animations** — Powered by Framer Motion & GSAP
- **3D Tilt Cards** — Interactive hover effects with perspective transforms
- **Masonry Gallery** — CSS Columns layout preserving original aspect ratios
- **Fullscreen Lightbox** — Keyboard navigation with watermark protection
- **Responsive Design** — Fully optimized for mobile, tablet & desktop
- **Scroll Progress Bar** — Animated progress indicator

</td>
<td width="50%">

### ⚙️ Backend & Admin
- **Supabase Integration** — Real-time PostgreSQL database
- **Admin Dashboard** — Full CRUD for all content sections
- **Protected Routes** — Secure authentication system
- **Project Management** — Upload, categorize & publish projects
- **Profile Editor** — Dynamic education & skills management
- **Contact Management** — View & manage form submissions
- **Image Optimization** — Compression & watermarking system
- **Highlight Carousel** — Featured projects showcase

</td>
</tr>
</table>

<br />

## 🗂️ Project Structure

```
portofolio-adit/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Hero.tsx         # Landing hero section
│   │   ├── Profile.tsx      # About & skills section
│   │   ├── Projects.tsx     # Featured projects showcase
│   │   ├── Contact.tsx      # Contact form
│   │   ├── Footer.tsx       # Footer component
│   │   ├── LightRays.jsx    # WebGL light rays shader
│   │   ├── LiquidEther.jsx  # WebGL fluid simulation
│   │   ├── Aurora.jsx       # Aurora borealis effect
│   │   ├── TiltedCard.jsx   # 3D hover tilt card
│   │   ├── Masonry.jsx      # Masonry grid layout
│   │   └── admin/           # Admin panel components
│   ├── pages/               # Route pages
│   │   ├── PortfolioPage.tsx     # Full portfolio gallery
│   │   ├── ProjectDetailPage.tsx # Individual project view
│   │   └── admin/                # Admin dashboard pages
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities & services
│   │   ├── supabase.ts      # Supabase client
│   │   ├── cloudinary.ts    # Image CDN integration
│   │   ├── compressImage.ts # Client-side compression
│   │   └── watermark.ts     # Image watermarking
│   └── data/                # Static data & types
├── index.html
├── vite.config.ts
├── package.json
└── .env                     # Environment variables (not committed)
```

<br />

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- A **Supabase** project (for backend features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Mingkhemx/portofolio-adit.git
cd portofolio-adit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev
```

The app will be available at **`http://localhost:3000`**

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

<br />

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion · GSAP |
| **3D/WebGL** | OGL · Three.js · Custom Shaders |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **Deployment** | Vercel / Netlify |

<br />

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type checking |

<br />

## 🎯 Portfolio Categories

- **Social Media** — Instagram posts, stories & social media campaigns
- **Design Printing** — Brochures, flyers, banners & print materials
- **Photography** — Professional photography portfolio
- **Video / Motion Graphic** — Video editing & motion design projects

<br />

---

<div align="center">

### Made with 💚 by Migwara Dev

*Visual Communication Design · Graphic Designer · Creative Professional*

<br />

![GitHub](https://img.shields.io/badge/GitHub-Mingkhemx-181717?style=flat-square&logo=github)

</div>

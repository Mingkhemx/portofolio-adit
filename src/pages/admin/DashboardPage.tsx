import { useEffect, useState } from 'react';
import { Eye, Image, Users, MoreVertical, TrendingUp, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  published: boolean;
}

interface SiteStats {
  total_views: number;
  profile_visitors: number;
  engagement_rate: number;
}

interface ActivityLog {
  id: string;
  action: string;
  icon: string;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [projectsRes, statsRes, activityRes] = await Promise.all([
      supabase.from('projects').select('id, title, category, image_url, published').order('sort_order').limit(5),
      supabase.from('site_stats').select('total_views, profile_visitors, engagement_rate').single(),
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(5),
    ]);
    if (projectsRes.data) setProjects(projectsRes.data);
    if (statsRes.data) setStats(statsRes.data);
    if (activityRes.data) setActivity(activityRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const statCards = [
    {
      label: 'Total Views',
      value: stats ? (stats.total_views >= 1000 ? `${(stats.total_views / 1000).toFixed(1)}K` : String(stats.total_views)) : '—',
      icon: <Eye size={22} className="text-primary" />,
      trend: 'up',
    },
    {
      label: 'Portfolio Items',
      value: loading ? '—' : String(projects.length),
      icon: <Image size={22} className="text-primary" />,
      trend: 'up',
    },
    {
      label: 'Profile Visitors',
      value: stats ? (stats.profile_visitors >= 1000 ? `${(stats.profile_visitors / 1000).toFixed(1)}K` : String(stats.profile_visitors)) : '—',
      icon: <Users size={22} className="text-primary" />,
      trend: 'up',
    },
    {
      label: 'Engagement Rate',
      value: stats ? `${stats.engagement_rate}%` : '—',
      icon: <Activity size={22} className="text-primary" />,
      trend: stats && stats.engagement_rate > 0 ? 'up' : 'neutral',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 mt-2">Welcome back! Track your portfolio performance and visitors here.</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-primary/30 text-sm font-medium transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-start justify-between relative z-10">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black text-white tracking-tight">
                {loading ? <span className="animate-pulse text-gray-600">···</span> : stat.value}
              </p>
              <p className="text-gray-500 text-sm mt-1 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Visitor Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Traffic across your portfolio this week</p>
            </div>
            <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center h-[200px] text-gray-600 text-sm">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
              <p>Connect an analytics service</p>
              <p className="text-xs mt-1 text-gray-700">e.g. Cloudflare Analytics, Umami, or Plausible</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={20} className="text-primary" />
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          </div>
          <div className="space-y-6">
            {loading ? (
              <p className="text-gray-600 text-sm animate-pulse">Loading...</p>
            ) : activity.length === 0 ? (
              <p className="text-gray-600 text-sm">No activity yet.</p>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight mb-1">{a.action}</p>
                    <p className="text-xs text-gray-500">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Project Performance</h2>
            <p className="text-sm text-gray-500 mt-1">Latest projects in your portfolio</p>
          </div>
          <a href="/admin/projects" className="text-primary text-sm font-semibold hover:underline">Manage All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5 bg-black/20">
                <th className="px-8 py-4">Project Name</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-8 text-gray-600 text-sm animate-pulse">Loading projects...</td></tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                        <Image size={28} className="text-gray-700" />
                      </div>
                      <p className="text-white font-bold text-base mb-1">No projects yet</p>
                      <p className="text-gray-600 text-sm mb-6 max-w-[260px]">
                        Start building your portfolio by adding your first project.
                      </p>
                      <a
                        href="/admin/projects"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black text-sm font-bold rounded-xl hover:bg-[#32e612] active:scale-95 transition-all"
                      >
                        + Add First Project
                      </a>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/30 transition-colors bg-white/5">
                          {item.image_url
                            ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No img</div>}
                        </div>
                        <span className="text-white text-sm font-bold">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-400 text-sm font-medium">{item.category}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md tracking-wider ${item.published ? 'text-primary bg-primary/10' : 'text-gray-400 bg-white/5'}`}>
                        {item.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <a href="/admin/projects" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ml-auto text-gray-400 hover:text-white hover:border-primary/50 transition-colors">
                        <MoreVertical size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

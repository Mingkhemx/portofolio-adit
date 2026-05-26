import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Ambil session yang sudah ada (misal refresh browser)
    let isResolved = false;
    const fallbackTimer = setTimeout(() => {
      if (!isResolved) {
        console.warn('Supabase getSession timeout. Memaksa loading selesai.');
        setLoading(false);
      }
    }, 2000);

    supabase.auth.getSession().then(({ data }) => {
      isResolved = true;
      clearTimeout(fallbackTimer);
      setSession(data?.session || null);
      setLoading(false);
    }).catch((err) => {
      isResolved = true;
      clearTimeout(fallbackTimer);
      console.error('Gagal memuat session:', err);
      setLoading(false);
    });

    // Dengarkan perubahan auth state
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    if (!supabase) {
      return { ok: false, error: 'Database belum dikonfigurasi.' };
    }

    // 1. Cari email berdasarkan username dari tabel Supabase
    const { data, error: lookupError } = await supabase
      .from('admin_accounts')
      .select('email')
      .ilike('username', username)
      .single();

    console.log('[login] lookup result:', data, lookupError);

    if (lookupError || !data) {
      return { ok: false, error: 'Username atau password salah.' };
    }

    // 2. Login ke Supabase Auth pakai email yang ditemukan
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password,
    });

    console.log('[login] auth error:', error);

    if (error) {
      return { ok: false, error: 'Username atau password salah.' };
    }
    return { ok: true };
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  if (loading) return null; // Tunggu session dicek sebelum render

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

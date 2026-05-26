import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Backend features will not work.');
}

const createMockProxy = (): any => {
  const p = Promise.resolve({ data: null, error: new Error('Supabase not configured') });
  return new Proxy(() => { }, {
    get: (target, prop) => {
      if (prop === 'then') return p.then.bind(p);
      if (prop === 'catch') return p.catch.bind(p);
      if (prop === 'finally') return p.finally.bind(p);
      return createMockProxy();
    },
    apply: () => createMockProxy(),
  });
};

const mockSupabase = createMockProxy();

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (mockSupabase as any);


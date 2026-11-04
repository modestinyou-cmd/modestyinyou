import {afterEach,describe,expect,it,vi} from 'vitest';
import {getSupabasePublishableKey,getSupabaseUrl} from './supabase-config';

afterEach(()=>vi.unstubAllEnvs());

describe('Supabase public configuration',()=>{
  it('uses the publishable key and project URL',()=>{
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://project.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','sb_publishable_test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','legacy_anon_test');

    expect(getSupabaseUrl()).toBe('https://project.supabase.co');
    expect(getSupabasePublishableKey()).toBe('sb_publishable_test');
  });

  it('supports the legacy anon key when no publishable key is configured',()=>{
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','legacy_anon_test');

    expect(getSupabasePublishableKey()).toBe('legacy_anon_test');
  });

  it('returns null when public configuration is missing',()=>{
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','');

    expect(getSupabaseUrl()).toBeNull();
    expect(getSupabasePublishableKey()).toBeNull();
  });
});

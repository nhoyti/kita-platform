import { isValidSupabaseUrl } from './supabase-config';

describe('isValidSupabaseUrl', () => {
  it('accepts HTTP and HTTPS URLs', () => {
    expect(isValidSupabaseUrl('https://project.supabase.co')).toBe(true);
    expect(isValidSupabaseUrl('http://127.0.0.1:54321')).toBe(true);
  });

  it('rejects malformed and unsupported URLs', () => {
    expect(isValidSupabaseUrl('')).toBe(false);
    expect(isValidSupabaseUrl('project.supabase.co')).toBe(false);
    expect(isValidSupabaseUrl('ftp://project.supabase.co')).toBe(false);
  });
});

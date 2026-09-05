export interface SupabaseConfig {
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
}

export function isValidSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

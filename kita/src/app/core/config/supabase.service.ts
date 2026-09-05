import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';
import { isValidSupabaseUrl, SupabaseConfig } from './supabase-config';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient | null = this.createClient(environment);

  readonly configurationError: string | null = this.client
    ? null
    : this.getConfigurationError(environment);

  get isConfigured(): boolean {
    return this.client !== null;
  }

  private createClient(config: SupabaseConfig): SupabaseClient | null {
    if (this.getConfigurationError(config)) {
      return null;
    }

    return createClient(config.supabaseUrl, config.supabasePublishableKey);
  }

  private getConfigurationError(config: SupabaseConfig): string | null {
    if (!config.supabaseUrl || !config.supabasePublishableKey) {
      return 'Supabase public configuration is missing.';
    }

    if (!isValidSupabaseUrl(config.supabaseUrl)) {
      return 'Supabase URL must use HTTP or HTTPS.';
    }

    return null;
  }
}

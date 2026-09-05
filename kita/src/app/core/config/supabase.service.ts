import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient | null = this.createClient();

  get isConfigured(): boolean {
    return this.client !== null;
  }

  private createClient(): SupabaseClient | null {
    const { supabaseUrl, supabasePublishableKey } = environment;

    if (!supabaseUrl || !supabasePublishableKey) {
      return null;
    }

    return createClient(supabaseUrl, supabasePublishableKey);
  }
}

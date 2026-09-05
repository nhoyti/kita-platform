import { TestBed } from '@angular/core/testing';

import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  it('does not create a browser client when public configuration is missing', () => {
    const service = TestBed.inject(SupabaseService);

    expect(service.client).toBeNull();
    expect(service.isConfigured).toBe(false);
    expect(service.configurationError).toBe('Supabase public configuration is missing.');
  });
});

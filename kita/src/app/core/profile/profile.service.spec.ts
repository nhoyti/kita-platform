import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ProfileService } from './profile.service';
import { ProfileServiceError } from './profile.types';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileService);
  });

  it('returns no profile when there is no authenticated user', async () => {
    await expect(service.loadCurrentProfile()).resolves.toBeNull();
    expect(service.profile()).toBeNull();
  });

  it('rejects profile updates when there is no authenticated user', async () => {
    await expect(service.updateCurrentProfile({ display_name: 'New name' })).rejects.toMatchObject({
      name: 'ProfileServiceError',
      message: 'You must be signed in to update your profile.',
      operation: 'update profile',
    } satisfies Partial<ProfileServiceError>);
  });
});

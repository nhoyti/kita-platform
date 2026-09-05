import { TestBed } from '@angular/core/testing';

import { ErrorStateService } from './error-state.service';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  it('stores a safe generic message for unhandled errors', () => {
    TestBed.configureTestingModule({ providers: [GlobalErrorHandler] });
    const error = new Error('private implementation detail');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const handler = TestBed.inject(GlobalErrorHandler);
    const errorState = TestBed.inject(ErrorStateService);

    handler.handleError(error);

    expect(errorState.message()).toBe('Something went wrong. Please try again.');
    expect(errorState.message()).not.toContain(error.message);
    expect(consoleError).toHaveBeenCalledWith('Unhandled application error', error);
    consoleError.mockRestore();
  });
});

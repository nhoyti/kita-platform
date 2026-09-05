import { ErrorHandler, Injectable, inject } from '@angular/core';

import { ErrorStateService } from './error-state.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly errorState = inject(ErrorStateService);

  handleError(error: unknown): void {
    console.error('Unhandled application error', error);
    this.errorState.show();
  }
}

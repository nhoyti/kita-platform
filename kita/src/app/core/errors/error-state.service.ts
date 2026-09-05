import { Injectable, signal } from '@angular/core';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

@Injectable({ providedIn: 'root' })
export class ErrorStateService {
  readonly message = signal<string | null>(null);

  show(message = DEFAULT_ERROR_MESSAGE): void {
    this.message.set(message);
  }

  clear(): void {
    this.message.set(null);
  }
}

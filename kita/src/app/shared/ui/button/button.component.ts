import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [attr.aria-label]="ariaLabel() || null"
      [attr.disabled]="disabled() || loading() ? '' : null"
      [class]="buttonClasses()"
      [type]="type()"
    >
      @if (loading()) {
        <span
          class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        ></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'quiet'>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly ariaLabel = input('');

  protected buttonClasses(): string {
    const base =
      'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    const variants = {
      primary: 'bg-emerald-900 text-white hover:bg-emerald-800 focus-visible:outline-emerald-700',
      secondary:
        'border border-emerald-900/20 bg-white text-emerald-950 hover:bg-emerald-50 focus-visible:outline-emerald-700',
      quiet: 'text-emerald-900 hover:bg-emerald-900/5 focus-visible:outline-emerald-700',
    };

    return `${base} ${variants[this.variant()]}`;
  }
}

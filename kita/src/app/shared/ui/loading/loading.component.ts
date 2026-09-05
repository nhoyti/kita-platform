import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center gap-3 text-sm text-emerald-950/70"
      role="status"
      [attr.aria-label]="label()"
    >
      <span
        class="size-5 animate-spin rounded-full border-2 border-emerald-900/20 border-t-emerald-800"
        aria-hidden="true"
      ></span>
      <span>{{ label() }}</span>
    </div>
  `,
})
export class LoadingComponent {
  readonly label = input('Loading');
}

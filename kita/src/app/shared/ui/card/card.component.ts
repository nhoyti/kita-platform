import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(6,78,59,0.45)]"
      [class]="className()"
    >
      <ng-content />
    </section>
  `,
})
export class CardComponent {
  readonly className = input('');
}

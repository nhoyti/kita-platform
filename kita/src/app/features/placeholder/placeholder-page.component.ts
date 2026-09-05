import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-3xl px-5 py-24 lg:px-8">
      <p class="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Coming next</p>
      <h1 class="mt-5 text-5xl font-semibold tracking-tight text-emerald-950">{{ title() }}</h1>
      <p class="mt-6 max-w-xl text-lg leading-8 text-emerald-950/65">
        This part of Kita is being prepared. The application foundation is ready for the next
        feature slice.
      </p>
      <a
        class="mt-8 inline-flex min-h-11 items-center rounded-full bg-emerald-900 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
        routerLink="/"
        >Back to discover</a
      >
    </section>
  `,
})
export class PlaceholderPageComponent {
  readonly title = input.required<string>();
}

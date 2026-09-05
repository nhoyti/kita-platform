import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-3xl px-5 py-24 lg:px-8">
      <p class="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">404</p>
      <h1 class="mt-5 text-5xl font-semibold tracking-tight text-emerald-950">Page not found</h1>
      <p class="mt-6 max-w-xl text-lg leading-8 text-emerald-950/65">
        That address does not lead anywhere in Kita yet.
      </p>
      <a
        class="mt-8 inline-flex min-h-11 items-center rounded-full bg-emerald-900 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
        routerLink="/"
      >
        Back to discover
      </a>
    </section>
  `,
})
export class NotFoundPageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ButtonComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative overflow-hidden border-b border-emerald-950/10">
      <div
        class="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-32"
      >
        <div class="relative z-10">
          <p class="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            A more human internet
          </p>
          <h1
            class="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-emerald-950 sm:text-7xl"
          >
            Make room for the people you came here to see.
          </h1>
          <p class="mt-7 max-w-xl text-lg leading-8 text-emerald-950/65">
            Kita is a calmer place for creators and their communities to build something worth
            returning to.
          </p>
          <div class="mt-9 flex flex-wrap items-center gap-3">
            <app-button routerLink="/get-started">Explore the space</app-button>
            <a
              class="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
              routerLink="/about"
              >Why Kita <span class="ml-2" aria-hidden="true">&rarr;</span></a
            >
          </div>
        </div>
        <div
          class="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-emerald-900 p-7 text-white shadow-[0_30px_100px_-45px_rgba(6,78,59,0.8)] sm:min-h-[440px]"
        >
          <div
            class="absolute -right-20 -top-24 size-72 rounded-full border-[32px] border-amber-300/20"
          ></div>
          <div class="absolute -bottom-28 -left-16 size-64 rounded-full bg-emerald-700/60"></div>
          <div class="relative flex h-full flex-col justify-between">
            <span class="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200"
              >The good stuff</span
            >
            <div>
              <p class="max-w-sm text-3xl font-semibold leading-tight sm:text-4xl">
                A place for your people, your pace, your work.
              </p>
              <div class="mt-8 flex items-center gap-3 text-sm text-emerald-100/75">
                <span
                  class="grid size-9 place-items-center rounded-full bg-amber-300 font-semibold text-emerald-950"
                  >K</span
                >
                Built around belonging
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:grid-cols-3 lg:px-8">
      <app-card>
        <p class="text-sm font-semibold uppercase tracking-[0.14em] text-amber-700">01</p>
        <h2 class="mt-8 text-xl font-semibold text-emerald-950">Find your signal</h2>
        <p class="mt-3 leading-7 text-emerald-950/60">
          Discover thoughtful work from people who care about making it.
        </p>
      </app-card>
      <app-card>
        <p class="text-sm font-semibold uppercase tracking-[0.14em] text-amber-700">02</p>
        <h2 class="mt-8 text-xl font-semibold text-emerald-950">Stay close</h2>
        <p class="mt-3 leading-7 text-emerald-950/60">
          Keep the conversation where it feels personal, useful, and real.
        </p>
      </app-card>
      <app-card>
        <p class="text-sm font-semibold uppercase tracking-[0.14em] text-amber-700">03</p>
        <h2 class="mt-8 text-xl font-semibold text-emerald-950">Make it yours</h2>
        <p class="mt-3 leading-7 text-emerald-950/60">
          Build a space that reflects the community you want to grow.
        </p>
      </app-card>
    </section>
  `,
})
export class HomePageComponent {}

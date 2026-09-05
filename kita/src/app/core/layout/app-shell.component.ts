import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f5f7f4]">
      <a
        class="absolute left-4 top-4 z-50 -translate-y-20 rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>
      <header class="relative border-b border-emerald-950/10 bg-[#f5f7f4]/95 backdrop-blur">
        <nav
          class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"
          aria-label="Main navigation"
        >
          <a
            class="text-xl font-semibold tracking-tight text-emerald-950"
            routerLink="/"
            (click)="closeMenu()"
            >kita<span class="text-amber-600">.</span></a
          >
          <button
            class="grid size-11 place-items-center rounded-full border border-emerald-950/10 text-emerald-950 lg:hidden"
            type="button"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="main-menu"
            aria-label="Toggle navigation"
            (click)="menuOpen.update((open) => !open)"
          >
            <span class="text-xl" aria-hidden="true">{{ menuOpen() ? '&times;' : '&#9776;' }}</span>
          </button>
          <div
            id="main-menu"
            class="absolute inset-x-0 top-full z-20 border-b border-emerald-950/10 bg-[#f5f7f4] px-5 py-4 lg:static lg:flex lg:items-center lg:gap-8 lg:border-0 lg:bg-transparent lg:p-0"
            [class.hidden]="!menuOpen()"
          >
            <a
              class="block py-3 text-sm font-semibold text-emerald-950/70 hover:text-emerald-950 lg:py-2"
              routerLink="/"
              routerLinkActive="text-emerald-950"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeMenu()"
              >Discover</a
            >
            <a
              class="block py-3 text-sm font-semibold text-emerald-950/70 hover:text-emerald-950 lg:py-2"
              routerLink="/about"
              routerLinkActive="text-emerald-950"
              (click)="closeMenu()"
              >About</a
            >
            <a
              class="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-900 px-5 text-sm font-semibold text-white hover:bg-emerald-800 lg:mt-0"
              routerLink="/get-started"
              (click)="closeMenu()"
              >Get started</a
            >
          </div>
        </nav>
      </header>
      <main id="main-content" tabindex="-1">
        <ng-content />
      </main>
      <footer class="border-t border-emerald-950/10">
        <div class="mx-auto max-w-7xl px-5 py-8 text-sm text-emerald-950/55 lg:px-8">
          Kita is taking shape. More soon.
        </div>
      </footer>
    </div>
  `,
})
export class AppShellComponent {
  protected readonly menuOpen = signal(false);

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

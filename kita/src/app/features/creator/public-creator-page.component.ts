import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { CreatorService } from '../../core/creator/creator.service';
import { CreatorPlan, CreatorPost, CreatorProfile } from '../../core/creator/creator.types';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { LoadingComponent } from '../../shared/ui/loading/loading.component';

@Component({
  selector: 'app-public-creator-page',
  imports: [DatePipe, RouterLink, ButtonComponent, CardComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-loading label="Loading creator profile" />
    } @else if (errorMessage(); as message) {
      <section class="mx-auto max-w-3xl px-5 py-24 lg:px-8">
        <p class="text-lg text-red-700" role="alert">{{ message }}</p>
        <a class="mt-6 inline-block font-semibold text-emerald-900 underline" routerLink="/"
          >Back to discover</a
        >
      </section>
    } @else if (profile(); as creator) {
      <section class="border-b border-emerald-950/10 bg-emerald-950 text-white">
        <div class="mx-auto max-w-7xl px-5 pb-10 pt-8 lg:px-8 lg:pt-12">
          <div
            class="min-h-48 rounded-[2rem] bg-cover bg-center bg-emerald-800/60 p-6"
            [style.background-image]="coverStyle(creator)"
          >
            <span
              class="inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-emerald-950"
              >{{ creator.category || 'Creator' }}</span
            >
          </div>
          <div class="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex items-end gap-4">
              <div
                class="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-emerald-950 bg-amber-300 text-3xl font-semibold text-emerald-950"
              >
                @if (creator.profile_image_url) {
                  <img
                    class="size-full object-cover"
                    [src]="creator.profile_image_url"
                    [alt]="creator.display_name"
                  />
                } @else {
                  {{ creator.display_name.charAt(0) }}
                }
              </div>
              <div class="pb-1">
                <h1 class="text-3xl font-semibold tracking-tight sm:text-5xl">
                  {{ creator.display_name }}
                </h1>
                <p class="mt-1 text-emerald-100/70">@{{ creator.username }}</p>
              </div>
            </div>
            <app-button variant="secondary" [disabled]="followLoading()" (click)="toggleFollow()">
              {{ following() ? 'Following' : 'Follow' }}
            </app-button>
          </div>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-emerald-100/75">
            {{ creator.bio || 'This creator has not added a bio yet.' }}
          </p>
          <p class="mt-4 text-sm text-emerald-100/65">{{ creator.subscriber_count }} subscribers</p>
        </div>
      </section>
      <main class="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <section>
          <p class="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Support the work
          </p>
          <h2 class="mt-3 text-3xl font-semibold text-emerald-950">Subscription plans</h2>
          <div class="mt-6 grid gap-4">
            @for (plan of plans(); track plan.id) {
              <app-card className="border border-emerald-950/10 bg-white p-5">
                <div class="flex items-start justify-between gap-4">
                  <h3 class="text-xl font-semibold text-emerald-950">{{ plan.name }}</h3>
                  <span class="font-semibold text-emerald-900"
                    >PHP {{ plan.monthly_price }}/mo</span
                  >
                </div>
                <p class="mt-3 text-sm leading-6 text-emerald-950/60">
                  {{ plan.description || 'A closer way to support this creator.' }}
                </p>
                <p
                  class="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-950/40"
                >
                  Payments coming later
                </p>
              </app-card>
            } @empty {
              <p class="text-emerald-950/60">No plans are available yet.</p>
            }
          </div>
        </section>
        <section>
          <p class="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            From the studio
          </p>
          <h2 class="mt-3 text-3xl font-semibold text-emerald-950">Posts</h2>
          <div class="mt-6 grid gap-4">
            @for (post of posts(); track post.id) {
              <app-card className="border border-emerald-950/10 bg-white p-6">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-950/40">
                  {{ post.published_at | date: 'mediumDate' }}
                </p>
                <h3 class="mt-3 text-xl font-semibold text-emerald-950">
                  {{ post.title || 'Untitled post' }}
                </h3>
                <p class="mt-3 whitespace-pre-line leading-7 text-emerald-950/70">
                  {{ post.body }}
                </p>
              </app-card>
            } @empty {
              <p class="text-emerald-950/60">No public posts yet.</p>
            }
          </div>
        </section>
      </main>
    }
  `,
})
export class PublicCreatorPageComponent {
  protected readonly auth = inject(AuthService);
  private readonly creatorService = inject(CreatorService);
  private readonly route = inject(ActivatedRoute);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly profile = signal<CreatorProfile | null>(null);
  protected readonly plans = signal<CreatorPlan[]>([]);
  protected readonly posts = signal<CreatorPost[]>([]);
  protected readonly following = signal(false);
  protected readonly followLoading = signal(false);

  constructor() {
    void this.load();
  }

  protected coverStyle(profile: CreatorProfile): string {
    return profile.cover_image_url ? `url("${profile.cover_image_url}")` : '';
  }

  protected async toggleFollow(): Promise<void> {
    const creator = this.profile();
    if (!creator || !this.auth.isAuthenticated()) {
      return;
    }
    this.followLoading.set(true);
    try {
      const nextFollowing = !this.following();
      await this.creatorService.setFollowing(creator.id, nextFollowing);
      this.following.set(nextFollowing);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Follow status could not be updated.',
      );
    } finally {
      this.followLoading.set(false);
    }
  }

  private async load(): Promise<void> {
    try {
      const username = this.route.snapshot.paramMap.get('username');
      if (!username) {
        throw new Error('Creator profile not found.');
      }
      const profile = await this.creatorService.getPublicProfile(username);
      this.profile.set(profile);
      const [plans, posts, following] = await Promise.all([
        this.creatorService.getPlans(profile.id),
        this.creatorService.getPublicPosts(profile.id),
        this.creatorService.isFollowing(profile.id),
      ]);
      this.plans.set(plans);
      this.posts.set(posts);
      this.following.set(following);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Creator profile could not be loaded.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}

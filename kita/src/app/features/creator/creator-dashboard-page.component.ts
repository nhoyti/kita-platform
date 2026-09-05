import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CreatorService } from '../../core/creator/creator.service';
import { CreatorPlan, CreatorProfile, CreatorStats } from '../../core/creator/creator.types';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { LoadingComponent } from '../../shared/ui/loading/loading.component';
import { ContentStudioComponent } from './content-studio.component';

@Component({
  selector: 'app-creator-dashboard-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    CardComponent,
    InputComponent,
    LoadingComponent,
    ContentStudioComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div
        class="flex flex-col justify-between gap-5 border-b border-emerald-950/10 pb-8 sm:flex-row sm:items-end"
      >
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Creator studio
          </p>
          <h1 class="mt-3 text-4xl font-semibold tracking-tight text-emerald-950">
            Shape your space.
          </h1>
        </div>
        @if (profile(); as creator) {
          <a
            class="font-semibold text-emerald-900 underline"
            [routerLink]="['/creators', creator.username]"
            >View public page</a
          >
        }
      </div>
      @if (loading()) {
        <app-loading label="Loading creator studio" />
      } @else {
        <div class="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <app-card className="border border-emerald-950/10 bg-white p-6 sm:p-8">
            <h2 class="text-2xl font-semibold text-emerald-950">Profile management</h2>
            <form
              class="mt-6 grid gap-5"
              [formGroup]="profileForm"
              (ngSubmit)="saveProfile()"
              novalidate
            >
              <div class="grid gap-5 sm:grid-cols-2">
                <app-input
                  id="username"
                  label="Username"
                  formControlName="username"
                  [required]="true"
                /><app-input
                  id="display-name"
                  label="Display name"
                  formControlName="displayName"
                  [required]="true"
                />
              </div>
              <div class="grid gap-5 sm:grid-cols-2">
                <app-input id="category" label="Category" formControlName="category" /><app-input
                  id="profile-image"
                  label="Profile image URL"
                  formControlName="profileImageUrl"
                />
              </div>
              <app-input id="cover-image" label="Cover image URL" formControlName="coverImageUrl" />
              <label class="grid gap-2 text-sm font-semibold text-emerald-950" for="bio"
                >Bio<textarea
                  id="bio"
                  class="min-h-28 rounded-xl border border-emerald-900/15 bg-white p-4 font-normal outline-none focus:ring-4 focus:ring-emerald-900/10"
                  formControlName="bio"
                ></textarea>
              </label>
              <div class="grid gap-5 sm:grid-cols-2">
                <app-input id="website" label="Website" formControlName="website" /><app-input
                  id="instagram"
                  label="Instagram"
                  formControlName="instagram"
                /><app-input id="tiktok" label="TikTok" formControlName="tiktok" /><app-input
                  id="youtube"
                  label="YouTube"
                  formControlName="youtube"
                />
              </div>
              @if (message(); as text) {
                <p class="text-sm text-emerald-800" role="status">{{ text }}</p>
              }
              @if (errorMessage(); as text) {
                <p class="text-sm text-red-700" role="alert">{{ text }}</p>
              }
              <app-button type="submit" [loading]="saving()">Save profile</app-button>
            </form>
          </app-card>
          <div class="grid content-start gap-8">
            <app-card className="border border-emerald-950/10 bg-emerald-950 p-6 text-white"
              ><h2 class="text-xl font-semibold">Basic statistics</h2>
              <div class="mt-6 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p class="text-2xl font-semibold">{{ stats()?.subscriber_count || 0 }}</p>
                  <p class="mt-1 text-xs text-emerald-100/60">Subscribers</p>
                </div>
                <div>
                  <p class="text-2xl font-semibold">{{ stats()?.follower_count || 0 }}</p>
                  <p class="mt-1 text-xs text-emerald-100/60">Followers</p>
                </div>
                <div>
                  <p class="text-2xl font-semibold">{{ stats()?.post_count || 0 }}</p>
                  <p class="mt-1 text-xs text-emerald-100/60">Posts</p>
                </div>
              </div></app-card
            >
            <app-card className="border border-emerald-950/10 bg-white p-6"
              ><h2 class="text-xl font-semibold text-emerald-950">Subscription plans</h2>
              <p class="mt-2 text-sm leading-6 text-emerald-950/60">
                Plans are visible publicly. Payments will be connected in a later slice.
              </p>
              <form class="mt-5 grid gap-4" [formGroup]="planForm" (ngSubmit)="savePlan()">
                <app-input
                  id="plan-name"
                  label="Plan name"
                  formControlName="name"
                  [required]="true"
                /><app-input
                  id="plan-price"
                  label="Monthly price (PHP)"
                  type="number"
                  formControlName="monthlyPrice"
                  [required]="true"
                /><label
                  class="grid gap-2 text-sm font-semibold text-emerald-950"
                  for="plan-description"
                  >Description<textarea
                    id="plan-description"
                    class="min-h-20 rounded-xl border border-emerald-950/15 p-3 font-normal"
                    formControlName="description"
                  ></textarea></label
                ><app-button type="submit" variant="secondary" [loading]="planSaving()"
                  >Add plan</app-button
                >
              </form>
              <div class="mt-6 grid gap-3">
                @for (plan of plans(); track plan.id) {
                  <div class="border-t border-emerald-950/10 pt-3">
                    <div class="flex justify-between gap-3 text-sm font-semibold text-emerald-950">
                      <span>{{ plan.name }}</span
                      ><span>PHP {{ plan.monthly_price }}</span>
                    </div>
                    <p class="mt-1 text-sm text-emerald-950/55">{{ plan.description }}</p>
                  </div>
                } @empty {
                  <p class="text-sm text-emerald-950/55">No plans yet.</p>
                }
              </div></app-card
            >
          </div>
        </div>
      }
      @if (!loading() && profile()) {
        <app-content-studio />
      }
    </section>
  `,
})
export class CreatorDashboardPageComponent {
  private readonly creatorService = inject(CreatorService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly planSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly message = signal('');
  protected readonly profile = signal<CreatorProfile | null>(null);
  protected readonly plans = signal<CreatorPlan[]>([]);
  protected readonly stats = signal<CreatorStats | null>(null);
  protected readonly profileForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]{3,30}$/)]],
    displayName: ['', Validators.required],
    bio: [''],
    profileImageUrl: [''],
    coverImageUrl: [''],
    category: [''],
    website: [''],
    instagram: [''],
    tiktok: [''],
    youtube: [''],
  });
  protected readonly planForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    monthlyPrice: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    void this.load();
  }

  protected async saveProfile(): Promise<void> {
    this.errorMessage.set('');
    this.message.set('');
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const values = this.profileForm.getRawValue();
      const profile = await this.creatorService.saveCurrentProfile({
        username: values.username,
        display_name: values.displayName,
        bio: values.bio,
        profile_image_url: values.profileImageUrl,
        cover_image_url: values.coverImageUrl,
        category: values.category,
        social_links: {
          website: values.website,
          instagram: values.instagram,
          tiktok: values.tiktok,
          youtube: values.youtube,
        },
      });
      this.profile.set(profile);
      this.message.set('Profile saved.');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Profile could not be saved.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async savePlan(): Promise<void> {
    this.errorMessage.set('');
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    this.planSaving.set(true);
    try {
      const values = this.planForm.getRawValue();
      const plan = await this.creatorService.saveCurrentPlan({
        name: values.name,
        description: values.description,
        monthly_price: values.monthlyPrice,
      });
      this.plans.update((plans) => [...plans, plan]);
      this.planForm.reset({ name: '', description: '', monthlyPrice: 0 });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Plan could not be saved.');
    } finally {
      this.planSaving.set(false);
    }
  }

  private async load(): Promise<void> {
    try {
      const profile = await this.creatorService.getCurrentProfile();
      this.profile.set(profile);
      if (!profile) {
        this.errorMessage.set('Creator onboarding is available only to creator accounts.');
        return;
      }
      const [plans, stats] = await Promise.all([
        this.creatorService.getCurrentPlans(),
        this.creatorService.getCurrentStats(),
      ]);
      this.plans.set(plans);
      this.stats.set(stats);
      this.profileForm.patchValue({
        username: profile.username,
        displayName: profile.display_name,
        bio: profile.bio ?? '',
        profileImageUrl: profile.profile_image_url ?? '',
        coverImageUrl: profile.cover_image_url ?? '',
        category: profile.category ?? '',
        website: profile.social_links.website ?? '',
        instagram: profile.social_links.instagram ?? '',
        tiktok: profile.social_links.tiktok ?? '',
        youtube: profile.social_links.youtube ?? '',
      });
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Creator studio could not be loaded.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { AuthServiceError, RegistrationType } from '../../core/auth/auth.types';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[0.8fr_1fr] lg:px-8 lg:py-24"
    >
      <div class="max-w-md self-center">
        <a class="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700" routerLink="/">
          kita.
        </a>
        <h1
          class="mt-8 text-4xl font-semibold leading-tight tracking-tight text-emerald-950 sm:text-5xl"
        >
          {{ heading() }}
        </h1>
        <p class="mt-5 text-lg leading-8 text-emerald-950/65">{{ description() }}</p>
      </div>

      <app-card class="w-full max-w-xl justify-self-end" className="p-6 sm:p-9">
        @if (successMessage(); as message) {
          <div class="grid gap-5" role="status">
            <p class="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              {{ message }}
            </p>
            @if (mode() === 'register' || mode() === 'forgot-password') {
              <a
                class="font-semibold text-emerald-900 underline underline-offset-4"
                routerLink="/auth/login"
              >
                Return to log in
              </a>
            }
          </div>
        } @else if (mode() === 'verify-email') {
          <div class="grid gap-6">
            <p class="text-base leading-7 text-emerald-950/70">
              Check your inbox for the verification link. You will need to verify your email before
              logging in.
            </p>
            <form
              class="grid gap-5"
              [formGroup]="form"
              (ngSubmit)="resendVerification()"
              novalidate
            >
              <label
                class="grid gap-2 text-sm font-semibold text-emerald-950"
                for="verification-email"
              >
                Email address
                <input
                  id="verification-email"
                  class="min-h-12 rounded-xl border border-emerald-900/15 bg-white px-4 text-base font-normal text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  required
                />
              </label>
              <app-button type="submit" [loading]="submitting()"
                >Resend verification email</app-button
              >
            </form>
            <a
              class="text-center text-sm font-semibold text-emerald-900 underline underline-offset-4"
              routerLink="/auth/login"
            >
              Back to log in
            </a>
          </div>
        } @else {
          <form class="grid gap-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @if (mode() === 'register') {
              <label class="grid gap-2 text-sm font-semibold text-emerald-950" for="display-name">
                Display name
                <input
                  id="display-name"
                  class="min-h-12 rounded-xl border border-emerald-900/15 bg-white px-4 text-base font-normal text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  type="text"
                  formControlName="displayName"
                  autocomplete="name"
                  required
                />
              </label>
              <fieldset class="grid gap-3">
                <legend class="text-sm font-semibold text-emerald-950">I am joining as a</legend>
                <div class="grid gap-3 sm:grid-cols-2">
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-900/15 p-4 text-sm text-emerald-950"
                  >
                    <input type="radio" formControlName="registrationType" value="fan" />
                    Fan
                  </label>
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-900/15 p-4 text-sm text-emerald-950"
                  >
                    <input type="radio" formControlName="registrationType" value="creator" />
                    Creator
                  </label>
                </div>
              </fieldset>
            }
            @if (mode() !== 'reset-password') {
              <label class="grid gap-2 text-sm font-semibold text-emerald-950" for="email">
                Email address
                <input
                  id="email"
                  class="min-h-12 rounded-xl border border-emerald-900/15 bg-white px-4 text-base font-normal text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  required
                />
              </label>
            }
            @if (mode() === 'login' || mode() === 'register' || mode() === 'reset-password') {
              <label class="grid gap-2 text-sm font-semibold text-emerald-950" for="password">
                {{ mode() === 'reset-password' ? 'New password' : 'Password' }}
                <input
                  id="password"
                  class="min-h-12 rounded-xl border border-emerald-900/15 bg-white px-4 text-base font-normal text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  type="password"
                  formControlName="password"
                  autocomplete="new-password"
                  required
                />
              </label>
            }
            @if (mode() === 'register' || mode() === 'reset-password') {
              <label
                class="grid gap-2 text-sm font-semibold text-emerald-950"
                for="confirm-password"
              >
                Confirm password
                <input
                  id="confirm-password"
                  class="min-h-12 rounded-xl border border-emerald-900/15 bg-white px-4 text-base font-normal text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-900/10"
                  type="password"
                  formControlName="confirmPassword"
                  autocomplete="new-password"
                  required
                />
              </label>
            }
            @if (errorMessage(); as message) {
              <p class="text-sm leading-6 text-red-700" role="alert">{{ message }}</p>
            }
            <app-button type="submit" [loading]="submitting()">{{ actionLabel() }}</app-button>
            <div class="flex flex-wrap justify-between gap-3 text-sm">
              @if (mode() === 'login') {
                <a
                  class="font-semibold text-emerald-900 underline underline-offset-4"
                  routerLink="/auth/forgot-password"
                  >Forgot password?</a
                >
                <a
                  class="font-semibold text-emerald-900 underline underline-offset-4"
                  routerLink="/auth/register"
                  >Create an account</a
                >
              } @else if (mode() === 'register') {
                <span class="text-emerald-950/60">Already have an account?</span>
                <a
                  class="font-semibold text-emerald-900 underline underline-offset-4"
                  routerLink="/auth/login"
                  >Log in</a
                >
              } @else {
                <a
                  class="font-semibold text-emerald-900 underline underline-offset-4"
                  routerLink="/auth/login"
                  >Back to log in</a
                >
              }
            </div>
          </form>
        }
      </app-card>
    </section>
  `,
})
export class AuthPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly mode = signal<AuthMode>(
    (this.route.snapshot.data['mode'] as AuthMode) ?? 'login',
  );
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: [''],
    displayName: [''],
    registrationType: ['fan' as RegistrationType],
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.controls.email.setValue(email);
    }
  }

  protected heading(): string {
    return {
      login: 'Welcome back.',
      register: 'Find your people.',
      'forgot-password': 'A fresh start.',
      'reset-password': 'Choose a new password.',
      'verify-email': 'One small step.',
    }[this.mode()];
  }

  protected description(): string {
    return {
      login: 'Your corner of Kita is waiting for you.',
      register: 'Join a more human internet, whether you are here to share or to follow.',
      'forgot-password': 'Enter your email and we will send you a secure reset link.',
      'reset-password': 'Make it something memorable and unique to Kita.',
      'verify-email': 'Confirm your email so your account is ready when you are.',
    }[this.mode()];
  }

  protected actionLabel(): string {
    return {
      login: 'Log in',
      register: 'Create account',
      'forgot-password': 'Send reset link',
      'reset-password': 'Update password',
      'verify-email': 'Resend verification email',
    }[this.mode()];
  }

  protected async submit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      this.errorMessage.set(
        this.passwordsMatch() ? 'Please check the required fields.' : 'Passwords must match.',
      );
      return;
    }

    this.submitting.set(true);
    try {
      const values = this.form.getRawValue();
      switch (this.mode()) {
        case 'login':
          await this.auth.login(values.email, values.password);
          await this.router.navigateByUrl(this.safeReturnUrl());
          break;
        case 'register': {
          const result = await this.auth.register(
            values.email,
            values.password,
            values.displayName,
            values.registrationType,
          );
          this.successMessage.set(
            result.requiresEmailVerification
              ? 'Your account is ready. Check your inbox to verify your email.'
              : 'Your account is ready.',
          );
          if (result.session) {
            await this.router.navigateByUrl(this.safeReturnUrl());
          }
          break;
        }
        case 'forgot-password':
          await this.auth.requestPasswordReset(values.email);
          this.successMessage.set(
            'If an account exists for that email, a reset link is on its way.',
          );
          break;
        case 'reset-password':
          await this.auth.updatePassword(values.password);
          this.successMessage.set('Your password has been updated.');
          await this.router.navigateByUrl('/account');
          break;
      }
    } catch (error) {
      this.errorMessage.set(
        error instanceof AuthServiceError
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  protected async resendVerification(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.form.controls.email.invalid) {
      this.form.controls.email.markAsTouched();
      this.errorMessage.set('Enter a valid email address.');
      return;
    }

    this.submitting.set(true);
    try {
      await this.auth.resendEmailVerification(this.form.controls.email.value);
      this.successMessage.set('A new verification email is on its way.');
    } catch (error) {
      this.errorMessage.set(
        error instanceof AuthServiceError
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  private passwordsMatch(): boolean {
    const values = this.form.getRawValue();
    return (
      (this.mode() !== 'register' && this.mode() !== 'reset-password') ||
      values.password === values.confirmPassword
    );
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/account';
  }
}

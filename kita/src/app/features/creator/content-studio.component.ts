import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ContentService } from '../../core/content/content.service';
import { ContentPost, PostVisibility } from '../../core/content/content.types';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { LoadingComponent } from '../../shared/ui/loading/loading.component';

@Component({
  selector: 'app-content-studio',
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" aria-labelledby="content-heading">
      <app-card className="border border-emerald-950/10 bg-white p-6 sm:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Content</p>
            <h2 id="content-heading" class="mt-2 text-2xl font-semibold text-emerald-950">
              Make a post
            </h2>
          </div>
          @if (editingPost()) {
            <button
              type="button"
              class="text-sm font-semibold text-emerald-800 underline"
              (click)="resetForm()"
            >
              Cancel edit
            </button>
          }
        </div>
        <form class="mt-6 grid gap-4" [formGroup]="postForm" (ngSubmit)="savePost()" novalidate>
          <label class="grid gap-2 text-sm font-semibold text-emerald-950" for="post-title"
            >Title
            <input
              id="post-title"
              class="min-h-12 rounded-xl border border-emerald-900/15 px-4 font-normal outline-none focus:ring-4 focus:ring-emerald-900/10"
              formControlName="title"
              maxlength="160"
            />
          </label>
          <label class="grid gap-2 text-sm font-semibold text-emerald-950" for="post-body"
            >Post text
            <textarea
              id="post-body"
              class="min-h-36 rounded-xl border border-emerald-900/15 p-4 font-normal outline-none focus:ring-4 focus:ring-emerald-900/10"
              formControlName="body"
              maxlength="20000"
            ></textarea>
          </label>
          <label class="grid gap-2 text-sm font-semibold text-emerald-950" for="post-visibility"
            >Visibility
            <select
              id="post-visibility"
              class="min-h-12 rounded-xl border border-emerald-900/15 bg-white px-4 font-normal"
              formControlName="visibility"
            >
              @for (option of visibilityOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>
          <label class="grid gap-2 text-sm font-semibold text-emerald-950" for="post-media"
            >Image or video
            <input
              id="post-media"
              class="rounded-xl border border-dashed border-emerald-900/20 p-3 font-normal"
              type="file"
              accept="image/*,video/*"
              (change)="selectFile($event)"
            />
          </label>
          @if (selectedFile(); as file) {
            <p class="text-sm text-emerald-950/60">Ready to upload: {{ file.name }}</p>
          }
          @if (message(); as text) {
            <p class="text-sm text-emerald-800" role="status">{{ text }}</p>
          }
          @if (errorMessage(); as text) {
            <p class="text-sm text-red-700" role="alert">{{ text }}</p>
          }
          <div class="flex flex-wrap gap-3">
            <app-button type="submit" [loading]="saving()">{{
              editingPost() ? 'Save changes' : 'Save draft'
            }}</app-button>
            <app-button
              type="button"
              variant="secondary"
              [loading]="publishing()"
              (click)="publishPost()"
              >Publish</app-button
            >
          </div>
        </form>
      </app-card>
      <app-card className="border border-emerald-950/10 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-semibold text-emerald-950">Your posts</h2>
        @if (loading()) {
          <app-loading label="Loading posts" />
        } @else if (posts().length === 0) {
          <p class="mt-6 text-sm text-emerald-950/55">
            No posts yet. Your next idea can start here.
          </p>
        } @else {
          <div class="mt-6 grid gap-4">
            @for (post of posts(); track post.id) {
              <article class="border-t border-emerald-950/10 pt-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="font-semibold text-emerald-950">
                      {{ post.title || 'Untitled post' }}
                    </h3>
                    <p class="mt-1 text-xs uppercase tracking-wider text-emerald-950/50">
                      {{ post.status }} · {{ post.visibility }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="text-sm font-semibold text-emerald-800 underline"
                      (click)="editPost(post)"
                    >
                      Edit</button
                    ><button
                      type="button"
                      class="text-sm font-semibold text-red-700 underline"
                      (click)="deletePost(post)"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p class="mt-3 line-clamp-3 text-sm leading-6 text-emerald-950/70">
                  {{ post.body }}
                </p>
                @if (post.post_media.length) {
                  <p class="mt-2 text-xs text-emerald-950/50">
                    {{ post.post_media.length }} media file(s) attached
                  </p>
                }
              </article>
            }
          </div>
        }
      </app-card>
    </section>
  `,
})
export class ContentStudioComponent {
  private readonly contentService = inject(ContentService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly publishing = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly message = signal('');
  protected readonly posts = signal<ContentPost[]>([]);
  protected readonly editingPost = signal<ContentPost | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly visibilityOptions: ReadonlyArray<{ value: PostVisibility; label: string }> = [
    { value: 'public', label: 'Public' },
    { value: 'followers', label: 'Followers' },
    { value: 'subscribers', label: 'Subscribers' },
    { value: 'tier', label: 'Specific tier' },
    { value: 'paid', label: 'Paid access' },
  ];
  protected readonly postForm = this.formBuilder.nonNullable.group({
    title: [''],
    body: ['', [Validators.required, Validators.maxLength(20000)]],
    visibility: ['public' as PostVisibility],
  });

  constructor() {
    void this.loadPosts();
  }

  protected selectFile(event: Event): void {
    this.selectedFile.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  protected async savePost(): Promise<void> {
    await this.submit('draft');
  }
  protected async publishPost(): Promise<void> {
    await this.submit('published');
  }

  protected editPost(post: ContentPost): void {
    this.editingPost.set(post);
    this.selectedFile.set(null);
    this.postForm.setValue({
      title: post.title ?? '',
      body: post.body,
      visibility: post.visibility,
    });
    this.message.set('');
    this.errorMessage.set('');
  }

  protected resetForm(): void {
    this.editingPost.set(null);
    this.selectedFile.set(null);
    this.postForm.reset({ title: '', body: '', visibility: 'public' });
  }

  protected async deletePost(post: ContentPost): Promise<void> {
    this.errorMessage.set('');
    try {
      await this.contentService.deletePost(post);
      this.posts.update((posts) => posts.filter((item) => item.id !== post.id));
      this.message.set('Post deleted.');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Post could not be deleted.');
    }
  }

  private async submit(status: 'draft' | 'published'): Promise<void> {
    this.errorMessage.set('');
    this.message.set('');
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }
    status === 'published' ? this.publishing.set(true) : this.saving.set(true);
    try {
      const values = this.postForm.getRawValue();
      const post = await this.contentService.savePost(
        { title: values.title, body: values.body, visibility: values.visibility, status },
        this.editingPost()?.id,
      );
      if (this.selectedFile())
        await this.contentService.uploadMedia(post.id, this.selectedFile() as File);
      await this.loadPosts();
      this.resetForm();
      this.message.set(status === 'published' ? 'Post published.' : 'Draft saved.');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Post could not be saved.');
    } finally {
      this.saving.set(false);
      this.publishing.set(false);
    }
  }

  private async loadPosts(): Promise<void> {
    try {
      this.posts.set(await this.contentService.listCurrentPosts());
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Posts could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }
}

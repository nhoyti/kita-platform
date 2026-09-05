import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';

import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../config/supabase.service';
import { ContentMedia, ContentPost, ContentPostInput, PostMediaType } from './content.types';

const POST_COLUMNS =
  'id, creator_id, title, body, status, visibility, published_at, created_at, updated_at, post_media(id, post_id, creator_id, media_type, provider, storage_path, mime_type, file_size, sort_order)';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly auth = inject(AuthService);
  private readonly supabase = inject(SupabaseService);

  async listCurrentPosts(): Promise<ContentPost[]> {
    const { data, error } = await this.client('load posts')
      .from('posts')
      .select(POST_COLUMNS)
      .order('created_at', { ascending: false });
    if (error) throw this.toError(error.message, 'load posts');
    return (data ?? []) as ContentPost[];
  }

  async savePost(input: ContentPostInput, id?: string): Promise<ContentPost> {
    const creatorId = this.requireUserId('save post');
    const { data, error } = await this.client('save post')
      .from('posts')
      .upsert({
        ...(id ? { id } : {}),
        creator_id: creatorId,
        title: this.normalizeText(input.title),
        body: input.body.trim(),
        visibility: input.visibility,
        status: input.status,
        published_at: input.status === 'published' ? new Date().toISOString() : null,
      })
      .select(POST_COLUMNS)
      .single<ContentPost>();
    if (error) throw this.toError(error.message, 'save post');
    return data;
  }

  async uploadMedia(postId: string, file: File): Promise<ContentMedia> {
    const creatorId = this.requireUserId('upload media');
    const mediaType: PostMediaType = file.type.startsWith('video/') ? 'video' : 'image';
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/'))
      throw this.toError('Only image and video files are supported.', 'upload media');
    const storagePath = `${creatorId}/${postId}/${crypto.randomUUID()}-${this.safeFileName(file.name)}`;
    const client = this.client('upload media');
    const upload = await client.storage
      .from('post-media')
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (upload.error) throw this.toError(upload.error.message, 'upload media');
    const { data, error } = await client
      .from('post_media')
      .insert({
        post_id: postId,
        creator_id: creatorId,
        media_type: mediaType,
        provider: mediaType === 'video' ? 'video_provider' : 'supabase_storage',
        storage_path: storagePath,
        mime_type: file.type,
        file_size: file.size,
      })
      .select(
        'id, post_id, creator_id, media_type, provider, storage_path, mime_type, file_size, sort_order',
      )
      .single<ContentMedia>();
    if (error) {
      await client.storage.from('post-media').remove([storagePath]);
      throw this.toError(error.message, 'save media');
    }
    return data;
  }

  async deletePost(post: ContentPost): Promise<void> {
    const client = this.client('delete post');
    const paths = post.post_media.map((media) => media.storage_path);
    if (paths.length) await client.storage.from('post-media').remove(paths);
    const { error } = await client.from('posts').delete().eq('id', post.id);
    if (error) throw this.toError(error.message, 'delete post');
  }

  private client(operation: string): SupabaseClient {
    if (!this.supabase.client)
      throw this.toError(
        this.supabase.configurationError ?? 'Supabase is not configured.',
        operation,
      );
    return this.supabase.client;
  }
  private requireUserId(operation: string): string {
    const userId = this.auth.user()?.id;
    if (!userId) throw this.toError('You must be signed in to manage posts.', operation);
    return userId;
  }
  private normalizeText(value: string | null): string | null {
    const normalized = value?.trim() ?? '';
    return normalized || null;
  }
  private safeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120);
  }
  private toError(message: string, operation: string): Error {
    return new Error(`${operation}: ${message}`);
  }
}

import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';

import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../config/supabase.service';
import {
  CreatorPlan,
  CreatorPlanInput,
  CreatorPost,
  CreatorProfile,
  CreatorProfileInput,
  CreatorServiceError,
  CreatorStats,
} from './creator.types';

const CREATOR_PROFILE_COLUMNS =
  'id, username, display_name, bio, profile_image_url, cover_image_url, category, social_links, subscriber_count, created_at, updated_at';
const PLAN_COLUMNS = 'id, creator_id, name, description, monthly_price, is_active, sort_order';
const POST_COLUMNS = 'id, creator_id, title, body, published_at, created_at';

@Injectable({ providedIn: 'root' })
export class CreatorService {
  private readonly auth = inject(AuthService);
  private readonly supabase = inject(SupabaseService);

  async getPublicProfile(username: string): Promise<CreatorProfile> {
    const { data, error } = await this.getClient('load creator profile')
      .from('creator_profiles')
      .select(CREATOR_PROFILE_COLUMNS)
      .eq('username', username.toLowerCase())
      .single<CreatorProfile>();

    if (error) {
      throw this.toError(error, 'load creator profile', 'Creator profile not found.');
    }

    return data;
  }

  async getCurrentProfile(): Promise<CreatorProfile | null> {
    const creatorId = this.requireUserId('load creator profile');
    const { data, error } = await this.getClient('load creator profile')
      .from('creator_profiles')
      .select(CREATOR_PROFILE_COLUMNS)
      .eq('id', creatorId)
      .maybeSingle<CreatorProfile>();

    if (error) {
      throw this.toError(error, 'load creator profile');
    }

    return data;
  }

  async saveCurrentProfile(input: CreatorProfileInput): Promise<CreatorProfile> {
    const creatorId = this.requireUserId('save creator profile');
    const { data, error } = await this.getClient('save creator profile')
      .from('creator_profiles')
      .upsert({ id: creatorId, ...this.normalizeProfile(input) })
      .select(CREATOR_PROFILE_COLUMNS)
      .single<CreatorProfile>();

    if (error) {
      throw this.toError(error, 'save creator profile');
    }

    return data;
  }

  async getPlans(creatorId: string): Promise<CreatorPlan[]> {
    const { data, error } = await this.getClient('load subscription plans')
      .from('creator_plans')
      .select(PLAN_COLUMNS)
      .eq('creator_id', creatorId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw this.toError(error, 'load subscription plans');
    }

    return (data ?? []) as CreatorPlan[];
  }

  async getCurrentPlans(): Promise<CreatorPlan[]> {
    const creatorId = this.requireUserId('load subscription plans');
    const { data, error } = await this.getClient('load subscription plans')
      .from('creator_plans')
      .select(PLAN_COLUMNS)
      .eq('creator_id', creatorId)
      .order('sort_order', { ascending: true });

    if (error) {
      throw this.toError(error, 'load subscription plans');
    }

    return (data ?? []) as CreatorPlan[];
  }

  async saveCurrentPlan(input: CreatorPlanInput, id?: string): Promise<CreatorPlan> {
    const creatorId = this.requireUserId('save subscription plan');
    const { data, error } = await this.getClient('save subscription plan')
      .from('creator_plans')
      .upsert({ ...(id ? { id } : {}), creator_id: creatorId, ...input })
      .select(PLAN_COLUMNS)
      .single<CreatorPlan>();

    if (error) {
      throw this.toError(error, 'save subscription plan');
    }

    return data;
  }

  async getPublicPosts(creatorId: string): Promise<CreatorPost[]> {
    const { data, error } = await this.getClient('load creator posts')
      .from('creator_posts')
      .select(POST_COLUMNS)
      .eq('creator_id', creatorId)
      .eq('visibility', 'public')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      throw this.toError(error, 'load creator posts');
    }

    return (data ?? []) as CreatorPost[];
  }

  async getCurrentStats(): Promise<CreatorStats> {
    const creatorId = this.requireUserId('load creator statistics');
    const client = this.getClient('load creator statistics');
    const [profile, followers, posts] = await Promise.all([
      client.from('creator_profiles').select('subscriber_count').eq('id', creatorId).single(),
      client
        .from('creator_follows')
        .select('creator_id', { count: 'exact', head: true })
        .eq('creator_id', creatorId),
      client
        .from('creator_posts')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId),
    ]);

    if (profile.error || followers.error || posts.error) {
      throw this.toError(
        profile.error ?? followers.error ?? posts.error,
        'load creator statistics',
      );
    }

    return {
      subscriber_count: Number(profile.data?.subscriber_count ?? 0),
      follower_count: followers.count ?? 0,
      post_count: posts.count ?? 0,
    };
  }

  async isFollowing(creatorId: string): Promise<boolean> {
    const userId = this.auth.user()?.id;
    if (!userId) {
      return false;
    }

    const { data, error } = await this.getClient('check follow status')
      .from('creator_follows')
      .select('creator_id')
      .eq('creator_id', creatorId)
      .eq('fan_id', userId)
      .maybeSingle();

    if (error) {
      throw this.toError(error, 'check follow status');
    }

    return data !== null;
  }

  async setFollowing(creatorId: string, following: boolean): Promise<void> {
    const client = this.getClient('update follow status');
    const fanId = this.requireUserId('update follow status');
    const result = following
      ? await client.from('creator_follows').insert({ creator_id: creatorId, fan_id: fanId })
      : await client
          .from('creator_follows')
          .delete()
          .eq('creator_id', creatorId)
          .eq('fan_id', fanId);

    if (result.error) {
      throw this.toError(result.error, 'update follow status');
    }
  }

  private getClient(operation: string): SupabaseClient {
    if (!this.supabase.client) {
      throw new CreatorServiceError(
        this.supabase.configurationError ?? 'Creators are not configured.',
        operation,
      );
    }

    return this.supabase.client;
  }

  private requireUserId(operation: string): string {
    const userId = this.auth.user()?.id;
    if (!userId) {
      throw new CreatorServiceError('You must be signed in to manage creator content.', operation);
    }

    return userId;
  }

  private normalizeProfile(input: CreatorProfileInput): CreatorProfileInput {
    return {
      ...input,
      username: input.username.trim().toLowerCase(),
      display_name: input.display_name.trim(),
      bio: this.normalizeText(input.bio),
      profile_image_url: this.normalizeText(input.profile_image_url),
      cover_image_url: this.normalizeText(input.cover_image_url),
      category: this.normalizeText(input.category),
      social_links: input.social_links ?? {},
    };
  }

  private normalizeText(value: string | null | undefined): string | null {
    const normalizedValue = value?.trim() ?? null;
    return normalizedValue || null;
  }

  private toError(
    error: { message: string; code?: string; status?: number } | null,
    operation: string,
    notFoundMessage?: string,
  ): CreatorServiceError {
    if (error?.code === 'PGRST116' && notFoundMessage) {
      return new CreatorServiceError(notFoundMessage, operation, error.status);
    }
    if (error?.code === '23505') {
      return new CreatorServiceError(
        'That creator username or plan already exists.',
        operation,
        error.status,
      );
    }
    if (error?.code === '23514') {
      return new CreatorServiceError(
        'The creator details do not meet the required format.',
        operation,
        error.status,
      );
    }
    return new CreatorServiceError(
      error?.message ?? 'The creator request failed.',
      operation,
      error?.status,
    );
  }
}

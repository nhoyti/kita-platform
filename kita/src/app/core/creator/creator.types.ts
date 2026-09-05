export interface SocialLinks {
  readonly website?: string;
  readonly instagram?: string;
  readonly tiktok?: string;
  readonly youtube?: string;
}

export interface CreatorProfile {
  readonly id: string;
  readonly username: string;
  readonly display_name: string;
  readonly bio: string | null;
  readonly profile_image_url: string | null;
  readonly cover_image_url: string | null;
  readonly category: string | null;
  readonly social_links: SocialLinks;
  readonly subscriber_count: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface CreatorProfileInput {
  readonly username: string;
  readonly display_name: string;
  readonly bio?: string | null;
  readonly profile_image_url?: string | null;
  readonly cover_image_url?: string | null;
  readonly category?: string | null;
  readonly social_links?: SocialLinks;
}

export interface CreatorPlan {
  readonly id: string;
  readonly creator_id: string;
  readonly name: string;
  readonly description: string | null;
  readonly monthly_price: number;
  readonly is_active: boolean;
  readonly sort_order: number;
}

export interface CreatorPlanInput {
  readonly name: string;
  readonly description?: string | null;
  readonly monthly_price: number;
  readonly is_active?: boolean;
  readonly sort_order?: number;
}

export interface CreatorPost {
  readonly id: string;
  readonly creator_id: string;
  readonly title: string | null;
  readonly body: string;
  readonly published_at: string;
  readonly created_at: string;
}

export interface CreatorStats {
  readonly subscriber_count: number;
  readonly follower_count: number;
  readonly post_count: number;
}

export class CreatorServiceError extends Error {
  constructor(
    message: string,
    readonly operation: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'CreatorServiceError';
  }
}

export type PostStatus =
  | 'draft'
  | 'processing'
  | 'pending_review'
  | 'published'
  | 'restricted'
  | 'removed';
export type PostVisibility = 'public' | 'followers' | 'subscribers' | 'tier' | 'paid';
export type PostMediaType = 'image' | 'video';

export interface ContentPost {
  readonly id: string;
  readonly creator_id: string;
  readonly title: string | null;
  readonly body: string;
  readonly status: PostStatus;
  readonly visibility: PostVisibility;
  readonly published_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly post_media: ContentMedia[];
}

export interface ContentMedia {
  readonly id: string;
  readonly post_id: string;
  readonly creator_id: string;
  readonly media_type: PostMediaType;
  readonly provider: 'supabase_storage' | 'video_provider';
  readonly storage_path: string;
  readonly mime_type: string;
  readonly file_size: number;
  readonly sort_order: number;
}

export interface ContentPostInput {
  readonly title: string | null;
  readonly body: string;
  readonly visibility: PostVisibility;
  readonly status: PostStatus;
}

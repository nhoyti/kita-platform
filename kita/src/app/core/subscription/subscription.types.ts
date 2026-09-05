export type SubscriptionStatus = 'pending' | 'active' | 'canceled' | 'payment_failed';

export interface Subscription {
  readonly id: string;
  readonly fan_id: string;
  readonly creator_id: string;
  readonly plan_id: string;
  readonly status: SubscriptionStatus;
  readonly payment_provider: 'mock';
  readonly payment_reference: string | null;
  readonly current_period_start: string | null;
  readonly current_period_end: string | null;
  readonly canceled_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export class SubscriptionServiceError extends Error {
  constructor(
    message: string,
    readonly operation: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'SubscriptionServiceError';
  }
}

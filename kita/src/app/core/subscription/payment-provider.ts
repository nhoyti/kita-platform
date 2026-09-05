import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseService } from '../config/supabase.service';
import { Subscription, SubscriptionServiceError } from './subscription.types';

export interface PaymentProvider {
  subscribe(planId: string): Promise<Subscription>;
  cancel(subscriptionId: string): Promise<Subscription>;
}

@Injectable({ providedIn: 'root' })
export class MockPaymentProvider implements PaymentProvider {
  private readonly supabase = inject(SupabaseService);

  async subscribe(planId: string): Promise<Subscription> {
    const { data, error } = await this.client('start subscription').rpc('subscribe_to_plan', {
      p_plan_id: planId,
    });
    if (error) throw this.toError(error.message, 'start subscription');
    return data as Subscription;
  }

  async cancel(subscriptionId: string): Promise<Subscription> {
    const { data, error } = await this.client('cancel subscription').rpc('cancel_subscription', {
      p_subscription_id: subscriptionId,
    });
    if (error) throw this.toError(error.message, 'cancel subscription');
    return data as Subscription;
  }

  private client(operation: string): SupabaseClient {
    if (!this.supabase.client) {
      throw this.toError(
        this.supabase.configurationError ?? 'Payments are not configured.',
        operation,
      );
    }
    return this.supabase.client;
  }

  private toError(message: string, operation: string, status?: number): SubscriptionServiceError {
    return new SubscriptionServiceError(message, operation, status);
  }
}

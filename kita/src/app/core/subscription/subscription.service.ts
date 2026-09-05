import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';

import { AuthService } from '../auth/auth.service';
import { CreatorPlan } from '../creator/creator.types';
import { SupabaseService } from '../config/supabase.service';
import { MockPaymentProvider, PaymentProvider } from './payment-provider';
import { Subscription, SubscriptionServiceError } from './subscription.types';

const PLAN_COLUMNS = 'id, creator_id, name, description, monthly_price, is_active, sort_order';
const SUBSCRIPTION_COLUMNS =
  'id, fan_id, creator_id, plan_id, status, payment_provider, payment_reference, current_period_start, current_period_end, canceled_at, created_at, updated_at';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly auth = inject(AuthService);
  private readonly supabase = inject(SupabaseService);
  private readonly paymentProvider: PaymentProvider = inject(MockPaymentProvider);

  async getPlans(creatorId: string): Promise<CreatorPlan[]> {
    const { data, error } = await this.client('load subscription plans')
      .from('creator_plans')
      .select(PLAN_COLUMNS)
      .eq('creator_id', creatorId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw this.toError(error.message, 'load subscription plans');
    return (data ?? []) as CreatorPlan[];
  }

  async getMySubscriptions(): Promise<Subscription[]> {
    const fanId = this.requireUserId('load subscriptions');
    const { data, error } = await this.client('load subscriptions')
      .from('subscriptions')
      .select(SUBSCRIPTION_COLUMNS)
      .eq('fan_id', fanId)
      .order('created_at', { ascending: false });
    if (error) throw this.toError(error.message, 'load subscriptions');
    return (data ?? []) as Subscription[];
  }

  async getSubscription(id: string): Promise<Subscription> {
    const { data, error } = await this.client('load subscription')
      .from('subscriptions')
      .select(SUBSCRIPTION_COLUMNS)
      .eq('id', id)
      .single<Subscription>();
    if (error) throw this.toError(error.message, 'load subscription');
    return data;
  }

  subscribe(planId: string): Promise<Subscription> {
    this.requireUserId('start subscription');
    return this.paymentProvider.subscribe(planId);
  }

  cancel(subscriptionId: string): Promise<Subscription> {
    this.requireUserId('cancel subscription');
    return this.paymentProvider.cancel(subscriptionId);
  }

  private client(operation: string): SupabaseClient {
    if (!this.supabase.client) {
      throw this.toError(
        this.supabase.configurationError ?? 'Subscriptions are not configured.',
        operation,
      );
    }
    return this.supabase.client;
  }

  private requireUserId(operation: string): string {
    const userId = this.auth.user()?.id;
    if (!userId) throw this.toError('You must be signed in to manage subscriptions.', operation);
    return userId;
  }

  private toError(message: string, operation: string, status?: number): SubscriptionServiceError {
    return new SubscriptionServiceError(message, operation, status);
  }
}

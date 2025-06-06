import { makeRequest } from './api.common';

interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  paymentMethodId: string;
  metadata?: Record<string, string>;
}

interface UpdateSubscriptionParams {
  subscriptionId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

interface CancelSubscriptionParams {
  subscriptionId: string;
  cancelImmediately?: boolean;
}

interface ReactivateSubscriptionParams {
  subscriptionId: string;
  metadata?: Record<string, string>;
}

export class BillingV2Service {
  private apiUrl = 'http://localhost:3000';

  /**
   * Get all available subscription plans/prices
   */
  public async getPlans(): Promise<any> {
    const url = `${this.apiUrl}/stripe/plans`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Create a new subscription for a customer
   * @param params Subscription details including customerId, priceId, paymentMethodId, and optional metadata
   */
  public async createSubscription(params: CreateSubscriptionParams): Promise<any> {
    const url = `${this.apiUrl}/stripe/subscriptions`;
    const res = await makeRequest('POST', url, params);
    return res?.data;
  }

  /**
   * Get a subscription by ID
   * @param subscriptionId The subscription ID
   */
  public async getSubscription(subscriptionId: string): Promise<any> {
    const url = `${this.apiUrl}/stripe/subscriptions/${subscriptionId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Get all subscriptions for a customer
   * @param customerId The customer ID
   */
  public async getCustomerSubscriptions(customerId: string): Promise<any> {
    const url = `${this.apiUrl}/stripe/subscriptions/customer/${customerId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Update a subscription
   * @param params Update parameters including subscriptionId, priceId, and optional metadata
   */
  public async updateSubscription(params: UpdateSubscriptionParams): Promise<any> {
    const url = `${this.apiUrl}/stripe/subscriptions/${params.subscriptionId}`;
    const res = await makeRequest('PUT', url, {
      priceId: params.priceId,
      metadata: params.metadata,
    });
    return res?.data;
  }

  /**
   * Cancel a subscription
   * @param params Cancel parameters including subscriptionId and cancelImmediately flag
   */
  public async cancelSubscription(params: CancelSubscriptionParams): Promise<any> {
    const url = `${this.apiUrl}/stripe/subscriptions/${params.subscriptionId}`;
    const res = await makeRequest('DELETE', url, {
      cancelImmediately: params.cancelImmediately || false,
    });
    return res?.data;
  }

  /**
   * Reactivate a cancelled subscription
   * @param params Reactivation parameters including subscriptionId and optional metadata
   */
  public async reactivateSubscription(params: ReactivateSubscriptionParams): Promise<any> {
    const url = `${this.apiUrl}/stripe/subscriptions/${params.subscriptionId}/reactivate`;
    const res = await makeRequest('POST', url, {
      metadata: params.metadata,
    });
    return res?.data;
  }

  /**
   * Get all invoices for a customer
   * @param customerId The customer ID
   */
  public async getCustomerInvoices(customerId: string): Promise<any> {
    const url = `${this.apiUrl}/stripe/invoices/customer/${customerId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  // simulate a payment for a subscription
  public async simulatePayment(customerId: string, priceId: string): Promise<any> {
    const url = `${this.apiUrl}/stripe/subscriptions/simulate-invoice`;
    const res = await makeRequest('POST', url, { customerId, priceId });
    return res?.data;
  }
}

export const billingV2Service = new BillingV2Service();

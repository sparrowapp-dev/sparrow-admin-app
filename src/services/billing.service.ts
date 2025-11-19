import { makeRequest } from './api.common';

interface BillingDetailsUpdateParams {
  name: string;
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code?: string;
    country: string;
  };
  hubId?: string; // Optional hub ID
}

interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  paymentMethodId: string;
  metadata?: any;
  trialPeriodDays?: number;
  trialType?: string;
  seats?: number;
  promoCodeId?: string; // Optional promo code ID
}

interface UpdateSubscriptionParams {
  subscriptionId: string;
  isDowngrade?: boolean;
  priceId?: string;
  paymentMethodId?: string;
  metadata?: any;
  seats?: number;
  paymentBehavior?: 'default_incomplete' | 'allow_incomplete';
  // For downgrade
  teamId?: string;
  workspaces?: Array<{ workspaceId: string; name: string; }>;
  users?: Array<{ id: string; email: string; }>;
}

// Add response interfaces for subscription operations that may require 3DS
interface SubscriptionResponse {
  subscriptionId: string;
  requiresAction?: boolean;
  clientSecret?: string;
  status?: string;
}

interface CancelSubscriptionParams {
  subscriptionId: string;
  teamId: string;
  workspaces?: Array<{ workspaceId: string; name: string; }>;
  users?: Array<{ id: string; email: string; }>;
}

interface ReactivateSubscriptionParams {
  subscriptionId: string;
  metadata?: Record<string, string>;
}

interface HubFeedbackParams {
  hubId: string;
  feedback: string;
}

export class BillingService {
  /**
   * Create a new customer
   * @param customerData Customer information
   */
  /**
   * Fetch all pricing details
   */
  public async getAllPricingDetails(): Promise<any> {
    const url = `/api/pricing`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  public async createCustomer(customerData: any): Promise<any> {
    const url = `/api/stripe/customers`;
    const res = await makeRequest('POST', url, customerData);
    return res?.data;
  }

  /**
   * Get Stripe configuration including publishable key
   */
  public async getStripeConfig(): Promise<any> {
    const url = `/api/stripe/config`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Create a setup intent for adding a payment method
   */
  public async createSetupIntent(customerId: string): Promise<any> {
    const url = `/api/stripe/setup-intents`;
    const res = await makeRequest('POST', url, { customerId });
    return res?.data;
  }

  /**
   * Get payment methods for a customer
   * @param customerId The customer ID
   */
  public async getPaymentMethods(customerId: string): Promise<any> {
    if (!customerId) {
      return Promise.resolve({ paymentMethods: [], totalCount: 0 });
    }

    const url = `/api/payment-methods/customer/${customerId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Get a specific payment method
   * @param paymentMethodId The payment method ID
   */
  public async getPaymentMethod(paymentMethodId: string): Promise<any> {
    const url = `/api/payment-methods/${paymentMethodId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Update billing details for a payment method
   * @param paymentMethodId The payment method ID
   * @param billingDetails The billing details to update
   */
  public async updateBillingDetails(
    paymentMethodId: string,
    billingDetails: BillingDetailsUpdateParams,
  ): Promise<any> {
    const url = `/api/payment-methods/${paymentMethodId}/billing-details`;
    const res = await makeRequest('PUT', url, billingDetails);
    return res?.data;
  }

  /**
   * Delete a payment method
   * @param paymentMethodId The payment method ID
   */
  public async deletePaymentMethod(paymentMethodId: string): Promise<any> {
    const url = `/api/payment-methods/${paymentMethodId}`;
    const res = await makeRequest('DELETE', url);
    return res?.data;
  }

  /**
   * Get customer information from backend storage
   * Returns the stored customer ID for the current user
   */
  public async fetchCustomerId(hubId?: string): Promise<any> {
    if (!hubId) {
      return;
    }

    const url = `/api/admin/stripe-customer${hubId ? `?hubId=${hubId}` : ''}`;
    const res = await makeRequest('GET', url);
    return res.data || null;
  }

  /**
   * Save customer ID to backend storage
   * @param customerId The Stripe customer ID to save
   */
  public async saveCustomerId(customerId: string, hubId: string): Promise<any> {
    if (!customerId && !hubId) {
      return;
    }
    const url = `/api/admin/stripe-customer`;

    const res = await makeRequest('POST', url, { customerId, hubId });
    return res?.data || null;
  }

  // === Subscription API methods ===

  /**
   * Get all available subscription plans/prices
   */
  public async getPlans(): Promise<any> {
    const url = `/api/stripe/plans`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Create a new subscription for a customer
   * @param params Subscription details including customerId, priceId, paymentMethodId, and optional metadata
   * @returns Subscription response with payment intent details if 3DS is required
   */
  public async createSubscription(params: CreateSubscriptionParams): Promise<any> {
    const url = `/api/stripe/subscriptions`;
    const res = await makeRequest('POST', url, params);
    return res?.data;
  }

  /**
   * Get a subscription by ID
   * @param subscriptionId The subscription ID
   */
  public async getSubscription(subscriptionId: string): Promise<any> {
    const url = `/api/stripe/subscriptions/${subscriptionId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Get all subscriptions for a customer
   * @param customerId The customer ID
   */
  public async getCustomerSubscriptions(customerId: string): Promise<any> {
    const url = `/api/stripe/subscriptions/customer/${customerId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Update a subscription
   * @param params Update parameters including subscriptionId, priceId, and optional metadata
   * @returns Subscription response with payment intent details if 3DS is required
   */
  public async updateSubscription(params: UpdateSubscriptionParams): Promise<any> {
    const url = `/api/stripe/subscriptions/${params.subscriptionId}`;
    let requestBody: any = {
      priceId: params.priceId,
      metadata: params.metadata,
    };
    if (params.isDowngrade) {
      requestBody.prorationBehavior = "none";
      requestBody.atPeriodEnd = true;
      if (params.teamId) requestBody.teamID = params.teamId;
      if (params.workspaces) requestBody.workspaces = params.workspaces;
      if (params.users) requestBody.users = params.users;
    } else {
      if (params.paymentMethodId) requestBody.paymentMethodId = params.paymentMethodId;
      if (params.seats) requestBody.seats = params.seats;
      if (params.paymentBehavior) requestBody.paymentBehavior = params.paymentBehavior;
    }
    const res = await makeRequest("PUT", url, requestBody);
    return res?.data;
  }


  /**
   * Cancel a subscription
   * @param params Cancel parameters including subscriptionId and cancelImmediately flag
   */
  public async cancelSubscription(params: CancelSubscriptionParams): Promise<any> {
    const url = `/api/stripe/subscriptions/${params.subscriptionId}`;

    const body: any = {
      cancelImmediately: false,
    };
    if (params.teamId) body.teamId = params.teamId;
    if (params.workspaces) body.workspaces = params.workspaces;
    if (params.users) body.users = params.users;
    const res = await makeRequest("POST", url, body);
    return res?.data;
  }


  /**
   * Reactivate a cancelled subscription
   * @param params Reactivation parameters including subscriptionId and optional metadata
   */
  public async reactivateSubscription(params: ReactivateSubscriptionParams): Promise<any> {
    const url = `/api/stripe/subscriptions/${params.subscriptionId}/reactivate`;
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
    const url = `/api/stripe/invoices/customer/${customerId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Submit feedback when a hub subscription is cancelled
   * @param params Object containing hubId and feedback text
   */
  public async submitHubFeedback(params: HubFeedbackParams): Promise<any> {
    const url = `/api/admin/hub-feedback`;
    const res = await makeRequest('POST', url, params);
    return res?.data;
  }

  public async setUpDefaultPaymentMethod(customerId, paymentMethodId) {
    const url = `/api/payment-methods/default`;
    await makeRequest('POST', url, { customerId, paymentMethodId });
  }
}

export const billingService = new BillingService();

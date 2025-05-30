import { makeRequest } from './api.common';

const API_URL = 'http://localhost:3000';

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
}

export class BillingService {
  /**
   * Get customer information
   */
  public async getCustomer(): Promise<any> {
    const url = `${API_URL}/stripe/customer`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Create a new customer
   * @param customerData Customer information
   */
  public async createCustomer(customerData: any): Promise<any> {
    const url = `${API_URL}/stripe/customers`;
    const res = await makeRequest('POST', url, customerData);
    return res?.data;
  }

  /**
   * Get Stripe configuration including publishable key
   */
  public async getStripeConfig(): Promise<any> {
    const url = `${API_URL}/stripe/config`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Create a setup intent for adding a payment method
   */
  public async createSetupIntent(customerId: string): Promise<any> {
    const url = `${API_URL}/stripe/setup-intents`;
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

    const url = `${API_URL}/payment-methods/customer/${customerId}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  /**
   * Get a specific payment method
   * @param paymentMethodId The payment method ID
   */
  public async getPaymentMethod(paymentMethodId: string): Promise<any> {
    const url = `${API_URL}/payment-methods/${paymentMethodId}`;
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
    const url = `${API_URL}/payment-methods/${paymentMethodId}/billing-details`;
    const res = await makeRequest('PUT', url, billingDetails);
    return res?.data;
  }

  /**
   * Delete a payment method
   * @param paymentMethodId The payment method ID
   */
  public async deletePaymentMethod(paymentMethodId: string): Promise<any> {
    const url = `${API_URL}/payment-methods/${paymentMethodId}`;
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
}

export const billingService = new BillingService();

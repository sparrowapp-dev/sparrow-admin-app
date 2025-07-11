import { makeRequest } from './api.common';

export class PricingService {
  public async getPricing(): Promise<{ data: any[] }> {
    const res = await makeRequest('GET', '/api/pricing');
    return res?.data;
  }
}

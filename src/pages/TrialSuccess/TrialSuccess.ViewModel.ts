import { ResponseInterface } from '@/interface/HttpClient';
import { PricingService } from '@/services/pricing.service';
import { successResponse, errorResponse } from '@/utils/formatResponseType';

class TrialSuccessFlowViewModel {
  private pricingService = new PricingService();
  constructor() {}

  public async getPricingDetails(): Promise<ResponseInterface<any>> {
    try {
      const response = await this.pricingService.getPricing();
      return successResponse(response);
    } catch (error) {
      console.error('Failed to get pricing details:', error);
      return errorResponse(error?.message || 'Failed to send confirmation email', null);
    }
  }
}

export default TrialSuccessFlowViewModel;

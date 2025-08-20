import { get } from 'svelte/store';
import { userEmail } from '@/store/auth';
import { userService } from '@/services/users.service';
import { successResponse, errorResponse } from '@/utils/formatResponseType';


class PlansViewModel {
  constructor() {}
  public async getUserTrialExhaustedStatus(): Promise<any> {
    try {
      const email = get(userEmail);
      const response = await userService.getUserTrialExhaustedStatus(email);
      return successResponse(response?.data?.data?.isUserTrialExhausted ?? false);
      
    } catch (error) {
      console.error('Error fetching trial exhausted status:', error);
      return errorResponse(error?.message || 'Failed to fetch trial exhausted status', null);
    }
  }
}

export default PlansViewModel;
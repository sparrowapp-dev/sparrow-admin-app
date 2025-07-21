import { get } from 'svelte/store';
import { userEmail } from '@/store/auth';
import { userService } from '@/services/users.service';
import { successResponse, errorResponse } from '@/utils/formatResponseType';
import { navigate } from 'svelte-routing';

class HubsViewModel {
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

  public handleStartTrial(): void {
    const email = get(userEmail);
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const url = `/plans?accessToken=${accessToken}&refreshToken=${refreshToken}&email=${email}&source='admin'`;
    navigate(url);
  }
}

export default HubsViewModel;
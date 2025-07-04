import { ResponseInterface } from '@/interface/HttpClient';
import { HubsService } from '@/services/hubs.service';
import { TrialService } from '@/services/trial.service';
import { successResponse, errorResponse } from '@/utils/formatResponseType';

class TrialFlowViewModel {
  private trialService = new TrialService();
  private hubService = new HubsService();
  constructor() {}

  public async getTrialDetails(trialId: string): Promise<ResponseInterface<any>> {
    try {
      const response = await this.trialService.getTrialRecord(trialId);
      return successResponse(response);
    } catch (error) {
      console.error('Error fetching trial details:', error);
      return errorResponse(error?.message || 'Failed to fetch trial details', null);
    }
  }

  public async checkHubUrlExists(data: any): Promise<ResponseInterface<any>> {
    try {
      const response = await this.trialService.checkHubUrlExists(data);
      return successResponse(response);
    } catch (error) {
      console.error('Error checking hub URL existence:', error);
      return errorResponse(error?.message || 'Failed to check hub URL existence', null);
    }
  }

  public async createTrialHub(data: any): Promise<ResponseInterface<any>> {
    try {
      const response = await this.hubService.createHub(data);
      return successResponse(response);
    } catch (error) {
      console.error('Error creating trial hub:', error);
      return errorResponse(error?.message || 'Failed to create trial hub', null);
    }
  }

  public async updateTrialHub(hubId: string, data: any): Promise<ResponseInterface<any>> {
    try {
      const response = await this.hubService.updateHub(hubId, data);
      return successResponse(response);
    } catch (error) {
      console.error('Error updating trial hub:', error);
      return errorResponse(error?.message || 'Failed to update trial hub', null);
    }
  }

  public async getHubDetails(hubId: string): Promise<ResponseInterface<any>> {
    try {
      const response = await this.hubService.getHubDetails(hubId);
      return successResponse(response);
    } catch (error) {
      console.error('Error fetching hub details:', error);
      return errorResponse(error?.message || 'Failed to fetch hub details', null);
    }
  }

  public async bulkInviteUsers(data: any): Promise<ResponseInterface<any>> {
    try {
      const response = await this.hubService.bulkInviteUsers(data);
      return successResponse(response);
    } catch (error) {
      console.error('Error bulk inviting users:', error);
      return errorResponse(error?.message || 'Failed to bulk invite users', null);
    }
  }

  public async sendConfirmationEmail(
    trialId: string,
    userCount: number,
  ): Promise<ResponseInterface<any>> {
    try {
      const response = await this.hubService.sendConfirmationMail(trialId, {
        userCount: userCount,
      });
      return successResponse(response);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return errorResponse(error?.message || 'Failed to send confirmation email', null);
    }
  }
}

export default TrialFlowViewModel;

import { makeRequest } from './api.common';

export class TrialService {
  constructor() {}

  public async getTrialRecord(trialId: string | undefined | null): Promise<any> {
    if (!trialId) {
      return;
    }
    const res = await makeRequest('GET', `/api/get-trial-record/${trialId}`);
    return res?.data;
  }

  public async checkHubUrlExists(data: any): Promise<any> {
    const res = await makeRequest('POST', `/api/team/hub-url-exists`, data);
    return res?.data;
  }
}

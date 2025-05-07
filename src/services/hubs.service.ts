import { makeRequest } from './api.common';

export class HubsService {
  public async getAllHubs(): Promise<any[]> {
    const res = await makeRequest('GET', '/hubs');
    return res?.data;
  }
}

export const hubsService = new HubsService();

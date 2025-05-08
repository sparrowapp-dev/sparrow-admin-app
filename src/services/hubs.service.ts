import { makeRequest } from './api.common';
interface HubQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}
export class HubsService {
  public async getAllHubs(): Promise<any[]> {
    const res = await makeRequest('GET', '/hubs');
    return res?.data;
  }
  public async getAllUserHubs(params?: HubQueryParams): Promise<any> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/hubs/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }
  public async gethubsummary(): Promise<any[]> {
    const res = await makeRequest('GET', '/hubs/hubs-summary');
    return res?.data;
  }
  public async gethubnamesuggestion(params?: any): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    const url = `/hubs/search-hub-names${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }
}

export const hubsService = new HubsService();

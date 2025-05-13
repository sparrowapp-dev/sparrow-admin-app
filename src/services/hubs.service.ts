import { makeRequest } from './api.common';

interface HubQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface WorkspaceQueryParams {
  hubId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  workspaceType?: 'PUBLIC' | 'PRIVATE' | 'ALL';
}

export class HubsService {
  public async getAllHubs(): Promise<{ data: any[] }> {
    const res = await makeRequest('GET', '/api/admin/hubs');
    return res?.data;
  }

  public async getAllUserHubs(params?: HubQueryParams): Promise<any> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/api/admin/all-hubs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  public async gethubsummary(): Promise<any[]> {
    const res = await makeRequest('GET', '/api/admin/hubs-summary');
    return res?.data;
  }

  public async getHubWorkspaces(params: WorkspaceQueryParams): Promise<any> {
    const queryParams = new URLSearchParams();

    queryParams.append('hubId', params.hubId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search !== undefined) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.workspaceType) queryParams.append('workspaceType', params.workspaceType);

    const url = `/api/admin/hub-workspaces?${queryParams.toString()}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }
}

export const hubsService = new HubsService();

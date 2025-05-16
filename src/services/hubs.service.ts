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

interface CreateWorkspaceDto {
  id: string;
  name: string;
  description?: string;
}

interface MemberQueryParams {
  hubId: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface InviteQueryParams {
  hubId: string;
  page?: number;
  limit?: number;
  search?: string;
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
    if (!params.hubId) {
      return;
    }
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

  public async createWorkspace(data: CreateWorkspaceDto): Promise<any> {
    const res = await makeRequest('POST', '/api/admin/create-workspace', data);
    return res?.data;
  }

  public async createHub(data: FormData): Promise<any> {
    const res = await makeRequest('POST', '/api/admin/create-hub', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res?.data;
  }

  public async getHubDetails(hubId: string): Promise<any> {
    if (!hubId) {
      return;
    }
    const res = await makeRequest('GET', `/api/admin/get-hub/${hubId}`);
    return res?.data;
  }

  public async updateHub(hubId: string, data: FormData): Promise<any> {
    const res = await makeRequest('PUT', `/api/admin/update-hub/${hubId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res?.data;
  }

  public async getHubMembers(params: MemberQueryParams): Promise<any> {
    if (!params.hubId) {
      return Promise.resolve({ data: { members: [], totalCount: 0, hubName: '' } });
    }

    const queryParams = new URLSearchParams();

    queryParams.append('hubId', params.hubId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search !== undefined) queryParams.append('search', params.search);

    const url = `/api/admin/hub-members?${queryParams.toString()}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  public async getHubInvites(params: InviteQueryParams): Promise<any> {
    if (!params.hubId) {
      return Promise.resolve({ data: { invites: [], totalCount: 0 } });
    }

    const queryParams = new URLSearchParams();

    queryParams.append('hubId', params.hubId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search !== undefined) queryParams.append('search', params.search);

    const url = `/api/admin/hub-invites?${queryParams.toString()}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  // Add this method to your HubsService class

  public async inviteUsers(data: any): Promise<any> {
    const res = await makeRequest('POST', `/api/team/${data.teamId}/user`, data);
    return res?.data;
  }
}

export const hubsService = new HubsService();

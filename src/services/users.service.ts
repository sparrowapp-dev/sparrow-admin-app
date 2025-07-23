import { makeRequest } from './api.common';

interface DashboardStatsResponse {
  message: string;
  httpStatusCode: number;
  data: {
    users: {
      total: number;
      changeFromLastMonth: number;
    };
    hubs: {
      total: number;
      changeFromLastMonth: number;
    };
    invites: {
      total: number;
      changeFromLastMonth: number;
    };
  };
}

interface UserDistributionItem {
  label: string;
  value: number;
  color: string;
  count: number;
}

interface UserDistributionResponse {
  message: string;
  httpStatusCode: number;
  data: UserDistributionItem[];
}

interface TrendDataPoint {
  date: string;
  value: number;
}

interface TrendSeries {
  name: string;
  color: string;
  data: TrendDataPoint[];
}

interface UserTrendsResponse {
  message: string;
  httpStatusCode: number;
  data: {
    series: TrendSeries[];
  };
}

interface UserActivity {
  _id: string;
  type: string;
  message: string;
  workspaceId: string;
  createdAt: string;
  createdBy: string;
  detailsUpdatedBy: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

interface UserActivityResponse {
  message: string;
  httpStatusCode: number;
  data: {
    activities: UserActivity[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export class UserService {
  public async getDashboardStats(): Promise<DashboardStatsResponse> {
    const url = '/api/admin/dashboard-stats';
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  public async getUserDistribution(): Promise<UserDistributionResponse> {
    const url = '/api/admin/user-distribution';
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  public async getUserTrends(): Promise<UserTrendsResponse> {
    const url = '/api/admin/user-trends';
    const res = await makeRequest('GET', url);
    return res?.data;
  }

  public async getUserActivity(page: number = 1, limit: number = 7): Promise<UserActivityResponse> {
    const url = `/api/admin/user-activity?page=${page}&limit=${limit}`;
    const res = await makeRequest('GET', url);
    return res?.data;
  }
  public async getUsers(): Promise<any> {
    const url = '/api/admin/enterpriseUsers';

    const res = await makeRequest('GET', url);
    return res?.data;
  }
  public async getUserDetails(params): Promise<any> {
    if (!params.userId) {
      return;
    }
    const queryParams = new URLSearchParams();
    queryParams.append('userId', params.userId);
    const url = `/api/admin/enterpriseUsers-details?${queryParams.toString()}`;
    const res = await makeRequest('GET', url);

    return res?.data;
  }
  public async getUserRole(params): Promise<any> {
    if (!params.workspaceId && !params.hubId) {
      return;
    }
    const queryParams = new URLSearchParams();
    if (params.workspaceId) queryParams.append('workspaceId', params.workspaceId);
    if (params.hubId) queryParams.append('teamId', params.hubId);
    const url = `/api/admin/auth/get-user-role?${queryParams.toString()}`;
    const res = await makeRequest('GET', url);

    return res?.data;
  }

   /**
   * Gets the trial exhausted status for a user by email.
   *
   * @param email - The email address of the user.
   * @returns A promise that resolves to the server's response.
   */
  public async getUserTrialExhaustedStatus(email: string): Promise<any> {
  const url = `/api/user/trial-exhausted/${email}`;
  const res = await makeRequest('GET', url
  );
  return res;
}
}

export const userService = new UserService();

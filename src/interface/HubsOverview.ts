export interface Workspace {
  id: string;
  name: string;
  type: 'PRIVATE' | 'PUBLIC';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contributor {
  id: string;
  role: string;
  email: string;
}

export interface Hub {
  _id: string;
  name: string;
  hubUrl: string;
  workspaceStats: {
    total: number;
    private: number;
    public: number;
  };
  workspaces: Workspace[];
  contributors: {
    total: number;
    details: Contributor[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubsResponse {
  data: {
    totalpages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    hubs: Hub[];
    sortBy: 'createdAt' | 'updatedAt' | 'name';
    sortOrder: 'asc' | 'desc';
  };
}

export interface HubDetail {
  id: string;
  name: string;
  email: string;
  teamId: string;
  teamName: string;
  teamJoiningData: Date;
  role: string;
  simplifiedWorkspaces: {
    workspace: {
      _id: string;
      name: string;
      description: string;
      team: {
        id: string;
        name: string;
        hubUrl: string;
      };
      workspaceType: string;
      users: {
        role: string;
        id: string;
        name: string;
        email: string;
      }[];
      admins: {
        id: string;
        name: string;
      }[];
      environments: {
        id: string;
        name: string;
        type: string;
      }[];
      createdAt: string;
      createdBy: string;
      updatedAt: string;
      updatedBy: string;
    };
    userRole: string;
  }[];
}
export interface UserDetailsResponse {
  httpStatusCode: number;
  data: {
    userDetails: UserDetails;
    hubDetails: HubDetail[];
  };
}
export interface UserDetails {
  name: string;
  email: string;
}
export interface ModalData {
  data: HubDetail | null;
}

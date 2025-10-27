export interface Client {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  profileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  tenantId: string;
  clientId: string | {
    _id: string;
    name: string;
    email: string;
  };
  name: string;
  description: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  current: number;
  total: number;
  count: number;
  totalRecords: number;
}

export interface GetClientsResponse {
  clients: Client[];
  pagination: Pagination;
}

export interface GetProjectsResponse {
  projects: Project[];
  pagination: Pagination;
}

// Type for creating a new client, omits server-generated fields
export type NewClient = Omit<Client, '_id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'isActive' | 'profileUrl'> & {
    profileImageBinary?: string;
};

// Type for creating a new project, omits server-generated fields
export type NewProject = Pick<Project, 'name' | 'description' | 'status' | 'isActive'>;

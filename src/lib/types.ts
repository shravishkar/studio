

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
  status: 'active' | 'inactive' | 'completed' | 'on-hold';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  projectId: string | {
    _id: string;
    name: string;
  };
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  createdDate: string;
  dueDate: string;
  visibleToClient: boolean;
  isActive: boolean;
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

export interface GetTasksResponse {
  tasks: Task[];
  pagination: Pagination;
}

// Type for creating a new client, omits server-generated fields
export type NewClient = Omit<Client, '_id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'isActive' | 'profileUrl'> & {
    profileImageBinary?: string;
};

// Type for creating a new project, omits server-generated fields
export type NewProject = Pick<Project, 'name' | 'description' | 'status' | 'isActive'>;

// Type for creating a new task
export type NewTask = Pick<Task, 'title' | 'description' | 'status' | 'dueDate' | 'visibleToClient'>;

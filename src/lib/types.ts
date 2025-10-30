

export interface Client {
    _id: string;
    tenantId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    profileUrl?: string; 
    createdAt: string;
    updatedAt: string;
    profileImageBinary?: string;
    isActive: boolean;
}

export interface APIResponse<T> {
    data: T;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalPages: number;
    currentPage: number;
}

export interface ProjectFile {
    _id: string;
    fileName: string;
    fileType: string;
    fileBinary: string;
}

export interface Project {
    _id:string;
    clientId: string | Client;
    tenantId: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    projectFiles: ProjectFile[];
}

export interface Task {
    _id: string;
    projectId: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'in-review' | 'completed';
    dueDate: string;
    createdDate: string;
    updatedAt: string;
    visibleToClient: boolean;
}

export interface NewClient {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    profileImageBinary?: string; 
    isActive?: boolean;
}

export interface NewProject {
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
    isActive?: boolean;
    clientId: string;
    projectFileBinary?: string;
    projectFileName?: string;
    projectFileType?: string;
}

export interface NewTask {
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'in-review' | 'completed';
    dueDate: string;
    visibleToClient: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    
}

export interface AuthState {
    user: User | null;
    token: string | null;
    tenantId: string | null;
    isLoading: boolean;
    error: string | null;
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

export interface Pagination {
    current: number;
    total: number;
    count: number;
    totalRecords: number;
}

export interface Document {
    _id: string;
    projectId: string;
    clientId: string;
    name: string;
    url: string;
    tag: string;
    createdDate: string;
    uploadedBy: string;
    uploaderId: string;
}

export interface NewDocument {
    name: string;
    tag: string;
    uploadedBy: string;
    uploaderId: string;
}
export interface LoginCredentials {
    email: string;
    password:  string;
    tenantId: string;
}

export interface AuthResponse {
    jwt: string;
    user: User;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
}

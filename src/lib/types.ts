
export interface Client {
    _id: string;
    tenantId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    profileImage?: string; 
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
    _id: string;
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
    createdAt: string;
    updatedAt: string;
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
}

export interface NewTask {
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'in-review' | 'completed';
    dueDate: string;
}

export interface User {
    id: string;
    email: string;
    
}

export interface AuthState {
    user: User | null;
    token: string | null;
    tenantId: string | null;
    isLoading: boolean;
    error: string | null;
}

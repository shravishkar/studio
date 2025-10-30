

import type { Client, GetClientsResponse, GetProjectsResponse, GetTasksResponse, NewClient, NewProject, NewTask, Project, Task, ProjectFile } from "./types";

interface ApiListResponse {
    success: boolean;
    message: string;
    data: GetClientsResponse;
}

interface ApiProjectsListResponse {
    success: boolean;
    message: string;
    data: GetProjectsResponse;
}

interface ApiTasksListResponse {
    success: boolean;
    message: string;
    data: GetTasksResponse;
}


interface ApiSingleResponse {
    success: boolean;
    message: string;
    data: Client;
}

interface ApiSingleProjectResponse {
    success: boolean;
    message: string;
    data: Project;
}

interface ApiSingleTaskResponse {
    success: boolean;
    message: string;
    data: Task;
}

interface ApiAddResponse {
    success: boolean;
    message: string;
}

// Function to retrieve a paginated list of clients
export async function getClients(tenantId: string, token: string, page: number, limit: number): Promise<GetClientsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}?page=${page}&limit=${limit}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch clients. Status: ${response.status}`);
        }

        const responseData: ApiListResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting clients:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to get projects for a specific client
export async function getProjects(tenantId: string, token: string, clientId?: string): Promise<GetProjectsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = clientId ? `${baseUrl}/projects/${tenantId}/${clientId}` : `${baseUrl}/projects/${tenantId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Provide a more specific error for 404
            if (response.status === 404) {
                 return { projects: [], pagination: { current: 1, total: 0, count: 0, totalRecords: 0 } };
            }
            throw new Error(errorData?.message || `Failed to fetch projects. Status: ${response.status}`);
        }

        const responseData: ApiProjectsListResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error(`Error getting projects for client ${clientId}:`, error);
        throw error instanceof Error ? error : new Error("An unknown error occurred while fetching projects.");
    }
}

// Function to get tasks for a specific project
export async function getTasks(tenantId: string, token: string, clientId: string, projectId: string): Promise<GetTasksResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (response.status === 404) {
                return { tasks: [], pagination: { current: 1, total: 0, count: 0, totalRecords: 0 } };
            }
            throw new Error(errorData?.message || `Failed to fetch tasks. Status: ${response.status}`);
        }

        const responseData: ApiTasksListResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error(`Error getting tasks for project ${projectId}:`, error);
        throw error instanceof Error ? error : new Error("An unknown error occurred while fetching tasks.");
    }
}


// Function to add a new client
export async function addClient(tenantId: string, token: string, newClient: NewClient): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newClient),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add client. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding client:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to add a new project for a client
export async function addProject(tenantId: string, token: string, clientId: string, newProject: NewProject): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${tenantId}/${clientId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newProject),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add project. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding project:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to add files to a project
export async function addProjectFiles(tenantId: string, token: string, clientId: string, projectId: string, files: { file: string; fileName: string; fileType: string; }[]): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${clientId}/${projectId}/files`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ files }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add files. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding project files:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}


// Function to add a new task to a project
export async function addTask(tenantId: string, token: string, clientId: string, projectId: string, newTask: NewTask): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newTask),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to add task. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error adding task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}


// Function to retrieve a single client by ID
export async function getClient(tenantId: string, token: string, clientId: string): Promise<Client> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}/${clientId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch client. Status: ${response.status}`);
        }

        const responseData: ApiSingleResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting client:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to retrieve a single project by ID
export async function getProject(tenantId: string, token: string, clientId: string, projectId: string): Promise<Project> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${tenantId}/${clientId}/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch project. Status: ${response.status}`);
        }

        const responseData: ApiSingleProjectResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting project:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to retrieve a single task by ID
export async function getTask(token: string, taskId: string): Promise<Task> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/single/${taskId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to fetch task. Status: ${response.status}`);
        }

        const responseData: ApiSingleTaskResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData.data;
    } catch (error) {
        console.error("Error getting task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to update an existing client
export async function updateClient(tenantId: string, token: string, clientId: string, updatedClient: Partial<NewClient>): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/clients/${tenantId}/${clientId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedClient),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to update client. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error updating client:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to update an existing project
export async function updateProject(tenantId: string, token: string, clientId: string, projectId: string, updatedProject: Partial<NewProject>): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${tenantId}/${clientId}/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedProject),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to update project. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error updating project:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to delete an existing project
export async function deleteProject(tenantId: string, token: string, clientId: string, projectId: string): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/projects/${tenantId}/${clientId}/${projectId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to delete project. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

export async function deleteTask( token: string, projectId: string, taskId: string): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/${projectId}/${taskId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to delete task. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

// Function to update an existing task
export async function updateTask(token: string, projectId: string, taskId: string, updatedTask: Partial<NewTask>): Promise<ApiAddResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${baseUrl}/tasks/${projectId}/${taskId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to update task. Status: ${response.status}`);
        }

        const responseData: ApiAddResponse = await response.json();
        if (!responseData.success) {
            throw new Error(responseData.message || "API returned a non-successful response.");
        }

        return responseData;
    } catch (error) {
        console.error("Error updating task:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred.");
    }
}

    
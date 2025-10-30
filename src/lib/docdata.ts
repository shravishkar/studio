import { APIResponse, NewDocument } from './types';

export const createDocument = async (
  clientId: string,
  projectId: string,
  newDocument: NewDocument,
  file: File,
  token: string
): Promise<APIResponse<any>> => {
  const formData = new FormData();
  formData.append('name', newDocument.name || file.name);
  formData.append('tag', newDocument.tag || '');
  formData.append('uploadedBy', newDocument.uploadedBy || '');
  formData.append('uploaderId', newDocument.uploaderId || '');
  formData.append('file', file);

  const response = await fetch(`/api/v1/documents/${clientId}/${projectId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create document');
  }

  return response.json();
};

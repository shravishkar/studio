import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string; projectId: string } }
) {
  const { clientId, projectId } = params;
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a directory for the project if it doesn't exist
  const projectUploadDir = join(process.cwd(), 'public', 'uploads', projectId);
  if (!existsSync(projectUploadDir)) {
    await mkdir(projectUploadDir, { recursive: true });
  }

  // Save the file to the project's directory
  const filePath = join(projectUploadDir, file.name);
  await writeFile(filePath, buffer);

  // Generate a public URL for the file
  const fileUrl = `/uploads/${projectId}/${file.name}`;

  // In a real application, you would save this document metadata to your database
  const newDocument = {
    _id: "doc-" + Math.random().toString(36).substring(2, 11), // dummy id
    projectId,
    clientId,
    name: data.get('name') || file.name,
    url: fileUrl,
    tag: data.get('tag'),
    createdDate: new Date().toISOString(),
    uploadedBy: data.get('uploadedBy'),
    uploaderId: data.get('uploaderId'),
  };

  return NextResponse.json({
    success: true,
    message: "Document created successfully",
    data: newDocument,
  });
}

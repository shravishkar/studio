
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const docsPath = path.join(process.cwd(), 'projectdocs');

// Function to ensure the directory exists
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
}

// GET handler to list files or download a specific file
export async function GET(request, { params }) {
  const { projectId } = params;
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file');
  const projectFolderPath = path.join(docsPath, projectId);

  await ensureDirectoryExists(projectFolderPath);

  if (fileName) {
    const filePath = path.join(projectFolderPath, fileName);
    try {
      await fs.access(filePath);
      const fileBuffer = await fs.readFile(filePath);
      const headers = new Headers();
      headers.append('Content-Disposition', `attachment; filename="${fileName}"`);
      headers.append('Content-Type', 'application/octet-stream');

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({ message: 'File not found' }, { status: 404 });
      }
      console.error('Failed to read file:', error);
      return NextResponse.json({ message: 'Error reading file' }, { status: 500 });
    }
  } else {
    try {
      const files = await fs.readdir(projectFolderPath);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(projectFolderPath, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            type: path.extname(file).substring(1).toUpperCase() || 'File',
            date: stats.mtime.toISOString().split('T')[0],
          };
        })
      );
      return NextResponse.json(fileDetails);
    } catch (error) {
      console.error('Failed to read files:', error);
      return NextResponse.json({ message: 'Error reading files' }, { status: 500 });
    }
  }
}

// POST handler to upload multiple files for a project
export async function POST(request, { params }) {
  const { projectId } = params;
  const projectFolderPath = path.join(docsPath, projectId);

  await ensureDirectoryExists(projectFolderPath);

  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No files uploaded' }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(projectFolderPath, file.name);
        await fs.writeFile(filePath, buffer);
        return file.name;
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return NextResponse.json({ 
        message: 'Files uploaded successfully', 
        fileNames: uploadedFiles 
    });
  } catch (error) {
    console.error('Failed to upload files:', error);
    return NextResponse.json({ message: 'Error uploading files' }, { status: 500 });
  }
}

// DELETE handler to delete a file for a project
export async function DELETE(request, { params }) {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    const projectFolderPath = path.join(docsPath, projectId);

    if (!fileName) {
        return NextResponse.json({ message: 'No file specified for deletion' }, { status: 400 });
    }

    const filePath = path.join(projectFolderPath, fileName);

    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return NextResponse.json({ message: 'File not found' }, { status: 404 });
        }
        console.error('Failed to delete file:', error);
        return NextResponse.json({ message: 'Error deleting file' }, { status: 500 });
    }
}

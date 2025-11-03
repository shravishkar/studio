'use client';

import { useState, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: () => void;
  projectId: string;
}

export default function AddFileDialog({ isOpen, onClose, onFileUploaded, projectId }: AddFileDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({ title: 'No files selected', description: 'Please select one or more files to upload.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      toast({ title: 'Files uploaded', description: `${selectedFiles.length} file(s) have been successfully uploaded.` });
      onFileUploaded();
      onClose();
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Could not upload files. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setSelectedFiles([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Files</DialogTitle>
        </DialogHeader>
        <div>
          <Input type="file" onChange={handleFileChange} multiple />
          {selectedFiles.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              {selectedFiles.length} file(s) selected
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

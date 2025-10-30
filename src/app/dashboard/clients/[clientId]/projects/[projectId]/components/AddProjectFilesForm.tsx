
'use client';

import { FC, useState, ChangeEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createDocument } from '@/lib/docdata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  file: z.any().refine((file) => file, 'A file is required'),
});

interface AddProjectFilesFormProps {
  clientId: string;
  projectId: string;

  onFilesAdded: (newFile: any) => void;
  setOpen: (open: boolean) => void;
}

const AddProjectFilesForm: FC<AddProjectFilesFormProps> = ({ clientId, projectId, onFilesAdded, setOpen }) => {
  const { tenantId, token } = useAuth(); // Assuming useAuth provides uploaderId
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        form.setValue('file', file);
        form.clearErrors('file');
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async () => {
    if (!tenantId || !token) {
      toast({ title: 'Error', description: 'Authentication details are missing.', variant: 'destructive' });
      return;
    }
    
    if (!selectedFile) {
        form.setError('file', { type: 'manual', message: 'A file is required' });
        return;
    }

    setIsSubmitting(true);

    try {
      const newDocumentData = {
          name: selectedFile.name,
          tag: 'project-file', // or some other tag logic
          uploadedBy: 'user', // replace with actual user name if available
          uploaderId: tenantId // or user id
      }
      const response = await createDocument(clientId, projectId, newDocumentData, selectedFile, token);
      toast({ title: 'Success', description: 'File added successfully.' });
      onFilesAdded(response.data);
      setOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add file.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="file"
          render={() => (
            <FormItem>
              <FormLabel>Project File</FormLabel>
              <FormControl>
                <Input type="file" onChange={handleFileChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 border-none"
        >
          {isSubmitting ? 'Adding...' : 'Add File'}
        </Button>
      </form>
    </Form>
  );
};

export default AddProjectFilesForm;

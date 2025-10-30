
'use client';

import { FC, useState, ChangeEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addProjectFiles } from '@/lib/api';
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
  files: z.any().refine((files) => files?.length > 0, 'At least one file is required'),
});

interface AddProjectFilesFormProps {
  clientId: string;
  projectId: string;
  onFilesAdded: () => void;
  setOpen: (open: boolean) => void;
}

const AddProjectFilesForm: FC<AddProjectFilesFormProps> = ({ clientId, projectId, onFilesAdded, setOpen }) => {
  const { tenantId, token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: undefined,
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      form.setValue('files', event.target.files);
      form.trigger('files');
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    if (!tenantId || !token) {
      toast({ title: 'Error', description: 'Authentication details are missing.', variant: 'destructive' });
      return;
    }
    
    const selectedFiles = data.files ? Array.from(data.files) : [];
    if (selectedFiles.length === 0) {
      form.setError('files', { type: 'manual', message: 'At least one file is required' });
      return;
    }

    setIsSubmitting(true);

    try {
      const filesData = await Promise.all(selectedFiles.map(file => {
        return new Promise<{ file: string; fileName: string; fileType: string; }>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file as File);
          reader.onloadend = () => {
            resolve({
              file: reader.result as string,
              fileName: (file as File).name,
              fileType: (file as File).type,
            });
          };
          reader.onerror = error => {
            reject(error);
          };
        });
      }));
      
      await addProjectFiles(tenantId, token, clientId, projectId, filesData);
      toast({ title: 'Success', description: 'Files added successfully.' });
      onFilesAdded();
      setOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add files.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="files"
          render={() => (
            <FormItem>
              <FormLabel>Project Files</FormLabel>
              <FormControl>
                <Input type="file" multiple onChange={handleFileChange} />
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
          {isSubmitting ? 'Adding...' : 'Add Files'}
        </Button>
      </form>
    </Form>
  );
};

export default AddProjectFilesForm;

    

'use client';

import { FC, useState, ChangeEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addProject } from '@/lib/api';
import { NewProject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['active', 'completed', 'on-hold']),
  projectFile: z.any().optional(),
});

interface AddProjectFormProps {
  clientId: string;
  onProjectAdded: () => void;
  setOpen: (open: boolean) => void;
}

const AddProjectForm: FC<AddProjectFormProps> = ({ clientId, onProjectAdded, setOpen }) => {
  const { tenantId, token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values) => {
    if (!tenantId || !token) {
      toast({ title: 'Error', description: 'Authentication details are missing.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    let newProject: NewProject = {
      ...values,
      clientId,
    };

    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        newProject.projectFileBinary = base64String;
        newProject.projectFileName = selectedFile.name;
        newProject.projectFileType = selectedFile.type;
        await createProject(newProject);
      };
      reader.onerror = (error) => {
        console.error('Error converting file to base64:', error);
        toast({ title: 'Error', description: 'Failed to process file.', variant: 'destructive' });
        setIsSubmitting(false);
      };
    } else {
      await createProject(newProject);
    }
  };

  const createProject = async (projectData: NewProject) => {
    try {
      await addProject(tenantId!, token!, clientId, projectData);
      toast({ title: 'Success', description: 'Project added successfully.' });
      onProjectAdded();
      setOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add project.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter project description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project File (Optional)</FormLabel>
              <FormControl>
                <Input type="file" onChange={handleFileChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Project'}
        </Button>
      </form>
    </Form>
  );
};

export default AddProjectForm;

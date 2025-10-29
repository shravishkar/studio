
'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { getProject, updateProject } from '@/lib/api';
import type { NewProject } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(['active', 'completed', 'on-hold']),
  projectFile: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditProjectFormProps {
  clientId: string;
  projectId: string;
}

export default function EditProjectForm({ clientId, projectId }: EditProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { tenantId, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        description: '',
        status: 'active',
    }
  });


  useEffect(() => {
    if (!tenantId || !token || !clientId || !projectId) return;

    const fetchProjectData = async () => {
      try {
        const project = await getProject(tenantId, token, clientId, projectId);
        form.reset({
          name: project.name,
          description: project.description,
          status: project.status,
        });
      } catch (error: any) {
        toast({ title: "Error", description: "Failed to fetch project data.", variant: "destructive" });
      }
    };

    fetchProjectData();
  }, [tenantId, token, clientId, projectId, form, toast]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!tenantId || !token || !clientId) {
      toast({ title: "Error", description: "Required information is missing to update the project.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const updateData: Partial<NewProject> = {
        name: data.name,
        description: data.description,
        status: data.status,
    };

    if (selectedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            updateData.projectFileBinary = base64String;
            updateData.projectFileName = selectedFile.name;
            updateData.projectFileType = selectedFile.type;
            await saveProject(updateData);
        };
        reader.onerror = (error) => {
            console.error('Error converting file to base64:', error);
            toast({ title: 'Error', description: 'Failed to process file.', variant: 'destructive' });
            setIsLoading(false);
        };
    } else {
        await saveProject(data);
    }
  };

  const saveProject = async (data: Partial<NewProject>) => {
    try {
        await updateProject(tenantId!, token!, clientId, projectId, data);
        toast({ title: "Success", description: "Project updated successfully." });
        router.push(`/dashboard/clients/${clientId}/projects/${projectId}`);
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to update project.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register("description")} />
                {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status && <p className="text-red-500 text-xs mt-1">{form.formState.errors.status.message}</p>}
              </div>

                <div>
                    <Label htmlFor="projectFile">Project File (Optional)</Label>
                    <Input id="projectFile" type="file" onChange={handleFileChange} />
                    {form.formState.errors.projectFile && <p className="text-red-500 text-xs mt-1">{form.formState.errors.projectFile.message as string}</p>}
                </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating Project...' : 'Update Project'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  );
}

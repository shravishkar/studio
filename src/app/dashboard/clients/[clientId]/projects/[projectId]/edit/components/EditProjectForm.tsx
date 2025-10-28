'use client';

import { useEffect, useState } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(['active', 'inactive', 'completed', 'on-hold']),
});

type FormValues = Omit<NewProject, 'isActive'>;

interface EditProjectFormProps {
  clientId: string;
  projectId: string;
}

export default function EditProjectForm({ clientId, projectId }: EditProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { tenantId, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        description: '',
        status: 'active',
    }
  });

  const { formState: { isDirty } } = form;

  const handleBackClick = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      router.back();
    }
  };

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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!tenantId || !token || !clientId) {
      toast({ title: "Error", description: "Required information is missing to update the project.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      await updateProject(tenantId, token, clientId, projectId, data);
      toast({ title: "Success", description: "Project updated successfully." });
      router.push('/dashboard/projects');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update project.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
          </Button>
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
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status && <p className="text-red-500 text-xs mt-1">{form.formState.errors.status.message}</p>}
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
       <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

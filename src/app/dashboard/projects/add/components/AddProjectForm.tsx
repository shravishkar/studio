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
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { getClients, addProject } from '@/lib/api';
import type { Client, NewProject } from '@/lib/types';
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
  clientId: z.string().min(1, { message: "Client is required." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(['active', 'inactive', 'completed']),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddProjectForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { tenantId, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      name: '',
      description: '',
      status: 'active',
      isActive: true,
    },
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
    if (!tenantId || !token) return;

    const fetchClients = async () => {
      try {
        const { clients: fetchedClients } = await getClients(tenantId, token, 1, 100);
        setClients(fetchedClients);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch clients.", variant: "destructive" });
      }
    };

    fetchClients();
  }, [tenantId, token, toast]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!tenantId || !token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);

    const { clientId, ...projectData } = data;

    try {
      await addProject(tenantId, token, clientId, projectData);
      toast({ title: "Success", description: "Project added successfully." });
      router.push('/dashboard/projects');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add project.", variant: "destructive" });
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
            <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="clientId">Client</Label>
                <Controller
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="clientId">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.clientId && <p className="text-red-500 text-xs mt-1">{form.formState.errors.clientId.message}</p>}
              </div>

              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" placeholder="E.g. Website Redesign" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>
              
              <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the project" {...form.register("description")} />
                  {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                 <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status && <p className="text-red-500 text-xs mt-1">{form.formState.errors.status.message}</p>}
              </div>

              <div className="flex items-center space-x-2">
                  <Controller
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                          <Switch
                              id="isActive"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                          />
                      )}
                  />
                  <Label htmlFor="isActive">Project is active</Label>
              </div>


              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding Project...' : 'Add Project'}
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import type { NewProject } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  status: z.enum(['Not Started', 'In Progress', 'Completed']),
});

export default function AddProjectForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NewProject>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      status: 'Not Started',
    },
  });

  const onSubmit: SubmitHandler<NewProject> = async (data) => {
    setIsLoading(true);
    console.log(data); // For now, just log the data.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setIsLoading(false);
    toast({ title: "Success", description: "Project added successfully." });
    router.push('/dashboard/projects');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" placeholder="E.g. Website Redesign" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
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
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && <p className="text-red-500 text-xs mt-1">{form.formState.errors.status.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding Project...' : 'Add Project'}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

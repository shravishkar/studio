
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { updateTask } from '@/lib/api';
import type { NewTask, Task } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  dueDate: z.date({ required_error: "A due date is required." }),
  status: z.enum(['todo', 'in-progress', 'completed', 'in-review']),
  visibleToClient: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskFormProps {
  projectId: string;
  task: Task;
  onTaskUpdated: () => void;
  setOpen: (open: boolean) => void;
}

export default function EditTaskForm({ projectId, task, onTaskUpdated, setOpen }: EditTaskFormProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate),
      status: task.status,
      visibleToClient: task.visibleToClient,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);

    const taskData: Partial<NewTask> = {
      ...data,
      description: data.description || '',
      dueDate: data.dueDate.toISOString(),
    };

    try {
      await updateTask(token, projectId, task._id, taskData);
      toast({ title: "Success", description: "Task updated successfully." });
      onTaskUpdated();
      setOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update task.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="title">Task Title</Label>
          <Input id="title" placeholder="E.g. Design homepage mockup" {...form.register("title")} />
          {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
        </div>
        
        <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the task in more detail" {...form.register("description")} />
            {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Controller
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                )}
              />
              {form.formState.errors.dueDate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.dueDate.message}</p>}
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
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="in-review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status && <p className="text-red-500 text-xs mt-1">{form.formState.errors.status.message}</p>}
              </div>
        </div>

        <div className="flex items-center space-x-2">
            <Controller
                control={form.control}
                name="visibleToClient"
                render={({ field }) => (
                    <Switch
                        id="visibleToClient"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
            />
            <Label htmlFor="visibleToClient">Visible to Client</Label>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating Task...' : 'Update Task'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

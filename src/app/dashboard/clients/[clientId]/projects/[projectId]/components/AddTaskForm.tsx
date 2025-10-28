
'use client';

import { useState } from 'react';
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
import { addTask } from '@/lib/api';
import type { NewTask } from '@/lib/types';
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
  status: z.enum(['todo', 'in-progress', 'done']),
  visibleToClient: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTaskFormProps {
  clientId: string;
  projectId: string;
  onTaskAdded: () => void;
  setOpen: (open: boolean) => void;
}

export default function AddTaskForm({ clientId, projectId, onTaskAdded, setOpen }: AddTaskFormProps) {
  const { toast } = useToast();
  const { tenantId, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      visibleToClient: false,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!tenantId || !token) {
      toast({ title: "Authentication Error", description: "Authentication details are missing.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);

    const taskData: NewTask = {
      ...data,
      description: data.description || '',
      dueDate: data.dueDate.toISOString(),
    };

    try {
      await addTask(tenantId, token, clientId, projectId, taskData);
      toast({ title: "Success", description: "Task added successfully." });
      onTaskAdded();
      setOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add task.", variant: "destructive" });
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
                        <SelectItem value="done">Done</SelectItem>
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
            {isLoading ? 'Adding Task...' : 'Add Task'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

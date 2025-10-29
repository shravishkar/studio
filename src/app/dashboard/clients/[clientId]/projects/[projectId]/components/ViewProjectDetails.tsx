
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { getProject, getTasks } from '@/lib/api';
import type { Project, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddTaskForm from './AddTaskForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ViewProjectDetailsProps {
  clientId: string;
  projectId: string;
}

export default function ViewProjectDetails({ clientId, projectId }: ViewProjectDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { tenantId, token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);

  const fetchProjectAndTasks = useCallback(async () => {
    if (!tenantId || !token || !clientId || !projectId) {
      setIsLoading(false);
      setIsLoadingTasks(false);
      return;
    }
    
    setIsLoading(true);
    setIsLoadingTasks(true);
    
    try {
      const projectData = await getProject(tenantId, token, clientId, projectId);
      setProject(projectData);
      
      const tasksData = await getTasks(tenantId, token, clientId, projectId);
      setTasks(tasksData.tasks);

    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch project details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsLoadingTasks(false);
    }
  }, [tenantId, token, clientId, projectId, toast]);


  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
          <CardDescription>The project you are looking for could not be found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const clientName = typeof project.clientId === 'object' ? project.clientId.name : 'N/A';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-grow">
              <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
              <CardDescription>Viewing details for project associated with {clientName}</CardDescription>
            </div>
            <Button onClick={() => router.push(`/dashboard/clients/${clientId}/projects/${projectId}/edit`)}>
                Edit Project
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <h3 className="font-semibold text-lg mb-2">Status</h3>
                  <Badge
                      variant={
                      project.status === 'completed' ? 'default' : project.status === 'active' ? 'secondary' : 'outline'
                      }
                  >
                      {project.status}
                  </Badge>
              </div>
              <div>
                  <h3 className="font-semibold text-lg mb-2">Active</h3>
                  <p className="text-muted-foreground">{project.isActive ? 'Yes' : 'No'}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Date Created</h3>
              <p className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Last Updated</h3>
              <p className="text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tasks</CardTitle>
            <Dialog open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <AddTaskForm 
                  clientId={clientId}
                  projectId={projectId}
                  onTaskAdded={() => {
                    fetchProjectAndTasks();
                  }}
                  setOpen={setAddTaskOpen}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length > 0 ? tasks.map(task => (
                  <TableRow key={task._id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Badge>{task.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No tasks found for this project.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

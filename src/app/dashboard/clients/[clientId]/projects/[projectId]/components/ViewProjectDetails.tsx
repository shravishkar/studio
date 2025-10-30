
'use client';

import { FC, useEffect, useState, useCallback, MouseEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { getProject, getTasks, deleteTask } from '@/lib/api';
import type { Project, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddTaskForm from './AddTaskForm';
import EditTaskForm from '../../components/EditTaskForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { cn } from '@/lib/utils';

interface ViewProjectDetailsProps {
  clientId: string;
  projectId: string;
}

const ActionButton: FC<{ onClick: (e: MouseEvent) => void; children: React.ReactNode; label: string; className?: string; }> = ({ onClick, children, label, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/action relative flex h-9 w-9 items-center justify-center rounded-full border bg-background transition-all duration-300 ease-in-out",
        "hover:w-24",
        className
      )}
    >
      <div className="absolute opacity-0 group-hover/action:opacity-100 transition-opacity duration-300">
        <span className="whitespace-nowrap text-xs font-semibold text-white">
          {label}
        </span>
      </div>
      <div className="absolute opacity-100 group-hover/action:opacity-0 transition-opacity duration-300">
        {children}
      </div>
    </button>
  );
};

export default function ViewProjectDetails({ clientId, projectId }: ViewProjectDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { tenantId, token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const fetchProject = useCallback(async () => {
    if (!tenantId || !token || !clientId || !projectId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const projectData = await getProject(tenantId, token, clientId, projectId);
      setProject(projectData);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch project details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, token, clientId, projectId, toast]);

  const fetchTasks = useCallback(async () => {
    if (!tenantId || !token || !clientId || !projectId) {
      setIsLoadingTasks(false);
      return;
    }
    setIsLoadingTasks(true);
    try {
      const tasksData = await getTasks(tenantId, token, clientId, projectId);
      setTasks(tasksData.tasks);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch tasks.", variant: "destructive" });
    } finally {
      setIsLoadingTasks(false);
    }
  }, [tenantId, token, clientId, projectId, toast]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [fetchProject, fetchTasks]);
  
  const taskStatusCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {} as Record<Task['status'], number>);
  }, [tasks]);

  const handleDeleteTaskClick = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToDelete(task);
  };

  const handleEditTaskClick = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToEdit(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete || !token) return;

    setIsDeletingTask(true);
    try {
      await deleteTask(token, projectId, taskToDelete._id);
      toast({ title: "Success", description: "Task deleted successfully." });
      fetchTasks();
      setTaskToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete task.", variant: "destructive" });
    } finally {
      setIsDeletingTask(false);
    }
  };

  const getTaskStatusClasses = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in-review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'todo':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
                    fetchTasks();
                    setAddTaskOpen(false);
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
            <>
            <div className="flex items-center space-x-4 pb-4">
                {Object.entries(taskStatusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusClasses(status as Task['status'])}`}>
                            {status}: {count}
                        </span>
                    </div>
                ))}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length > 0 ? tasks.map(task => (
                  <TableRow key={task._id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusClasses(task.status)}`}>
                            {task.status}
                        </span>
                    </TableCell>
                    <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                            <ActionButton
                                onClick={(e) => handleEditTaskClick(e, task)}
                                label="Edit"
                                className="text-yellow-500 border-yellow-200 hover:bg-yellow-500 hover:border-yellow-700"
                            >
                                <Edit className="h-4 w-4" />
                            </ActionButton>
                            <ActionButton
                                onClick={(e) => handleDeleteTaskClick(e, task)}
                                label="Delete"
                                className="text-red-500 border-red-200 hover:bg-red-500 hover:border-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </ActionButton>
                        </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No tasks found for this project.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>

      {taskToEdit && (
        <Dialog open={!!taskToEdit} onOpenChange={(isOpen) => !isOpen && setTaskToEdit(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <EditTaskForm
                    projectId={projectId}
                    task={taskToEdit}
                    onTaskUpdated={() => {
                        fetchTasks();
                        setTaskToEdit(null);
                    }}
                    setOpen={(isOpen) => !isOpen && setTaskToEdit(null)}
                />
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!taskToDelete} onOpenChange={(isOpen) => !isOpen && setTaskToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the task.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDeleteTask} disabled={isDeletingTask}>
                    {isDeletingTask ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

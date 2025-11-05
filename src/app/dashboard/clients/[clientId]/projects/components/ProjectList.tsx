
'use client';

import { FC, useState, MouseEvent, useCallback, useMemo } from 'react';
import { Project, Task } from '@/lib/types';
import { deleteProject, getTasks, deleteTask } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Edit, ListChecks, PlusCircle, Loader2, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import AddTaskForm from '../../projects/[projectId]/components/AddTaskForm';
import EditTaskForm from '../../projects/components/EditTaskForm';

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  label: string;
  className?: string;
}

const ActionButton: FC<ActionButtonProps> = ({ onClick, children, label, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/action relative flex h-9 w-9 items-center justify-center rounded-full bg-transparent transition-all duration-300 ease-in-out",
        "hover:w-24",
        className
      )}
    >
      <div className="absolute flex h-full w-full items-center justify-center opacity-100 transition-opacity duration-300 group-hover/action:opacity-0">
        {children}
      </div>
      <div className="absolute flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover/action:opacity-100">
        <span className="whitespace-nowrap text-xs font-semibold text-white">
          {label}
        </span>
      </div>
    </button>
  );
};

interface ProjectListProps {
    projects: Project[];
    onProjectDeleted: (projectId: string) => void;
}

const ProjectList: FC<ProjectListProps> = ({ projects, onProjectDeleted }) => {
  const { tenantId, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [tasksToShow, setTasksToShow] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [projectForNewTask, setProjectForNewTask] = useState<Project | null>(null);

  const taskStatusCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {} as Record<Task['status'], number>);
  }, [tasks]);

  const getClientId = (project: Project) => {
    return typeof project.clientId === 'object' ? project.clientId._id : project.clientId;
  }

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  }

  const handleAddTaskClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectForNewTask(project);
  }

  const handleRowClick = (project: Project) => {
    const clientId = getClientId(project);
    router.push(`/dashboard/clients/${clientId}/projects/${project._id}`);
  };

  const fetchTasksForProject = useCallback(async (project: Project) => {
     if (!tenantId || !token) {
        toast({ title: "Error", description: "Authentication details missing.", variant: "destructive" });
        setIsLoadingTasks(false);
        return;
    }
    const clientId = getClientId(project);
    try {
        const { tasks: fetchedTasks } = await getTasks(tenantId, token, clientId, project._id);
        setTasks(fetchedTasks);
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to fetch tasks.", variant: "destructive" });
    } finally {
        setIsLoadingTasks(false);
    }
  }, [tenantId, token, toast]);

  const handleViewTasks = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setTasksToShow(project);
    setIsLoadingTasks(true);
    setTasks([]);
    fetchTasksForProject(project);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete || !tenantId || !token) return;

    setIsDeleting(true);
    const clientId = getClientId(projectToDelete);

    try {
      await deleteProject(tenantId, token, clientId, projectToDelete._id);
      toast({ title: "Success", description: "Project deleted successfully." });
      onProjectDeleted(projectToDelete._id);
      setProjectToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete project.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToDelete(task);
  };
  
  const handleEditTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setTaskToEdit(task);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete || !tasksToShow || !token) return;

    setIsDeletingTask(true);
    try {
        await deleteTask(token, tasksToShow._id, taskToDelete._id);
        toast({ title: "Success", description: "Task deleted successfully." });
        fetchTasksForProject(tasksToShow);
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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right w-[240px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project._id}
              onClick={() => handleRowClick(project)}
              className="cursor-pointer transition-colors hover:bg-muted/50"
            >
              <TableCell>{project.name}</TableCell>
              <TableCell>
                {typeof project.clientId === 'object' ? project.clientId.name : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    project.status === 'completed' ? 'default' : project.status === 'active' ? 'secondary' : 'outline'
                  }
                >
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(project.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div
                  className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                    <ActionButton
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${getClientId(project)}/projects/${project._id}`))}
                      label="View"
                      className="text-blue-500 hover:bg-blue-500"
                    >
                        <Eye className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${getClientId(project)}/projects/${project._id}/edit`))}
                      label="Edit"
                      className="text-yellow-500 hover:bg-yellow-500"
                    >
                        <Edit className="h-4 w-4" />
                    </ActionButton>
                     <ActionButton
                       onClick={(e) => handleDeleteClick(e, project)}
                       label="Delete"
                       className="text-red-500 hover:bg-red-500"
                     >
                        <Trash2 className="h-4 w-4" />
                    </ActionButton>

                    <Separator orientation="vertical" className="h-6 mx-1 bg-border" />

                    <ActionButton
                      onClick={(e) => handleViewTasks(e, project)}
                      label="Tasks"
                      className="text-green-500 hover:bg-green-500"
                    >
                       <ListChecks className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => handleAddTaskClick(e, project)}
                      label="Add"
                      className="text-indigo-500 hover:bg-indigo-500"
                    >
                        <PlusCircle className="h-4 w-4" />
                    </ActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!tasksToShow} onOpenChange={(isOpen) => !isOpen && setTasksToShow(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tasks for {tasksToShow?.name}</DialogTitle>
            <DialogDescription>
              Here are all the tasks associated with this project.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
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
                        {tasks.length > 0 ? tasks.map((task) => (
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
                                        className="text-yellow-500 hover:bg-yellow-500"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={(e) => handleDeleteTaskClick(e, task)}
                                        label="Delete"
                                        className="text-red-500 hover:bg-red-500"
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
          </div>
        </DialogContent>
      </Dialog>

      {projectForNewTask && (
        <Dialog open={!!projectForNewTask} onOpenChange={(isOpen) => !isOpen && setProjectForNewTask(null)}>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Add New Task to {projectForNewTask.name}</DialogTitle>
            </DialogHeader>
            <AddTaskForm
                clientId={getClientId(projectForNewTask)}
                projectId={projectForNewTask._id}
                onTaskAdded={() => {
                  if (tasksToShow && tasksToShow._id === projectForNewTask._id) {
                    fetchTasksForProject(projectForNewTask);
                  }
                  setProjectForNewTask(null);
                }}
                setOpen={(isOpen) => !isOpen && setProjectForNewTask(null)}
            />
            </DialogContent>
        </Dialog>
      )}
      
      {taskToEdit && (
        <Dialog open={!!taskToEdit} onOpenChange={(isOpen) => !isOpen && setTaskToEdit(null)}>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <EditTaskForm
                projectId={tasksToShow!._id}
                task={taskToEdit}
                onTaskUpdated={() => {
                  if (tasksToShow) {
                    fetchTasksForProject(tasksToShow);
                  }
                  setTaskToEdit(null);
                }}
                setOpen={(isOpen) => !isOpen && setTaskToEdit(null)}
            />
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
};

export default ProjectList;

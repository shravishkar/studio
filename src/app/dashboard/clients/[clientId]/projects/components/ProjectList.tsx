
'use client';

import { FC, useState } from 'react';
import { Project, Task } from '@/lib/types';
import { deleteProject, getTask, getTasks } from '@/lib/api';
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
import ViewTaskDetails from '../../projects/[projectId]/components/ViewTaskDetails';

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
}

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  label: string;
  className?: string;
  hoverClassName?: string;
  iconClassName?: string;
}

const ActionButton: FC<ActionButtonProps> = ({ onClick, children, label, className, hoverClassName, iconClassName }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/action relative flex h-9 w-9 items-center justify-center rounded-full border bg-background transition-all duration-300 ease-in-out",
        "hover:w-24",
        className,
        hoverClassName
      )}
    >
      <div className={cn("absolute flex items-center justify-center opacity-0 transition-all duration-300 group-hover/action:opacity-100", iconClassName)}>
          {children}
      </div>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover/action:pointer-events-auto group-hover/action:opacity-100">
        {label}
      </span>
    </button>
  );
};

const ProjectList: FC<ProjectListProps> = ({ projects, onProjectDeleted }) => {
  const { tenantId, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  const [tasksToShow, setTasksToShow] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [projectForNewTask, setProjectForNewTask] = useState<Project | null>(null);

  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);


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

  const handleViewTasks = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setTasksToShow(project);
    setIsLoadingTasks(true);
    setTasks([]);

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
  };

  const handleViewTaskClick = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setIsLoadingTask(true);
    setTaskToView(null);

    if (!tenantId || !token) {
      toast({ title: "Error", description: "Authentication details missing.", variant: "destructive" });
      setIsLoadingTask(false);
      return;
    }

    try {
      const fetchedTask = await getTask(tenantId, token, taskId);
      setTaskToView(fetchedTask);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch task details.", variant: "destructive" });
    } finally {
      setIsLoadingTask(false);
    }
  }


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
                  className="inline-flex justify-end items-center gap-1 rounded-full bg-muted p-1 border"
                  onClick={(e) => e.stopPropagation()}
                >
                    <ActionButton 
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${getClientId(project)}/projects/${project._id}`))} 
                      label="View"
                      iconClassName="group-hover/action:text-white text-blue-500" 
                      hoverClassName="hover:bg-blue-500 hover:border-blue-700"
                    >
                        <Eye className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton 
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${getClientId(project)}/projects/${project._id}/edit`))} 
                      label="Edit" 
                      iconClassName="group-hover/action:text-white text-yellow-500"
                      hoverClassName="hover:bg-yellow-500 hover:border-yellow-700"
                    >
                        <Edit className="h-4 w-4" />
                    </ActionButton>
                     <ActionButton 
                       onClick={(e) => handleDeleteClick(e, project)} 
                       label="Delete" 
                       iconClassName="group-hover/action:text-white text-red-500"
                       hoverClassName="hover:bg-red-500 hover:border-red-700"
                     >
                        <Trash2 className="h-4 w-4" />
                    </ActionButton>

                    <Separator orientation="vertical" className="h-6 mx-1 bg-border" />
                    
                    <ActionButton 
                      onClick={(e) => handleViewTasks(e, project)} 
                      label="Tasks" 
                      iconClassName="group-hover/action:text-white text-green-500"
                      hoverClassName="hover:bg-green-500 hover:border-green-700"
                    >
                       <ListChecks className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton 
                      onClick={(e) => handleAddTaskClick(e, project)}
                      label="Add" 
                      iconClassName="group-hover/action:text-white text-indigo-500"
                      hoverClassName="hover:bg-indigo-500 hover:border-indigo-700"
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
                        <Badge 
                            variant={task.status === 'done' ? 'default' : task.status === 'in-progress' ? 'secondary' : 'outline'}
                        >
                            {task.status}
                        </Badge>
                        </TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <ActionButton 
                            onClick={(e) => handleViewTaskClick(e, task._id)} 
                            label="View"
                            iconClassName="group-hover/action:text-white text-blue-500" 
                            hoverClassName="hover:bg-blue-500 hover:border-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </ActionButton>
                        </TableCell>
                    </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No tasks found for this project.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
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
                    handleViewTasks(new MouseEvent('click'), projectForNewTask);
                  }
                }}
                setOpen={(isOpen) => !isOpen && setProjectForNewTask(null)}
            />
            </DialogContent>
        </Dialog>
      )}

      <Dialog open={!!taskToView || isLoadingTask} onOpenChange={(isOpen) => !isOpen && setTaskToView(null)}>
        <DialogContent className="sm:max-w-2xl">
           <DialogHeader>
                <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            {isLoadingTask ? (
              <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : taskToView ? (
              <ViewTaskDetails task={taskToView} />
            ) : null}
        </DialogContent>
      </Dialog>


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
    </>
  );
};

export default ProjectList;

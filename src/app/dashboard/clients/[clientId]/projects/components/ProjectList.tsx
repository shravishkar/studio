
'use client';

import { FC, useState } from 'react';
import { Project, Task } from '@/lib/types';
import { deleteProject, getTasks } from '@/lib/api';
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
import { Eye, Edit, Trash2, ListChecks, PlusCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
}

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  tooltip: string;
  children: React.ReactNode;
  label: string;
  className?: string;
  iconClassName?: string;
}

const ActionButton: FC<ActionButtonProps> = ({ onClick, tooltip, children, label, className, iconClassName }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "group/action relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:w-24",
            className
          )}
        >
          <div className={cn("absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover/action:opacity-10", iconClassName.replace('text-', 'bg-'))}></div>
          <div className={cn('h-4 w-4 transition-colors', iconClassName)}>{children}</div>
          <span className="absolute left-10 text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover/action:opacity-100">
            {label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
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
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right w-[280px]">Actions</TableHead>
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
                  className="inline-flex justify-end items-center gap-1 bg-muted p-1 rounded-full border"
                  onClick={(e) => e.stopPropagation()}
                >
                    <ActionButton tooltip="View Project" onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${getClientId(project)}/projects/${project._id}`))} label="View" iconClassName="text-blue-500" >
                        <Eye />
                    </ActionButton>
                    <ActionButton tooltip="Edit Project" onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${getClientId(project)}/projects/${project._id}/edit`))} label="Edit" iconClassName="text-yellow-500">
                        <Edit />
                    </ActionButton>
                     <ActionButton tooltip="Delete Project" onClick={(e) => handleDeleteClick(e, project)} label="Delete" iconClassName="text-red-500">
                        <Trash2 />
                    </ActionButton>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <ActionButton tooltip="View Tasks" onClick={(e) => handleViewTasks(e, project)} label="Tasks" iconClassName="text-green-500">
                       <ListChecks />
                    </ActionButton>
                    <ActionButton tooltip="Add Task" onClick={(e) => handleActionClick(e, () => { /* Logic for adding a task */ })} label="Add" iconClassName="text-indigo-500">
                        <PlusCircle />
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
                    </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">No tasks found for this project.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
             )}
          </div>
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
    </TooltipProvider>
  );
};

export default ProjectList;

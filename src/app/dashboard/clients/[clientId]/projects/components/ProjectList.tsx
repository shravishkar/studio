
import { FC, useState } from 'react';
import { Project, Task } from '@/lib/types';
import { deleteProject } from '@/lib/api';
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
import { Eye, Edit, Trash2, ListChecks, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
}

const dummyTasks: Omit<Task, '_id' | 'projectId'>[] = [
  { title: "Initial mockup design", status: 'done', createdDate: "2024-01-15", dueDate: "2024-01-20", visibleToClient: true },
  { title: "Develop homepage layout", status: 'in-progress', createdDate: "2024-01-21", dueDate: "2024-02-10", visibleToClient: true },
  { title: "Implement user authentication", status: 'todo', createdDate: "2024-02-01", dueDate: "2024-02-28", visibleToClient: false },
  { title: "Deploy to staging server", status: 'todo', createdDate: "2024-02-15", dueDate: "2024-03-05", visibleToClient: false },
];


const ProjectList: FC<ProjectListProps> = ({ projects, onProjectDeleted }) => {
  const { tenantId, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [tasksToShow, setTasksToShow] = useState<Project | null>(null);


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
            <TableHead className="text-right">Actions</TableHead>
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
                  className={
                    project.status === 'completed' ? 'bg-green-500 hover:bg-green-600' :
                    project.status === 'active' ? 'bg-blue-500 hover:bg-blue-600' :
                    'bg-gray-500 hover:bg-gray-600'
                  }
                >
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(project.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-2">
                    {/* Project Actions */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${getClientId(project)}/projects/${project._id}`))} 
                      className="hover:bg-blue-100 dark:hover:bg-blue-900 group"
                      title="View Project"
                    >
                        <Eye className="h-5 w-5 text-blue-500 transition-transform group-hover:scale-110" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleActionClick(e, () => router.push(`/dashboard/clients/${getClientId(project)}/projects/${project._id}/edit`))} 
                      className="hover:bg-yellow-100 dark:hover:bg-yellow-900 group"
                      title="Edit Project"
                    >
                       <Edit className="h-5 w-5 text-yellow-500 transition-transform group-hover:scale-110" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => handleDeleteClick(e, project)} className="hover:bg-red-100 dark:hover:bg-red-900 group" title="Delete Project">
                        <Trash2 className="h-5 w-5 text-red-500 transition-transform group-hover:scale-110" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    {/* Task Actions */}
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleActionClick(e, () => setTasksToShow(project))} 
                      className="hover:bg-green-100 dark:hover:bg-green-900 group"
                      title="View Tasks"
                    >
                        <ListChecks className="h-5 w-5 text-green-500 transition-transform group-hover:scale-110" />
                    </Button>
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleActionClick(e, () => { /* Logic for adding a task */ })} 
                      className="hover:bg-indigo-100 dark:hover:bg-indigo-900 group"
                      title="Add Task"
                    >
                        <PlusCircle className="h-5 w-5 text-indigo-500 transition-transform group-hover:scale-110" />
                    </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* View Tasks Dialog */}
      <Dialog open={!!tasksToShow} onOpenChange={(isOpen) => !isOpen && setTasksToShow(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tasks for {tasksToShow?.name}</DialogTitle>
            <DialogDescription>
              Here are all the tasks associated with this project.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyTasks.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={task.status === 'done' ? 'default' : task.status === 'in-progress' ? 'secondary' : 'outline'}
                        className={
                            task.status === 'done' ? 'bg-green-500 hover:bg-green-600' :
                            task.status === 'in-progress' ? 'bg-blue-500 hover:bg-blue-600' :
                            'bg-gray-500 hover:bg-gray-600'
                        }
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </>
  );
};

export default ProjectList;

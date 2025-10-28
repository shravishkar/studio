
import { FC, useState } from 'react';
import { Project } from '@/lib/types';
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
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
}

const ProjectList: FC<ProjectListProps> = ({ projects, onProjectDeleted }) => {
  const { tenantId, token } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const getClientId = (project: Project) => {
    return typeof project.clientId === 'object' ? project.clientId._id : project.clientId;
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
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
            <TableRow key={project._id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>
                {typeof project.clientId === 'object' ? project.clientId.name : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    project.status === 'completed'
                      ? 'default'
                      : project.status === 'active'
                      ? 'secondary'
                      : 'outline'
                  }
                  className={
                    project.status === 'completed'
                      ? 'bg-green-500'
                      : project.status === 'active'
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
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
                    <Link href={`/dashboard/clients/${getClientId(project)}/projects/${project._id}`} passHref>
                        <Button variant="ghost" size="icon" asChild>
                            <div><Eye className="h-4 w-4" /></div>
                        </Button>
                    </Link>
                    <Link href={`/dashboard/clients/${getClientId(project)}/projects/${project._id}/edit`} passHref>
                        <Button variant="ghost" size="icon" asChild>
                           <div><Edit className="h-4 w-4" /></div>
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(project)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

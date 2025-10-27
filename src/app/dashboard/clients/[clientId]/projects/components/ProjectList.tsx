import { FC } from 'react';
import { Project } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: FC<ProjectListProps> = ({ projects }) => {
  return (
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
                className={
                  project.status === 'Completed'
                    ? 'bg-green-500'
                    : project.status === 'In Progress'
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                  <DropdownMenuItem>Add Task</DropdownMenuItem>
                  <DropdownMenuItem>Upload File</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProjectList;

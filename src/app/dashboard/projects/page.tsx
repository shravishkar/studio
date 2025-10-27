
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
import { Progress } from '@/components/ui/progress';

const dummyProjects = [
  {
    _id: '1',
    name: 'Website Redesign',
    status: 'In Progress',
    progress: 75,
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Mobile App Development',
    status: 'Completed',
    progress: 100,
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
  {
    _id: '3',
    name: 'Marketing Campaign',
    status: 'Not Started',
    progress: 0,
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    _id: '4',
    name: 'SEO Optimization',
    status: 'In Progress',
    progress: 50,
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
];

export default function ProjectsPage() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dummyProjects.map((project) => (
            <TableRow key={project._id}>
              <TableCell>{project.name}</TableCell>
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
                <Progress value={project.progress} />
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

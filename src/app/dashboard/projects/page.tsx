
import Link from 'next/link';
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

const dummyProjects = [
  {
    _id: '1',
    name: 'Website Redesign',
    status: 'In Progress',
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Mobile App Development',
    status: 'Completed',
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
  {
    _id: '3',
    name: 'Marketing Campaign',
    status: 'Not Started',
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    _id: '4',
    name: 'SEO Optimization',
    status: 'In Progress',
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
];

export default function ProjectsPage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/dashboard/projects/add">
          <Button>Create Project</Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
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

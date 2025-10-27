
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getClients } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Client, Pagination } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

const ClientRow = ({ client }: { client: Client }) => (
  <TableRow key={client._id}>
    <TableCell>
       <Avatar>
          <AvatarImage src={client.profileUrl} alt={client.name} />
          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
        </Avatar>
    </TableCell>
    <TableCell>{client.name}</TableCell>
    <TableCell>{client.email}</TableCell>
    <TableCell>{client.phone || 'N/A'}</TableCell>
    <TableCell>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/clients/${client._id}/edit`}>Edit</Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href={`/dashboard/clients/${client._id}/projects`}>View Projects</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
);

const CLIENTS_PER_PAGE = 10;

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenantId, token } = useAuth();

  useEffect(() => {
    if (!tenantId || !token) return;

    const fetchClients = async () => {
      try {
        setLoading(true);
        const { clients: fetchedClients, pagination: newPagination } = await getClients(
          tenantId,
          token,
          currentPage,
          CLIENTS_PER_PAGE
        );

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '');
        const processedClients = fetchedClients.map(client => {
            let imageUrl = '';
            if (client.profileUrl && baseUrl) {
                const pathParts = client.profileUrl.replace(/\\/g, '/').split('/public/');
                if (pathParts.length > 1) {
                    imageUrl = `${baseUrl}/${pathParts[1]}`;
                }
            }
            return { ...client, profileUrl: imageUrl };
        });

        setClients(processedClients);
        setPagination(newPagination);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [tenantId, token, currentPage]);

  const handlePreviousPage = () => {
    if (pagination && pagination.current > 1) {
      setCurrentPage(pagination.current - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.current < pagination.total) {
      setCurrentPage(pagination.current + 1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length > 0 ? (
            clients.map(client => <ClientRow key={client._id} client={client} />)
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No clients found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Page {pagination.current} of {pagination.total}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pagination.current <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pagination.current >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

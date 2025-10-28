'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getClients, getProjects } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Client, Project } from '@/lib/types';
import ProjectList from '../clients/[clientId]/projects/components/ProjectList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProjectsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenantId, token } = useAuth();

  useEffect(() => {
    if (!tenantId || !token) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const { clients: fetchedClients } = await getClients(tenantId, token, 1, 100);
        setClients(fetchedClients);

        if (fetchedClients.length > 0) {
          const firstClientId = fetchedClients[0]._id;
          setSelectedClientId(firstClientId);
          const { projects: fetchedProjects } = await getProjects(tenantId, token, firstClientId);
          setProjects(fetchedProjects);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [tenantId, token]);

  const handleClientChange = async (clientId: string) => {
    if (!tenantId || !token) return;
    setSelectedClientId(clientId);
    try {
      setLoading(true);
      const { projects: fetchedProjects } = await getProjects(tenantId, token, clientId);
      setProjects(fetchedProjects);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProjectDeleted = (projectId: string) => {
    setProjects(currentProjects => currentProjects.filter(p => p._id !== projectId));
  };

  const selectedClientName = useMemo(() => {
    return clients.find(c => c._id === selectedClientId)?.name || 'Projects';
  }, [clients, selectedClientId]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{selectedClientName}</h1>
          <Select onValueChange={handleClientChange} value={selectedClientId || ''}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client._id} value={client._id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Link href="/dashboard/projects/add">
          <Button>Create Project</Button>
        </Link>
      </div>
      {loading ? (
         <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
         </div>
      ) : error ? (
        <div className="text-red-500 text-center">Error: {error}</div>
      ) : (
        <ProjectList projects={projects} onProjectDeleted={handleProjectDeleted} />
      )}
    </div>
  );
}

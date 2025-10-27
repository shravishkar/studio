
'use client';

import { FC, useEffect, useState } from 'react';
import { getClient, getProjects } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Client, Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectList from './components/ProjectList';

interface PageProps {
  params: {
    clientId: string;
  };
}

const ClientProjectsPage: FC<PageProps> = ({ params }) => {
  const { clientId } = params;
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenantId, token } = useAuth();

  useEffect(() => {
    if (!tenantId || !token || !clientId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientData, projectsData] = await Promise.all([
          getClient(tenantId, token, clientId),
          getProjects(tenantId, token, clientId)
        ]);
        setClient(clientData);
        setProjects(projectsData.projects);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId, token, clientId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
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
    <div>
      <h1 className="text-2xl font-bold mb-6">Projects for {client?.name}</h1>
      <ProjectList projects={projects} />
    </div>
  );
};

export default ClientProjectsPage;

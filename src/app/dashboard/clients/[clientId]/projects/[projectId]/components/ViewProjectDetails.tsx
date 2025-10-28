
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { getProject } from '@/lib/api';
import type { Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ViewProjectDetailsProps {
  clientId: string;
  projectId: string;
}

export default function ViewProjectDetails({ clientId, projectId }: ViewProjectDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { tenantId, token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId || !token || !clientId || !projectId) {
      setIsLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      setIsLoading(true);
      try {
        const projectData = await getProject(tenantId, token, clientId, projectId);
        setProject(projectData);
      } catch (error: any) {
        toast({ title: "Error", description: "Failed to fetch project details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [tenantId, token, clientId, projectId, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
          <CardDescription>The project you are looking for could not be found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const clientName = typeof project.clientId === 'object' ? project.clientId.name : 'N/A';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
                <CardDescription>Viewing details for project associated with {clientName}</CardDescription>
            </div>
            <Button onClick={() => router.push(`/dashboard/clients/${clientId}/projects/${projectId}/edit`)}>
                Edit Project
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Description</h3>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Status</h3>
                <Badge
                    variant={
                    project.status === 'completed' ? 'default' : project.status === 'active' ? 'secondary' : 'outline'
                    }
                    className={
                    project.status === 'completed' ? 'bg-green-500' : project.status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                    }
                >
                    {project.status}
                </Badge>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2">Active</h3>
                <p className="text-muted-foreground">{project.isActive ? 'Yes' : 'No'}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Date Created</h3>
            <p className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Last Updated</h3>
            <p className="text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

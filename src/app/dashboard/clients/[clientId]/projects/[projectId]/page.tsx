'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ViewProjectDetails from "./components/ViewProjectDetails";

export default function ViewProjectPage({ params }: { params: { clientId: string, projectId: string } }) {
  const router = useRouter();
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Project Details</h1>
      </div>
      <ViewProjectDetails clientId={params.clientId} projectId={params.projectId} />
    </div>
  );
}

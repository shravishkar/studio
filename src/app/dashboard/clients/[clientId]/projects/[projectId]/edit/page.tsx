
'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EditProjectForm from "./components/EditProjectForm";
import { Button } from '@/components/ui/button';
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

function EditProjectPageContent({ params }: { params: Promise<{ clientId: string, projectId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
       <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Edit Project</h1>
      </div>
      <EditProjectForm clientId={resolvedParams.clientId} projectId={resolvedParams.projectId} />
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function EditProjectPage({ params }: { params: Promise<{ clientId: string, projectId: string }> }) {
    return <EditProjectPageContent params={params} />;
}

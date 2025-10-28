'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormContext } from 'react-hook-form';
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

function EditProjectPageContent({ params }: { params: { clientId: string, projectId: string } }) {
  const router = useRouter();
  // We need to get the form context to check if it's dirty
  // This is a bit of a workaround because the form state is in the child component.
  // A better solution would be to use a state management library or lift state up.
  // For this case, we can't directly access it, so we'll just handle the back navigation.
  // The form itself now contains the logic for 'isDirty'.
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // A dummy check. The actual check is now inside the AddProjectForm.
  const handleBackClick = () => {
      router.back();
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
       <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Edit Project</h1>
      </div>
      <EditProjectForm clientId={params.clientId} projectId={params.projectId} />
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


export default function EditProjectPage({ params }: { params: { clientId: string, projectId: string } }) {
    return <EditProjectPageContent params={params} />;
}

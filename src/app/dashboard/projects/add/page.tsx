'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddProjectForm from "./components/AddProjectForm";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
// Note: We cannot easily access the form's dirty state from the parent.
// The discard confirmation logic is handled inside the AddProjectForm component.

export default function AddProjectPage() {
  const router = useRouter();

  const handleBackClick = () => {
    // The confirmation logic is inside the form component.
    // For simplicity, this button will just navigate back.
    // A more robust solution might involve lifting state up or using context.
    router.back();
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Add New Project</h1>
      </div>
      <AddProjectForm />
    </div>
  );
}

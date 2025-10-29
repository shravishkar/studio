
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from '@/lib/types';
import { CheckCircle, XCircle } from "lucide-react";
import { format } from 'date-fns';

interface ViewTaskDetailsProps {
  task: Task;
}

export default function ViewTaskDetails({ task }: ViewTaskDetailsProps) {
  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Not Found</CardTitle>
          <CardDescription>The task you are looking for could not be loaded.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
        <CardDescription>
          Due by {format(new Date(task.dueDate), "PPP")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Description</h3>
          <p className="text-muted-foreground">{task.description || 'No description provided.'}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Status</h3>
                <Badge
                    variant={
                    task.status === 'done' ? 'default' : task.status === 'in-progress' ? 'secondary' : 'outline'
                    }
                >
                    {task.status}
                </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Visible to Client</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                {task.visibleToClient ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                <span>{task.visibleToClient ? 'Yes' : 'No'}</span>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Date Created</h3>
            <p className="text-muted-foreground">{format(new Date(task.createdDate), "PPP")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import EditProjectForm from "./components/EditProjectForm";

export default function EditProjectPage({ params }: { params: { projectId: string } }) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Project</h1>
      <EditProjectForm projectId={params.projectId} />
    </div>
  );
}

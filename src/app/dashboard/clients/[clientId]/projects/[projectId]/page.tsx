
import ViewProjectDetails from "./components/ViewProjectDetails";

export default function ViewProjectPage({ params }: { params: { clientId: string, projectId: string } }) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <ViewProjectDetails clientId={params.clientId} projectId={params.projectId} />
    </div>
  );
}

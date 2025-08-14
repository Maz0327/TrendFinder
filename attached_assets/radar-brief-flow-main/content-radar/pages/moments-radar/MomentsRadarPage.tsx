import { useProject } from "@/context/ProjectContext";
import { useMoments } from "../../hooks/useMoments";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MomentsRadarPage() {
  const { currentProjectId } = useProject();
  const { momentsQuery } = useMoments({ projectId: currentProjectId ?? undefined });

  if (!currentProjectId) return <p className="text-muted-foreground">Select a project to view moments.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {momentsQuery.data?.map((m) => (
        <Card key={m.id} className="hover-scale">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{m.title}</span>
              <Badge variant="secondary">{m.intensity}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{m.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

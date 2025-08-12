import { useState } from "react";
import { useProject } from "../../context/ProjectContext";
import { useCaptures } from "../../hooks/useCaptures";
import { Input } from "../../../client/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../client/src/components/ui/card";

export default function CapturesInboxPage() {
  const { currentProjectId } = useProject();
  const [q, setQ] = useState("");
  const { capturesQuery } = useCaptures({ projectId: currentProjectId ?? undefined, q });

  if (!currentProjectId) return <p className="text-muted-foreground">Select a project to view captures.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capturesQuery.data?.map((c) => (
          <Card key={c.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="text-base">{c.title ?? "Untitled"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div>{c.platform ?? ""}</div>
              <div>{new Date(c.created_at).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

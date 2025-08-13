import { useState } from "react";
import { useProject } from "../../context/ProjectContext";
import { useBriefs } from "../../hooks/useBriefs";
import { Textarea } from "../../../client/src/components/ui/textarea";
import { Button } from "../../../client/src/components/ui/button";

export default function BriefBuilderV2Page() {
  const { currentProjectId } = useProject();
  const { briefsQuery, updateSections } = useBriefs(currentProjectId ?? undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const current = briefsQuery.data?.find((b) => b.id === selectedId) ?? null;
  const [defineText, setDefine] = useState("");
  const [shiftText, setShift] = useState("");
  const [deliverText, setDeliver] = useState("");

  if (!currentProjectId) return <p className="text-muted-foreground">Select a project to manage briefs.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1 space-y-2">
        {briefsQuery.data?.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setSelectedId(b.id);
              setDefine(JSON.stringify(b.defineContent ?? {}, null, 2));
              setShift(JSON.stringify(b.shiftContent ?? {}, null, 2));
              setDeliver(JSON.stringify(b.deliverContent ?? {}, null, 2));
            }}
            className={`w-full text-left px-3 py-2 rounded-xl border hover:bg-muted/50 ${selectedId === b.id ? "bg-muted" : ""}`}
          >
            {b.title}
          </button>
        ))}
      </div>
      <div className="lg:col-span-3 space-y-4">
        {current ? (
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">Define</div>
              <Textarea rows={6} value={defineText} onChange={(e) => setDefine(e.target.value)} />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Shift</div>
              <Textarea rows={6} value={shiftText} onChange={(e) => setShift(e.target.value)} />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Deliver</div>
              <Textarea rows={6} value={deliverText} onChange={(e) => setDeliver(e.target.value)} />
            </div>
            <Button
              onClick={() =>
                updateSections.mutate({
                  id: current.id,
                  patch: {
                    defineContent: safeJson(defineText),
                    shiftContent: safeJson(shiftText),
                    deliverContent: safeJson(deliverText),
                  },
                })
              }
            >
              Save
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">Select a brief to edit.</p>
        )}
      </div>
    </div>
  );
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

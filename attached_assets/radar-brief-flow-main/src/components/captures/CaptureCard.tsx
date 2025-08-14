import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { Capture } from "@/routes/CapturesInbox";

const CaptureCard = ({ capture, checked, onCheck, onOpen }: {
  capture: Capture;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onOpen: () => void;
}) => {
  return (
    <article className="flex items-start gap-3 p-4 border-b hover:bg-accent/30 transition-colors cursor-pointer" onClick={onOpen}>
      <Checkbox checked={checked} onCheckedChange={(v) => onCheck(!!v)} onClick={(e) => e.stopPropagation()} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {capture.platform && <Badge variant="secondary">{capture.platform}</Badge>}
          {typeof capture.predicted_virality === 'number' && (
            <Badge>{Math.round(capture.predicted_virality)}</Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(capture.created_at).toLocaleString()}
          </span>
        </div>
        <h4 className="font-medium truncate">{capture.title || 'Untitled capture'}</h4>
        {capture.content && (
          <p className="text-sm text-muted-foreground line-clamp-2">{capture.content}</p>
        )}
        {capture.url && (
          <a
            href={capture.url}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary mt-2"
          >
            Open source <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </article>
  );
};

export default CaptureCard;

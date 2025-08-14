import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import type { CaptureRow } from "@shared/database.types";

export default function CaptureDetailDrawer({ open, onOpenChange, capture }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  capture: CaptureRow | null;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            {capture?.platform && <Badge variant="secondary">{capture.platform}</Badge>}
            <span>{capture?.title || 'Capture detail'}</span>
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-6 pb-6 overflow-auto">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {capture?.content || 'No content.'}
          </p>
          {capture?.url && (
            <a href={capture.url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-primary text-sm">Open source</a>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

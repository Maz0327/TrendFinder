import { Button } from "@/components/ui/button";
import { PanelTop, Trash2 } from "lucide-react";

const BatchActionsBar = ({ selectedCount, onAddToBrief, onClear }: {
  selectedCount: number;
  onAddToBrief: () => void;
  onClear: () => void;
}) => {
  if (selectedCount === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-card border shadow-xl rounded-full px-4 py-2 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
        <Button size="sm" onClick={onAddToBrief}><PanelTop className="w-4 h-4 mr-1"/> Add to Brief</Button>
        <Button size="sm" variant="secondary" onClick={onClear}><Trash2 className="w-4 h-4 mr-1"/> Clear</Button>
      </div>
    </div>
  );
};

export default BatchActionsBar;

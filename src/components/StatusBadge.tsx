import { Badge } from "@/components/ui/badge";
import { PF_STATUS_LABEL, type PfStatus } from "@/lib/labels";
import { cn } from "@/lib/utils";

const STYLES: Record<PfStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/20 text-warning-foreground",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  archived: "bg-secondary text-secondary-foreground",
};

export function StatusBadge({ status }: { status: PfStatus }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", STYLES[status])}>
      {PF_STATUS_LABEL[status]}
    </Badge>
  );
}

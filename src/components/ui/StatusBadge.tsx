import { Badge } from "./Badge";
import type { PostStatus, PublicationStatus } from "@/types";

type AnyStatus = PostStatus | PublicationStatus;

const STATUS_CONFIG: Record<AnyStatus, { label: string; variant: "gray" | "blue" | "green" | "yellow" | "red" | "purple" | "indigo" }> = {
  draft: { label: "Draft", variant: "gray" },
  pending_approval: { label: "Pending Approval", variant: "yellow" },
  changes_requested: { label: "Changes Requested", variant: "yellow" },
  approved: { label: "Approved", variant: "green" },
  scheduled: { label: "Scheduled", variant: "blue" },
  publishing: { label: "Publishing…", variant: "indigo" },
  partially_published: { label: "Partial", variant: "yellow" },
  published: { label: "Published", variant: "green" },
  failed: { label: "Failed", variant: "red" },
  canceled: { label: "Canceled", variant: "gray" },
  // Publication-specific
  validated: { label: "Validated", variant: "blue" },
  queued: { label: "Queued", variant: "indigo" },
  processing: { label: "Processing", variant: "indigo" },
  retry_scheduled: { label: "Retrying", variant: "yellow" },
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "gray" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

import { dataStatusLabels } from "@/lib/config/model-config";
import type { DataStatus } from "@/lib/data/DataProvider";

const colorFor: Record<DataStatus, string> = {
  demo: "bg-elp-warn text-elp-bg",
  imported: "bg-elp-blue text-elp-text",
  "api-updated": "bg-elp-green text-elp-bg",
  stale: "bg-orange-500 text-elp-bg",
  error: "bg-elp-danger text-elp-text",
  "partially-verified": "bg-elp-purple text-elp-bg",
};

export function DataStatusBadge({
  status,
  lastUpdated,
}: {
  status: DataStatus;
  lastUpdated?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className={`rounded-full px-2 py-0.5 font-medium ${colorFor[status]}`}>
        {dataStatusLabels[status]}
      </span>
      {lastUpdated && (
        <span className="text-elp-muted">
          Opdateret {new Date(lastUpdated).toLocaleString("da-DK")}
        </span>
      )}
    </span>
  );
}

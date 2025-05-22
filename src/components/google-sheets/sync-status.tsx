/**
 * @fileoverview Google Sheets Sync Status Component
 *
 * This file implements a component for displaying and managing the synchronization
 * status between Google Sheets and the dental dashboard. It shows sync history,
 * current status, and provides controls for manual synchronization.
 */

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import * as React from "react";

/**
 * Sync status types
 */
type SyncStatus = "idle" | "syncing" | "success" | "error" | "scheduled";

/**
 * Interface for sync history entry
 *
 * @property {string} id - Unique identifier for the sync entry
 * @property {Date} timestamp - When the sync occurred
 * @property {SyncStatus} status - Result status of the sync
 * @property {string} [message] - Optional message or error description
 * @property {number} [rowsProcessed] - Number of data rows processed
 * @property {string} [spreadsheetName] - Name of the synced spreadsheet
 */
interface SyncHistoryEntry {
  id: string;
  timestamp: Date;
  status: SyncStatus;
  message?: string;
  rowsProcessed?: number;
  spreadsheetName?: string;
}

/**
 * Interface for SyncStatus component properties
 *
 * @property {SyncStatus} [status] - Current sync status
 * @property {number} [progress] - Sync progress percentage (0-100)
 * @property {Date} [lastSyncTime] - Timestamp of last successful sync
 * @property {Date} [nextScheduledSync] - Timestamp of next scheduled sync
 * @property {SyncHistoryEntry[]} [syncHistory] - History of recent syncs
 * @property {() => void} [onSyncNow] - Callback for manual sync initiation
 * @property {boolean} [isLoading] - Whether the component is in loading state
 */
interface SyncStatusProps {
  status?: SyncStatus;
  progress?: number;
  lastSyncTime?: Date;
  nextScheduledSync?: Date;
  syncHistory?: SyncHistoryEntry[];
  onSyncNow?: () => void;
  isLoading?: boolean;
}

/**
 * Sample sync history data for demonstration
 * This would be replaced with actual sync history in production.
 */
const sampleSyncHistory: SyncHistoryEntry[] = [
  {
    id: "sync-1",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    status: "success",
    message: "Sync completed successfully",
    rowsProcessed: 248,
    spreadsheetName: "Dental Practice Financial Data 2025",
  },
  {
    id: "sync-2",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    status: "error",
    message: "Error in column mapping: Invalid data type in column C",
    spreadsheetName: "Dental Practice Financial Data 2025",
  },
  {
    id: "sync-3",
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    status: "success",
    message: "Sync completed successfully",
    rowsProcessed: 245,
    spreadsheetName: "Dental Practice Financial Data 2025",
  },
];

/**
 * Sync Status Component
 *
 * A component for displaying and managing Google Sheets synchronization.
 * Features include:
 * - Current sync status with visual indicator
 * - Sync progress bar for active syncs
 * - Last successful sync timestamp
 * - Next scheduled sync information
 * - Sync history with expandable details
 * - Manual sync button
 *
 * @param {SyncStatusProps} props - Component properties
 * @returns {JSX.Element} The rendered sync status component
 */
export function SyncStatus({
  status = "idle",
  progress = 0,
  lastSyncTime,
  nextScheduledSync,
  syncHistory = sampleSyncHistory,
  onSyncNow,
  isLoading = false,
}: SyncStatusProps) {
  // Only show loading state if isLoading is true
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Synchronization Status</span>
          <SyncStatusBadge status={status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active sync progress */}
        {status === "syncing" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Syncing data...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Sync timing information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lastSyncTime && (
            <div className="text-sm">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" />
                <span>Last Successful Sync:</span>
              </div>
              <div className="font-medium">{lastSyncTime.toLocaleString()}</div>
            </div>
          )}

          {nextScheduledSync && (
            <div className="text-sm">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                <span>Next Scheduled Sync:</span>
              </div>
              <div className="font-medium">{nextScheduledSync.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Sync history accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="sync-history">
            <AccordionTrigger className="text-sm font-medium">Sync History</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {syncHistory.length > 0 ? (
                  syncHistory.map((entry) => <SyncHistoryItem key={entry.id} entry={entry} />)
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    No sync history available
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <CardFooter>
        {/* Manual sync button */}
        <Button
          onClick={onSyncNow}
          disabled={status === "syncing"}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${status === "syncing" ? "animate-spin" : ""}`} />
          Sync Now
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Sync Status Badge Component
 *
 * A visual indicator of the current sync status.
 *
 * @param {Object} props - Component properties
 * @param {SyncStatus} props.status - Current sync status
 * @returns {JSX.Element} The rendered status badge
 */
function SyncStatusBadge({ status }: { status: SyncStatus }) {
  switch (status) {
    case "success":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          Success
        </Badge>
      );
    case "syncing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
        >
          <XCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    case "scheduled":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
        >
          <Clock className="h-3 w-3" />
          Scheduled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1"
        >
          <Clock className="h-3 w-3" />
          Idle
        </Badge>
      );
  }
}

/**
 * Sync History Item Component
 *
 * Displays a single sync history entry with expandable details.
 *
 * @param {Object} props - Component properties
 * @param {SyncHistoryEntry} props.entry - Sync history entry to display
 * @returns {JSX.Element} The rendered sync history item
 */
function SyncHistoryItem({ entry }: { entry: SyncHistoryEntry }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Determine status icon based on sync status
  const StatusIcon = () => {
    switch (entry.status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="border rounded-md p-2">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <StatusIcon />
          <span className="text-sm font-medium">
            {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
      </div>

      {isExpanded && (
        <div className="mt-2 pl-6 text-sm space-y-1 text-muted-foreground">
          <p>Status: {entry.status}</p>
          {entry.spreadsheetName && <p>Spreadsheet: {entry.spreadsheetName}</p>}
          {entry.rowsProcessed && <p>Rows processed: {entry.rowsProcessed}</p>}
          {entry.message && <p>Message: {entry.message}</p>}
        </div>
      )}
    </div>
  );
}

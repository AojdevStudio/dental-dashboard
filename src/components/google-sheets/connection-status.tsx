/**
 * @fileoverview Google Sheets Connection Status Component
 *
 * This file implements a component for displaying the connection status between
 * the dental dashboard and a user's Google Sheets account. It provides visual
 * indicators of authentication status and connection health.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Link as LinkIcon, RefreshCw, XCircle } from "lucide-react";
import * as React from "react";

/**
 * Connection status types
 */
type ConnectionStatus = "connected" | "disconnected" | "expired" | "connecting" | "error";

/**
 * Interface for ConnectionStatus component properties
 *
 * @property {ConnectionStatus} [status] - Current connection status
 * @property {string} [accountName] - Connected Google account name
 * @property {string} [errorMessage] - Error message if status is "error"
 * @property {Date} [lastSyncTime] - Timestamp of last successful sync
 * @property {() => void} [onConnect] - Callback for initiating connection
 * @property {() => void} [onDisconnect] - Callback for disconnecting
 * @property {() => void} [onRefresh] - Callback for refreshing connection status
 * @property {boolean} [isLoading] - Whether the component is in loading state
 */
interface ConnectionStatusProps {
  status?: ConnectionStatus;
  accountName?: string;
  errorMessage?: string;
  lastSyncTime?: Date;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

/**
 * Connection Status Component
 *
 * A component for displaying the status of the Google Sheets integration.
 * Features include:
 * - Visual status indicators (connected, disconnected, error)
 * - Connected account information
 * - Last sync timestamp
 * - Connect, disconnect, and refresh actions
 *
 * @param {ConnectionStatusProps} props - Component properties
 * @returns {JSX.Element} The rendered connection status component
 */
export function ConnectionStatus({
  status = "disconnected",
  accountName,
  errorMessage,
  lastSyncTime,
  onConnect,
  onDisconnect,
  onRefresh,
  isLoading = false,
}: ConnectionStatusProps) {
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

  // Render different content based on connection status
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Google Sheets Connection</span>
          <ConnectionStatusBadge status={status} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connected account information */}
          {status === "connected" && accountName && (
            <div className="text-sm">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <span>Connected Account:</span>
              </div>
              <div className="font-medium">{accountName}</div>

              {lastSyncTime && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last synced: {lastSyncTime.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {status === "error" && errorMessage && (
            <div className="text-sm text-destructive">
              <p className="font-medium">Connection Error:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Expired token message */}
          {status === "expired" && (
            <div className="text-sm text-amber-500">
              <p>
                Your connection has expired. Please reconnect to continue using Google Sheets
                integration.
              </p>
            </div>
          )}

          {/* Action buttons based on status */}
          <div className="flex flex-wrap gap-2">
            {(status === "disconnected" || status === "expired" || status === "error") && (
              <Button onClick={onConnect} className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                Connect Google Sheets
              </Button>
            )}

            {status === "connected" && (
              <>
                <Button variant="outline" onClick={onRefresh} className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>

                <Button
                  variant="outline"
                  onClick={onDisconnect}
                  className="text-destructive hover:text-destructive flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Connection Status Badge Component
 *
 * A visual indicator of the current connection status.
 *
 * @param {Object} props - Component properties
 * @param {ConnectionStatus} props.status - Current connection status
 * @returns {JSX.Element} The rendered status badge
 */
function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case "connected":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          Connected
        </Badge>
      );
    case "connecting":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          Connecting
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
    case "expired":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
        >
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1"
        >
          <XCircle className="h-3 w-3" />
          Disconnected
        </Badge>
      );
  }
}

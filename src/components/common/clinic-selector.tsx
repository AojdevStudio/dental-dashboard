"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Clinic {
  id: string;
  name: string;
  location: string;
}

interface ClinicSelectorProps {
  currentClinicId?: string;
  clinics: Clinic[];
  onClinicChange?: (clinicId: string) => void;
  className?: string;
}

export function ClinicSelector({
  currentClinicId,
  clinics,
  onClinicChange,
  className,
}: ClinicSelectorProps) {
  const router = useRouter();
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    currentClinicId || clinics[0]?.id || ""
  );

  useEffect(() => {
    if (currentClinicId && currentClinicId !== selectedClinicId) {
      setSelectedClinicId(currentClinicId);
    }
  }, [currentClinicId, selectedClinicId]);

  const handleClinicChange = async (clinicId: string) => {
    setSelectedClinicId(clinicId);

    try {
      // Call API to update selected clinic on server
      const response = await fetch("/api/clinics/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clinicId }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch clinic");
      }

      // Store selected clinic in session storage as backup
      sessionStorage.setItem("selectedClinicId", clinicId);

      // Call the onChange callback if provided
      if (onClinicChange) {
        onClinicChange(clinicId);
      }

      // Trigger a page refresh to update context
      router.refresh();
    } catch (error) {
      console.error("Error switching clinic:", error);
      // Revert selection on error
      setSelectedClinicId(currentClinicId || clinics[0]?.id || "");
    }
  };

  // Don't render if user only has access to one clinic
  if (clinics.length <= 1) {
    return null;
  }

  const selectedClinic = clinics.find((c) => c.id === selectedClinicId);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedClinicId} onValueChange={handleClinicChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {selectedClinic ? (
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{selectedClinic.name}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedClinic.location}
                </span>
              </div>
            ) : (
              "Select clinic..."
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-medium">
            All Clinics
          </SelectItem>
          <div className="my-1 h-px bg-border" />
          {clinics.map((clinic) => (
            <SelectItem key={clinic.id} value={clinic.id}>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{clinic.name}</span>
                <span className="text-xs text-muted-foreground">
                  {clinic.location}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
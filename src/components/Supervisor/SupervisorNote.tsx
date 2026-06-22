// app/supervisor/dashboard/components/SupervisorNote.tsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function SupervisorNote() {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
        For more than 3 groups, supervisors are required to take approval from
        the department.
      </AlertDescription>
    </Alert>
  );
}

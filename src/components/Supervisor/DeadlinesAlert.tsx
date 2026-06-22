// app/supervisor/dashboard/components/DeadlinesAlert.tsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "lucide-react";

export function DeadlinesAlert() {
  return (
    <Alert className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
        Active Deadlines: Group Creation: Jan 10 - Feb 20, 2026 (active) | Mid
        Evidence: Mar 10-25 | Final: May 1-30
      </AlertDescription>
    </Alert>
  );
}

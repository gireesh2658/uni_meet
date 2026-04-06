import React from "react";
import { AlertTriangle } from "lucide-react";

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
    <AlertTriangle className="h-5 w-5 shrink-0" />
    <span>{message}</span>
  </div>
);

export default ErrorMessage;

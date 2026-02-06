import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * Loading spinner component with optional message
 */
export function Loading({
  message = "Loading...",
  size = "md",
  className = "",
}: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600 dark:text-indigo-400`} />
      {message && <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>}
    </div>
  );
}

/**
 * Full page loading state
 */
export function PageLoading({ message }: { message?: string }) {
  return (
    <main className="flex min-h-[50vh] items-center justify-center p-8">
      <Loading message={message} size="lg" />
    </main>
  );
}

import { cn } from "~/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div class={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };

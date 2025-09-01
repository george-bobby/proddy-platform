import { cn } from "@/lib/utils";

/**
 * A simple skeleton placeholder — a pulsing, rounded, muted block.
 *
 * Renders a div with the base classes "animate-pulse rounded-md bg-muted" and merges any provided `className`.
 * All other HTMLDivElement attributes and event handlers passed in `props` are forwarded to the div.
 *
 * @param className - Additional CSS classes to merge with the component's base classes.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };

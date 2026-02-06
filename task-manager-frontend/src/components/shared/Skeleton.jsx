import { cn } from "../../lib/utils";

/**
 * A reusable Skeleton component for loading states.
 * Uses a pulse animation with a subtle gradient matching the theme.
 */
export default function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-white/5 dark:bg-white/5 bg-black/5",
                className
            )}
            {...props}
        />
    );
}

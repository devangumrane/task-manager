import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
);

DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-xl border bg-background p-6 shadow-xl",
          "data-[state=open]:animate-in data-[state=open]:zoom-in-90 data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 data-[state=closed]:fade-out-0",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);

DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 mb-4", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex justify-end gap-2 mt-4", className)} {...props} />
);

export const DialogTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-xl font-semibold", className)}
      {...props}
    />
  )
);

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);

DialogDescription.displayName = "DialogDescription";

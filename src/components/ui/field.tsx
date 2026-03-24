"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
  contentClassName,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-md border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset",
        className
      )}
    >
      <div className="pointer-events-none absolute -top-2 left-2 bg-background px-1 text-[10px] font-medium text-muted-foreground">
        {label}
      </div>
      <div className={cn("px-2 py-1.5", contentClassName)}>{children}</div>
    </div>
  );
}


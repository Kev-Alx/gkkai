"use client";

import { cn } from "@/lib/utils";

import { Toolbar } from "./toolbar";
import { useEditorReadOnly } from "platejs/react";

export function FixedToolbar(props: React.ComponentProps<typeof Toolbar>) {
  const readOnly = useEditorReadOnly();
  return (
    <Toolbar
      {...props}
      className={cn(
        "sticky top-0 left-0 z-50 scrollbar-hide w-full justify-between overflow-x-auto rounded-xs border border-border bg-background/95 p-1 backdrop-blur-sm supports-backdrop-blur:bg-background/60",
        readOnly && "hidden",
        props.className
      )}
    />
  );
}

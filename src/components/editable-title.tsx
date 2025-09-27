"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

import { cn } from "@/lib/utils"; // Your utility for merging class names
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the props for the component
interface EditableTitleProps {
  initialTitle: string;
  onTitleChange: (newTitle: string) => void;
  // Allows custom styling for the container
  className?: string;
  // Optional prop to change the heading tag for semantics (h1, h2, h3, etc.)
  as?: React.ElementType;
}

export const EditableTitle = ({
  initialTitle,
  onTitleChange,
  className,
  as: Tag = "h2", // Default to <h2> if not provided
}: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field when the component enters editing mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select(); // Select all text for easy replacement
    }
  }, [isEditing]);

  // Handle saving the title
  const handleSave = () => {
    // Only call the update function if the title has actually changed
    if (title.trim() && title !== initialTitle) {
      onTitleChange(title.trim());
    } else {
      // If the new title is empty, revert to the original
      setTitle(initialTitle);
    }
    setIsEditing(false);
  };

  // Handle key presses for Enter (save) and Escape (cancel)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(initialTitle); // Revert changes
      setIsEditing(false);
    }
  };

  return (
    <div className={cn("relative w-fit", className)}>
      {isEditing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave} // Save when the input loses focus
          onKeyDown={handleKeyDown}
          className="text-2xl selection:bg-primary selection:text-background font-medium tracking-tight outline-none w-fit ring-none" // Match heading style
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="group flex cursor-pointer items-center gap-2"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setIsEditing(true)}
        >
          <Tag className="text-2xl font-medium tracking-tight">{title}</Tag>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Edit title"
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

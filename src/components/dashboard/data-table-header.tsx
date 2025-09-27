"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, SlidersHorizontal, View, XIcon, PlusIcon } from "lucide-react";
import { Toggle } from "../ui/toggle";

/** Shape of a single filter rule */
export interface Filter {
  id: number;
  column: string;
  rule: string;
  value: string;
}

interface DataTableHeaderProps {
  /** Columns that can be toggled/filtered */
  columns: { key: string; label: string }[];
  /** Fired whenever the search query changes */
  onSearchChange: (query: string) => void;
  /** Fired whenever column visibility changes */
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
  /** Fired whenever filters change */
  onFilterChange: (filters: Filter[]) => void;
}

const filterRules = [
  { key: "equals", label: "is equal to" },
  { key: "contains", label: "contains" },
  { key: "startsWith", label: "starts with" },
  { key: "endsWith", label: "ends with" },
  { key: "isNot", label: "is not" },
];

export default function DataTableHeader({
  columns,
  onSearchChange,
  onColumnVisibilityChange,
  onFilterChange,
}: DataTableHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // initial visibility: all columns visible
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}));

  const [filters, setFilters] = useState<Filter[]>([]);

  const handleAddFilter = () => {
    const newFilters = [
      ...filters,
      {
        id: Date.now(),
        column: columns[0]?.key || "",
        rule: "equals",
        value: "",
      },
    ];
    setFilters(newFilters);
    onFilterChange(newFilters);
    setOpenAccordion("filters");
  };

  const handleRemoveFilter = (id: number) => {
    const newFilters = filters.filter((f) => f.id !== id);
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (
    id: number,
    field: keyof Omit<Filter, "id">,
    value: string
  ) => {
    const newFilters = filters.map((f) =>
      f.id === id ? { ...f, [field]: value } : f
    );
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColumnVisibilityChange = (key: string, checked: boolean) => {
    const newVisibility = { ...columnVisibility, [key]: checked };
    setColumnVisibility(newVisibility);
    onColumnVisibilityChange(newVisibility);
  };

  return (
    <div className="py-4 w-full space-y-2 bg-card text-card-foreground">
      {/* Search + Actions */}
      <div className="flex items-center bg-muted relative rounded">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearchChange(e.target.value);
          }}
          className="flex-grow w-full min-w-[200px] bg-transparent rounded-xs border-none shadow-none"
        />
        <div className="flex gap-1 absolute right-0.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setOpenAccordion(openAccordion === "columns" ? null : "columns")
            }
            className="rounded-none"
          >
            <View className="mr-2 h-4 w-4" />
            Columns
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setOpenAccordion(openAccordion === "filters" ? null : "filters")
            }
            className="rounded-none"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Collapsible Controls */}
      <Accordion
        type="single"
        collapsible
        value={openAccordion || ""}
        onValueChange={setOpenAccordion}
      >
        {/* Column Picker */}
        <AccordionItem value="columns" className="border-none">
          <AccordionContent className="p-4 mt-2 border rounded-md">
            <p className="mb-4 text-sm font-medium">Toggle column visibility</p>
            <div className="flex flex-wrap gap-2">
              {columns.map((col) => (
                <Toggle
                  key={col.key}
                  className="data-[state=off]:border"
                  pressed={columnVisibility[col.key]}
                  onPressedChange={(checked) =>
                    handleColumnVisibilityChange(col.key, !!checked)
                  }
                >
                  {col.label}
                  {columnVisibility[col.key] ? <XIcon /> : <PlusIcon />}
                </Toggle>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Filters */}
        <AccordionItem value="filters" className="border-none">
          <AccordionContent className="p-4 mt-2 border rounded-md space-y-1.5">
            {filters.map((filter, idx) => (
              <div key={filter.id}>
                {idx > 0 && (
                  <span className="m-2 text-muted-foreground">OR</span>
                )}
                <div className="grid grid-cols-[1fr_1rem] items-center gap-2 p-2">
                  <div className="w-full grid gap-2 grid-cols-1 lg:grid-cols-3">
                    {/* Column select */}
                    <Select
                      value={filter.column}
                      onValueChange={(value) =>
                        handleFilterChange(filter.id, "column", value)
                      }
                    >
                      <SelectTrigger className="w-full rounded-xs min-w-[150px]">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col.key} value={col.key}>
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Rule select */}
                    <Select
                      value={filter.rule}
                      onValueChange={(value) =>
                        handleFilterChange(filter.id, "rule", value)
                      }
                    >
                      <SelectTrigger className="w-full rounded-xs min-w-[150px]">
                        <SelectValue placeholder="Select rule" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterRules.map((rule) => (
                          <SelectItem key={rule.key} value={rule.key}>
                            {rule.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value input */}
                    <Input
                      placeholder="Value..."
                      value={filter.value}
                      onChange={(e) =>
                        handleFilterChange(filter.id, "value", e.target.value)
                      }
                      className="w-full rounded-xs min-w-[150px]"
                    />
                  </div>
                  <div className="h-full flex flex-col justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFilter(filter.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddFilter}>
              Add Filter
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import DataTableHeader from "./data-table-header";
// import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";

// Filter shape
interface Filter {
  id: number;
  column: string;
  rule: string;
  value: string;
}

interface DataTableProps<T extends object> {
  data: T[];
  include?: (keyof T)[];
  omit?: (keyof T)[];
  labels?: Partial<Record<keyof T, string>>;
  target?: string;
  /** Optional custom cell renderer per column */
  renderers?: Partial<Record<keyof T, (value: any, row: T) => React.ReactNode>>;
}

/**
 * A completely generic DataTable:
 * - works with any Drizzle schema/table
 * - supports column toggling, search, and advanced filters
 */
export default function DataTable<T extends object>({
  data,
  include,
  omit,
  labels = {},
  target,
  renderers, // <— NEW
}: DataTableProps<T>) {
  const sample = data[0] ?? {};
  const allKeys = Object.keys(sample) as (keyof T)[];
  const effectiveKeys =
    include && include.length > 0
      ? include
      : allKeys.filter((k) => !(omit ?? []).includes(k));

  const columns = effectiveKeys.map((k) => ({
    key: String(k),
    label: labels[k] ?? startCase(String(k)),
  }));

  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(columns.reduce((acc, c) => ({ ...acc, [c.key]: true }), {}));
  const [filters, setFilters] = useState<Filter[]>([]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch = searchQuery
        ? columns.some((col) =>
            String((row as any)[col.key] ?? "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        : true;
      const matchesFilters = filters.every((f) => {
        const val = String((row as any)[f.column] ?? "").toLowerCase();
        const cmp = f.value.toLowerCase();
        switch (f.rule) {
          case "equals":
            return val === cmp;
          case "contains":
            return val.includes(cmp);
          case "startsWith":
            return val.startsWith(cmp);
          case "endsWith":
            return val.endsWith(cmp);
          case "isNot":
            return val !== cmp;
          default:
            return true;
        }
      });
      return matchesSearch && matchesFilters;
    });
  }, [data, searchQuery, filters, columns]);

  return (
    <div className="space-y-4">
      <DataTableHeader
        columns={columns}
        onSearchChange={setSearchQuery}
        onColumnVisibilityChange={setColumnVisibility}
        onFilterChange={setFilters}
      />
      <div className="overflow-x-auto border w-full rounded-xs">
        <Table className="w-full border-collapse ">
          <TableHeader className="bg-muted text-left ">
            <TableRow>
              {columns
                .filter((c) => columnVisibility[c.key])
                .map((col) => (
                  <TableHead key={col.key} className="px-4 py-2 border-b">
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-4 py-3 text-center text-muted-foreground"
                >
                  {data.length > 0
                    ? "No matching results"
                    : "Collection is empty"}
                </TableCell>
              </TableRow>
            )}
            {filteredData.map((row, idx) => (
              <TableRow key={idx} className="border-b hover:bg-accent">
                {columns
                  .filter((c) => columnVisibility[c.key])
                  .map((col, colIdx) => {
                    const renderer = renderers?.[col.key as keyof T];
                    const raw = (row as any)[col.key];
                    const rendered = renderer
                      ? renderer(raw, row)
                      : String(raw ?? "");
                    return (
                      <TableCell key={col.key} className="px-4 py-2">
                        {colIdx === 0 && target ? (
                          <Link
                            className="hover:underline font-medium"
                            //@ts-expect-error males
                            href={`/dashboard/${target}/${data.at(idx).id}`}
                          >
                            {rendered}
                          </Link>
                        ) : (
                          rendered
                        )}
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Small helper to format keys nicely (e.g. signupDate -> Signup Date)
function startCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

"use client";
import DataTable from "@/components/dashboard/data-table";
import React from "react";
import type { InferSelectModel } from "drizzle-orm";
import { documents } from "@/db/schema";
import { format } from "date-fns";

export type Document = InferSelectModel<typeof documents>;

type Props = {
  data: Document[];
  omit?: (keyof Document)[];
  include?: (keyof Document)[];
  labels?: Partial<Record<keyof Document, string>>;
};

const TableClient = (props: Props) => {
  return (
    <DataTable
      target="warta"
      data={props.data}
      omit={props.omit} // hide sensitive columns
      labels={props.labels}
      renderers={{
        publishDate: (value) => {
          if (!value) return "";
          return format(new Date(value), "PPP");
        },
      }}
    />
  );
};

export default TableClient;

"use client";
import DataTable from "@/components/dashboard/data-table";
import React from "react";
import type { InferSelectModel } from "drizzle-orm";
import { events } from "@/db/schema";
import { format } from "date-fns";

export type Event = InferSelectModel<typeof events>;

type Props = {
  data: Event[];
  omit?: (keyof Event)[];
  include?: (keyof Event)[];
  labels?: Partial<Record<keyof Event, string>>;
};

const TableClient = (props: Props) => {
  return (
    <DataTable
      data={props.data}
      omit={props.omit} // hide sensitive columns
      labels={props.labels}
      target="event"
      renderers={{
        endDate: (value) => {
          if (!value) return "";
          return format(new Date(value), "PPP");
        },
        startDate: (value) => {
          if (!value) return "";
          return format(new Date(value), "PPP");
        },
      }}
    />
  );
};

export default TableClient;

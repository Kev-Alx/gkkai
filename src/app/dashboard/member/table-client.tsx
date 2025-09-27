"use client";
import DataTable from "@/components/dashboard/data-table";
import React from "react";
import type { InferSelectModel } from "drizzle-orm";
import { user } from "@/db/schema";
import { format } from "date-fns";

export type User = InferSelectModel<typeof user>;

type Props = {
  data: User[];
  omit?: (keyof User)[];
  include?: (keyof User)[];
  labels?: Partial<Record<keyof User, string>>;
};

const TableClient = (props: Props) => {
  return (
    <DataTable
      data={props.data}
      omit={props.omit} // hide sensitive columns
      labels={props.labels}
      target="member"
      renderers={{
        image: (value) => {
          return (
            <img
              src={value || "/default-profile.png"}
              alt="User Avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
          );
        },
        createdAt: (value) => format(new Date(value), "PPP"),
        updatedAt: (value) => format(new Date(value), "PPP"),
      }}
    />
  );
};

export default TableClient;

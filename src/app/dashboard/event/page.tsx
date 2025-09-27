import Header from "@/components/dashboard/header";
import { db } from "@/db";
import { events } from "@/db/schema";
import React from "react";
import TableClient from "./table-client";

type Props = {};

const page = async (props: Props) => {
  const data = await db.select().from(events);

  return (
    <div className="px-12">
      <Header title="Event" createLink="/dashboard/event/create" />
      <TableClient data={data} omit={["id"]} />
    </div>
  );
};

export default page;

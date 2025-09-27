import Header from "@/components/dashboard/header";
import { db } from "@/db";
import { documents } from "@/db/schema";
import React from "react";
import TableClient from "./table-client";

type Props = {};

const page = async (props: Props) => {
  const data = await db.select().from(documents);
  return (
    <div className="px-12">
      <Header title="Warta" createLink="/dashboard/warta/create" />
      <TableClient data={data} omit={["id", "content"]} />
    </div>
  );
};

export default page;

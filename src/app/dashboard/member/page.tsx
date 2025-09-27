import { db } from "@/db";
import { user } from "@/db/schema";
import Header from "@/components/dashboard/header";
import TableClient from "./table-client";

export default async function ProductsPage() {
  const data = await db.select().from(user);
  // console.log(data);
  return (
    <div className="px-12">
      <Header title="Member" />
      <TableClient
        data={data}
        omit={["banned", "banReason", "banExpiresAt", "id"]}
      />
    </div>
  );
}

import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import React from "react";

type Props = {};

const page = async (props: Props) => {
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.isPublished, true));
  return (
    <div>
      <h1>Documents</h1>
      {docs.map((doc) => {
        return (
          <Link key={doc.id} href={`/documents/${doc.slug}`}>
            {doc.title}
          </Link>
        );
      })}
    </div>
  );
};

export default page;

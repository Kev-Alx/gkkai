"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getUsers = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");

  const canReadAll = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        member: ["read-all"], // From your permissions.ts file
      },
    },
  });
  if (!canReadAll.success) {
    throw new Error("Forbidden");
  }
  try {
    const allUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt); // Order by creation date, for example

    return { success: true, users: allUsers };
  } catch (error: any) {
    console.error("Error fetching users:", error.message);
    return { success: false, error: error.message };
  }
};

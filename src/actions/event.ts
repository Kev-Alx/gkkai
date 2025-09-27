"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { events } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { saveFile } from "@/lib/upload";

export type UpdateEventPayload = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date: Date;
  heroImage?: File | null;
};

export const getEvents = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");

  try {
    const allEvents = await db.select().from(events).orderBy(events.startDate);
    return { status: 200, events: allEvents };
  } catch (error: any) {
    console.error("Error fetching users:", error.message);
    return { status: 400, error: error.message };
  }
});

export const getEvent = cache(async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");

  try {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return { status: 200, event };
  } catch (error: any) {
    console.error("Error fetching event:", error.message);
    return { status: 400, error: error.message };
  }
});

export const createEvent = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");

  try {
    const [event] = await db
      .insert(events)
      .values({
        eventName: "Unnamed",
        startDate: new Date(),
      })
      .returning();

    return { status: 200, id: event.id };
  } catch (error) {
    console.log(error);
    return { status: 400, error: error };
  }
};

export const updateEvent = async (payload: UpdateEventPayload) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");
  try {
    let heroImageUrl: string | null = null;

    if (payload.heroImage) {
      const uploaded = await saveFile(payload.heroImage);
      heroImageUrl = uploaded.url;
    }

    await db
      .update(events)
      .set({
        description: payload.description,
        startDate: payload.date,
        location: payload.location,
        eventName: payload.title,
        posterImage: heroImageUrl || undefined,
      })
      .where(eq(events.id, payload.id));
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 400, error: error };
  }
};

export const deleteEvent = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");
  try {
    await db.delete(events).where(eq(events.id, id));
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 400, error: error };
  }
};

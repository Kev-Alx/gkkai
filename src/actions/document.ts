"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { saveFile } from "@/lib/upload";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UpdateAnnouncementInput = {
  id: string;
  title?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishDate?: Date | null;
  authorId?: string | null;
  slug?: string;
  heroImage?: File | null;
  isPublished?: boolean;
};

export const getDocument = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");

  try {
    const warta = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (warta.length === 0) {
      throw new Error("Warta not found");
    }

    return { status: 200, warta: warta[0] };
  } catch (error) {
    console.log(error);
    return { status: 400, error: error };
  }
};

export const createWarta = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");

  try {
    const [announcement] = await db
      .insert(documents)
      .values({
        title: "Untitled",
        content: "[]",
        isPublished: false,
      })
      .returning();
    return { status: 200, id: announcement.id };
  } catch (error) {
    console.log(error);
    return { status: 400, error: error };
  }
};

export const updateDocument = async (payload: UpdateAnnouncementInput) => {
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
      .update(documents)
      .set({
        title: payload.title,
        content: payload.content,
        seoTitle: payload.seoTitle,
        seoDescription: payload.seoDescription,
        publishDate: payload.publishDate,
        authorId: payload.authorId,
        slug: payload.slug,
        heroImage: heroImageUrl || undefined,
        isPublished: payload.isPublished,
      })
      .where(eq(documents.id, payload.id));
    return { status: 200, id: payload.id };
  } catch (error) {
    console.log(error);
    return { status: 400, error: error };
  }
};

export const deleteDocument = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) throw new Error("Unauthorized");

  try {
    await db.delete(documents).where(eq(documents.id, id));
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 400, error: error };
  }
};

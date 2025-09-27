import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { createSlateEditor, PlateStatic } from "platejs";

interface PageProps {
  params: { slug: string };
}
export default async function DocumentPage({ params }: PageProps) {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.slug, params.slug));

  if (!doc) {
    notFound();
  }

  // Create a static editor instance on the server
  const editor = createSlateEditor({
    plugins: BaseEditorKit, // base plugins (headings, lists, etc.)
    // components: staticComponents, // server-safe components
    value: doc.content as any, // your Slate JSON value
  });

  return (
    <div className="max-w-3xl mx-auto py-10 prose">
      <h1 className="mb-6 text-3xl font-bold">{doc.title}</h1>

      {/* Static, server-rendered Plate content */}
      <PlateStatic
        editor={editor}
        // className="plate-static"
        // Optional: you can pass a value prop if you prefer overriding editor.children
        // value={doc.content}
      />
    </div>
  );
}

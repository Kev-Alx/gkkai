import { redirect } from "next/navigation";
import { createWarta } from "@/actions/document";

export default async function CreateWartaPage() {
  // 1. Directly call and await the server action.
  const result = await createWarta();

  // 2. If successful, redirect the user to the new page.
  // This happens on the server by sending a redirect response to the browser.
  if (result.status === 200 && result.id) {
    redirect(`/dashboard/warta/${result.id}`);
  } else {
    // Handle potential errors from the action
    console.error("Failed to create announcement:", result.error);
    redirect("/dashboard/warta?error=creation_failed");
  }
}

import { redirect } from "next/navigation";
import { createEvent } from "@/actions/event";

export default async function CreateWartaPage() {
  const result = await createEvent();
  if (result.status === 200 && result.id) {
    redirect(`/dashboard/event/${result.id}`);
  } else {
    // Handle potential errors from the action
    console.error("Failed to create announcement:", result.error);
    redirect("/dashboard/event?error=creation_failed");
  }
}

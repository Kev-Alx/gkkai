"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  deleteEvent,
  getEvent,
  updateEvent,
  UpdateEventPayload,
} from "@/actions/event";
import { EditableTitle } from "@/components/editable-title";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, TrashIcon, Upload, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from "@/components/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";

// --------------------
// Validation Schema
// --------------------
const FormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.date({ error: "Please select a date" }),
});

type FormValues = z.infer<typeof FormSchema>;

const EventPage = () => {
  const pathname = usePathname();
  const id = pathname.split("/").at(-1);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [existingHeroImage, setExistingHeroImage] = useState<string | null>(
    null
  );
  const [isDeleted, setIsDeleted] = useState(false);

  const {
    data: eventData,
    isLoading: isEventLoading,
    error: eventError,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const result = await getEvent(id);
      if (result.status !== 200) throw new Error("Failed to fetch event");
      return result.event;
    },
    enabled: !!id && !isDeleted,
  });
  // --------------------
  // File validation
  // --------------------
  const onFileValidate = useCallback((file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed";
    }
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  }, []);

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: undefined,
    },
  });

  useEffect(() => {
    if (eventData) {
      form.reset({
        title: eventData.eventName ?? "",
        description: eventData.description ?? "",
        location: eventData.location ?? "",
        date: eventData.startDate ? new Date(eventData.startDate) : undefined,
      });
    }
  }, [eventData, form]);
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (payload: UpdateEventPayload) => updateEvent(payload),
    onSuccess: async () => {
      toast.success("Event updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
    onError: (err: any) => {
      toast.error("Failed to update event", {
        description: err?.message ?? "Unknown error",
      });
    },
  });

  const { mutate: deleteEventMutate, isPending: eventDeletePending } =
    useMutation({
      mutationFn: async (id: string) => {
        const ok = await confirm();
        if (!ok) return;
        return await deleteEvent(id);
      },
      onSuccess: async (result) => {
        if (result?.status === 200) {
          setIsDeleted(true);
          await queryClient.cancelQueries({ queryKey: ["event", id] });
          queryClient.removeQueries({ queryKey: ["event", id] });
          queryClient.invalidateQueries({ queryKey: ["event"] });
          router.push("/dashboard/event");
          toast.success("Event deleted succesfully.");
        } else {
          toast.error("Failed to delete event.");
        }
      },
      onError: (err) => {
        console.error(err);
        toast.error("Error deleting event");
      },
    });

  const handleDelete = useCallback(
    async (id: string) => {
      if (!id) {
        toast.error("No event ID available");
        return;
      }
      deleteEventMutate(id);
    },
    [id]
  );
  const onSubmit = (values: FormValues) => {
    if (!id) {
      toast.error("Missing event ID");
      return;
    }
    mutation.mutate({
      id,
      title: values.title,
      description: values.description,
      location: values.location,
      date: values.date,
      heroImage: file, // optional File object
    });
  };
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Event?",
    `This action cannot be undone. This will permanently delete "${eventData?.eventName}".`
  );
  if (eventError)
    return (
      <main className="px-12 py-4">
        <h2 className="font-medium text-xl">Event not found.</h2>
      </main>
    );

  return (
    <main>
      <ConfirmDialog />
      <div className="px-12 border-y py-2 flex justify-between">
        {isEventLoading ? (
          <Skeleton className="w-full h-9" />
        ) : (
          <EditableTitle
            initialTitle={eventData?.eventName ?? "Untitled"}
            onTitleChange={(value) => form.setValue("title", value)}
          />
        )}
        <div className="flex gap-2">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Event"}
          </Button>
          <Button
            variant={"outline"}
            onClick={() => handleDelete(id as string)}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      {/* ---------- BODY ---------- */}
      {isEventLoading ? (
        <div className="px-12 py-4 space-y-3">
          <Skeleton className="w-full max-w-2xl h-24" />
          <Skeleton className="w-full max-w-2xl h-12" />
          <Skeleton className="w-full max-w-2xl h-12" />
          <Skeleton className="w-full max-w-2xl h-12" />
        </div>
      ) : (
        <div className="px-12">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-2xl py-4 space-y-6"
            >
              {/* ---------- Hero Image Upload ---------- */}
              <FileUpload
                value={file ? [file] : []}
                onValueChange={(files) => setFile(files[0] ?? null)}
                onFileValidate={onFileValidate}
                onFileReject={onFileReject}
                accept="image/*"
                disabled={file !== null}
                maxFiles={1}
                className="w-full p-0"
              >
                {!file && !existingHeroImage && (
                  <FileUploadDropzone
                    className={cn(
                      file !== null &&
                        "bg-muted-foreground/5 py-0 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center py-1 gap-1">
                      <div className="flex items-center justify-center rounded-full border p-2.5 mr-4">
                        <Upload className="size-5 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">
                        Drag & drop an image
                      </p>
                      <p className="text-muted-foreground text-xs">
                        (Max 10MB)
                      </p>
                    </div>
                  </FileUploadDropzone>
                )}

                {/* Existing image */}
                {!file && existingHeroImage && (
                  <div className="relative border rounded-lg p-2 flex items-center gap-3">
                    <img
                      src={existingHeroImage}
                      alt="Current hero image"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Current hero image</p>
                      <p className="text-muted-foreground text-xs">
                        Click to replace
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setExistingHeroImage(null)}
                      type="button"
                    >
                      <XIcon />
                    </Button>
                  </div>
                )}

                <FileUploadList>
                  {file && (
                    <FileUploadItem value={file}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <XIcon />
                        </Button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  )}
                </FileUploadList>
              </FileUpload>

              {/* ---------- Description ---------- */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ---------- Location ---------- */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ---------- Date Picker ---------- */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "Select date"}
                            <CalendarIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      )}
    </main>
  );
};

export default EventPage;

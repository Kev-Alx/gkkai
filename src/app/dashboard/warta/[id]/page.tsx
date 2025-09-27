"use client";
import { EditableTitle } from "@/components/editable-title";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useCallback, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TrashIcon, Upload, XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers } from "@/actions/user";
import {
  deleteDocument,
  getDocument,
  updateDocument,
} from "@/actions/document"; // Adjust import path
import { PlateEditor } from "@/components/editor/plate-editor";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
} from "@/components/file-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { usePlateEditor } from "platejs/react";
import { EditorKit } from "@/components/editor/editor-kit";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";

const page = () => {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const id = pathname.split("/").at(-1);

  // Form state
  const [title, setTitle] = useState<string>("Untitled");
  const [content, setContent] = useState<any>([]);
  const [seoTitle, setSeoTitle] = useState<string>("");
  const [seoDescription, setSeoDescription] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [authorId, setAuthorId] = useState<string | undefined>();
  const [slug, setSlug] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [existingHeroImage, setExistingHeroImage] = useState<string | null>(
    null
  );
  const [open, setOpen] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: content ? content : undefined,
  });
  const {
    data: wartaData,
    isLoading: isWartaLoading,
    error: wartaError,
  } = useQuery({
    queryKey: ["warta", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const result = await getDocument(id);
      if (result.status !== 200) throw new Error("Failed to fetch warta");
      return result.warta;
    },
    enabled: !!id && !isDeleted,
  });
  const {
    data: usersData,
    isLoading: areUsersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => getUsers(),
  });

  // Update warta mutation
  const updateMutation = useMutation({
    mutationFn: updateDocument,
    onSuccess: (result) => {
      if (result.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["warta", id] });
        toast.success("Warta saved successfully");
      } else {
        toast.error("Failed to save warta");
      }
    },
    onError: () => {
      toast.error("Failed to save warta");
    },
  });

  // Initialize form with existing data
  useEffect(() => {
    if (wartaData) {
      setTitle(wartaData.title || "Untitled");
      setContent(wartaData.content || []);
      setSeoTitle(wartaData.seoTitle || "");
      setSeoDescription(wartaData.seoDescription || "");
      setDate(
        wartaData.publishDate ? new Date(wartaData.publishDate) : undefined
      );
      setAuthorId(wartaData.authorId || undefined);
      setSlug(wartaData.slug || "");
      setExistingHeroImage(wartaData.heroImage || null);
      setIsPublished(!!wartaData.isPublished);
      // Update editor content
      if (wartaData.content) {
        try {
          editor.tf.setValue(wartaData.content as any);
        } catch (error) {
          console.error("Failed to parse content:", error);
        }
      }
    }
  }, [wartaData, editor]);

  // Save function
  const handleSave = useCallback(
    async (action: "draft" | "publish" | "unpublish") => {
      if (!id) {
        toast.error("No warta ID available");
        return;
      }

      let publishState: boolean | undefined;

      if (action === "draft") {
        // ✅ If already published, saving as draft will NOT unpublish
        publishState = isPublished ? true : false;
      } else if (action === "publish") {
        publishState = true;
      } else if (action === "unpublish") {
        publishState = false;
      }

      updateMutation.mutate(
        {
          id: id,
          title,
          content: JSON.stringify(editor.children),
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          publishDate: date || null,
          authorId: authorId || null,
          slug: slug || undefined,
          heroImage: file,
          isPublished: publishState,
        },
        {
          onSuccess: (res) => {
            if (res.status === 200) {
              if (action === "unpublish") {
                setIsPublished(false);
                toast.success("Warta unpublished successfully");
              } else if (action === "publish") {
                setIsPublished(true);
                toast.success("Warta published successfully");
              } else {
                toast.success("Draft saved successfully");
              }
            }
          },
        }
      );
    },
    [
      id,
      title,
      seoTitle,
      seoDescription,
      date,
      authorId,
      slug,
      file,
      editor,
      isPublished,
      updateMutation,
    ]
  );
  const router = useRouter();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Document?",
    `This action cannot be undone. This will permanently delete "${wartaData?.title}".`
  );
  const { mutate: deleteDocumentMutate, isPending: eventDeletePending } =
    useMutation({
      mutationFn: async (id: string) => {
        const ok = await confirm();
        if (!ok) return;
        return await deleteDocument(id);
      },
      onSuccess: async (result) => {
        if (result?.status === 200) {
          setIsDeleted(true);
          await queryClient.cancelQueries({ queryKey: ["warta", id] });
          queryClient.removeQueries({ queryKey: ["warta", id] });
          queryClient.invalidateQueries({ queryKey: ["warta"] });
          router.push("/dashboard/warta");
          toast.success("Document deleted succesfully.");
        } else {
          toast.error("Failed to delete document.");
        }
      },
      onError: (err) => {
        console.error(err);
        toast.error("Error deleting document");
      },
    });

  const handleDelete = useCallback(
    async (id: string) => {
      if (!id) {
        toast.error("No document ID available");
        return;
      }
      deleteDocumentMutate(id);
    },
    [id]
  );
  // File validation
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

  return (
    <main className="">
      <ConfirmDialog />
      <div className="px-12 border-y py-2 flex justify-between">
        <EditableTitle initialTitle={title} onTitleChange={setTitle} />
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            onClick={() => handleSave("draft")}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save as draft"}
          </Button>
          {isPublished ? (
            <Button
              onClick={() => handleSave("unpublish")}
              disabled={updateMutation.isPending}
              variant="destructive"
            >
              {updateMutation.isPending ? "Unpublishing..." : "Unpublish"}
            </Button>
          ) : (
            <Button
              onClick={() => handleSave("publish")}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          )}
          <Button
            variant={"outline"}
            onClick={() => handleDelete(id as string)}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>
      <div className="px-12 grid grid-cols-1 h-full lg:grid-cols-[5fr_2fr]">
        <Tabs defaultValue={"content"} className="large:border-r-1 min-w-0">
          <TabsList className="mt-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="max-w-[95%] grow-0">
            <FileUpload
              value={file ? [file] : []}
              onValueChange={(files) => setFile(files[0] ?? null)}
              onFileValidate={onFileValidate}
              onFileReject={onFileReject}
              accept="image/*"
              disabled={file !== null}
              maxFiles={1}
              className="w-full p-0 mb-4"
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
                    <p className="font-medium text-sm">Drag & drop an image</p>
                    <p className="text-muted-foreground text-xs">(Max 10MB)</p>
                  </div>
                </FileUploadDropzone>
              )}

              {/* Show existing hero image if no new file selected */}
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
            <PlateEditor editor={editor} />
          </TabsContent>
          <TabsContent value="seo" className="space-y-4 max-w-[95%]">
            <Label htmlFor="seo_title">Title</Label>
            <Input
              id="seo_title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="SEO optimized title"
            />
            <Label htmlFor="seo_description">Description</Label>
            <Input
              id="seo_description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="SEO meta description"
            />
          </TabsContent>
        </Tabs>
        <div className="p-4 pr-0 border-l border-border space-y-4">
          <Label htmlFor="published_at">Published at</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full rounded-xs justify-between font-normal"
              >
                {date ? format(date, "PPP") : "Select date"}
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <Label htmlFor="author">Authors</Label>
          <Select value={authorId} onValueChange={setAuthorId}>
            <SelectTrigger className="w-full rounded-xs">
              <SelectValue placeholder="Select author" />
            </SelectTrigger>
            <SelectContent>
              {!areUsersLoading &&
                usersData?.users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Label htmlFor="slug">Slug</Label>
          <Input
            className="w-full rounded-xs"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-friendly-slug"
          />
        </div>
      </div>
    </main>
  );
};

export default page;

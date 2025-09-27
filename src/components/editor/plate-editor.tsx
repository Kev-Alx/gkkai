"use client";

import * as React from "react";

import { normalizeNodeId } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { Skeleton } from "../ui/skeleton";

export function PlateEditor({ editor }: any) {
  const [isMounted, setIsMounted] = React.useState(false);
  // console.log("KKK", editor);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <>
      {isMounted ? (
        <Plate editor={editor}>
          <EditorContainer className="w-full overflow-x-hidden">
            <Editor variant="demo" placeholder="Type" />
          </EditorContainer>
        </Plate>
      ) : (
        <Skeleton className="w-full h-64" />
      )}
    </>
  );
}

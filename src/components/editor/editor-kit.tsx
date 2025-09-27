"use client";

import { type Value, TrailingBlockPlugin } from "platejs";
import { type TPlateEditor, useEditorRef } from "platejs/react";

import { AlignKit } from "@/components/editor/align-kit";
import { AutoformatKit } from "@/components/editor/autoformat-kit";
import { BasicBlocksKit } from "@/components/editor/basic-blocks-kit";
import { BasicMarksKit } from "@/components/editor/basic-marks-kit";
import { BlockMenuKit } from "@/components/editor/block-menu-kit";
import { BlockPlaceholderKit } from "@/components/editor/block-placeholder-kit";
import { ColumnKit } from "@/components/editor/column-kit";
import { CursorOverlayKit } from "@/components/editor/cursor-overlay-kit";
import { DateKit } from "@/components/editor/date-kit";
import { DndKit } from "@/components/editor/dnd-kit";
import { DocxKit } from "@/components/editor/docx-kit";
import { EmojiKit } from "@/components/editor/emoji-kit";
import { ExitBreakKit } from "@/components/editor/exit-break-kit";
import { FixedToolbarKit } from "@/components/editor/fixed-toolbar-kit";
import { FloatingToolbarKit } from "@/components/editor/floating-toolbar-kit";
import { FontKit } from "@/components/editor/font-kit";
import { LineHeightKit } from "@/components/editor/line-height-kit";
import { LinkKit } from "@/components/editor/link-kit";
import { ListKit } from "@/components/editor/list-kit";
import { MarkdownKit } from "@/components/editor/markdown-kit";
import { MediaKit } from "@/components/editor/media-kit";
import { SlashKit } from "@/components/editor/slash-kit";
import { TableKit } from "@/components/editor/table-kit";
import { TocKit } from "@/components/editor/toc-kit";
import { ToggleKit } from "@/components/editor/toggle-kit";

export const EditorKit = [
  // Elements
  ...BasicBlocksKit,
  ...TableKit,
  ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  ...ColumnKit,
  ...DateKit,
  ...LinkKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,

  // Collaboration

  // Editing
  ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...BlockMenuKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();

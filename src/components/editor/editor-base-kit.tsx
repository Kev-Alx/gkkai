import { BaseAlignKit } from "./align-base-kit";
import { BaseBasicBlocksKit } from "./basic-blocks-base-kit";
import { BaseBasicMarksKit } from "./basic-marks-base-kit";
import { BaseColumnKit } from "./column-base-kit";
import { BaseDateKit } from "./date-base-kit";
import { BaseFontKit } from "./font-base-kit";
import { BaseLineHeightKit } from "./line-height-base-kit";
import { BaseLinkKit } from "./link-base-kit";
import { BaseListKit } from "./list-base-kit";
import { MarkdownKit } from "./markdown-kit";
import { BaseMediaKit } from "./media-base-kit";
import { BaseTableKit } from "./table-base-kit";
import { BaseTocKit } from "./toc-base-kit";
import { BaseToggleKit } from "./toggle-base-kit";

export const BaseEditorKit = [
  ...BaseBasicBlocksKit,
  ...BaseTableKit,
  ...BaseToggleKit,
  ...BaseTocKit,
  ...BaseMediaKit,
  ...BaseColumnKit,
  ...BaseDateKit,
  ...BaseLinkKit,
  ...BaseBasicMarksKit,
  ...BaseFontKit,
  ...BaseListKit,
  ...BaseAlignKit,
  ...BaseLineHeightKit,
  ...MarkdownKit,
];

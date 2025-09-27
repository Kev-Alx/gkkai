import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from "@platejs/basic-nodes";

import { HighlightLeafStatic } from "@/components/ui/highlight-node-static";
import { KbdLeafStatic } from "@/components/ui/kbd-node-static";

export const BaseBasicMarksKit = [
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseHighlightPlugin.withComponent(HighlightLeafStatic),
  BaseKbdPlugin.withComponent(KbdLeafStatic),
];

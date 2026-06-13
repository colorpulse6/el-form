import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { useFormQuickStartFiles } from "./useFormQuickStart";
import { validationFiles } from "./validation";
import { fieldArrayFiles } from "./fieldArray";
import { autoFormBasicFiles } from "./autoFormBasic";
import { autoFormThemedFiles } from "./autoFormThemed";

export interface PlaygroundExample {
  /** URL-hash id, e.g. `/playground#useform`. */
  id: string;
  label: string;
  /** One-line description shown above the example. */
  blurb: string;
  /** Live Sandpack files. Omit when the example is static-only. */
  files?: SandpackFiles;
  /** Raw source shown as a static code block when `files` is absent. */
  staticCode?: string;
  /** Note rendered with a static example (e.g. why it isn't live yet). */
  note?: string;
}

// The learning-path examples — all run live in the Sandpack sandbox.
export const PLAYGROUND_EXAMPLES: PlaygroundExample[] = [
  {
    id: "useform",
    label: "useForm",
    blurb: "Imperative form state with register + validation.",
    files: useFormQuickStartFiles,
  },
  {
    id: "validation",
    label: "Validation",
    blurb: "Schema-agnostic onChange validation, errors surfaced live.",
    files: validationFiles,
  },
  {
    id: "fieldarray",
    label: "Field array",
    blurb: "Dynamic rows with useFieldArray (append / remove).",
    files: fieldArrayFiles,
  },
  {
    id: "autoform",
    label: "AutoForm",
    blurb: "Generate a whole form from a Zod schema.",
    files: autoFormBasicFiles,
  },
  {
    id: "autoform-themed",
    label: "AutoForm (themed)",
    blurb: 'Tailwind-free theming: theme="dark" plus classNames slots.',
    files: autoFormThemedFiles,
  },
];

export const DEFAULT_EXAMPLE_ID = PLAYGROUND_EXAMPLES[0].id;

export function findExample(id: string | null | undefined): PlaygroundExample {
  return (
    PLAYGROUND_EXAMPLES.find((e) => e.id === id) ?? PLAYGROUND_EXAMPLES[0]
  );
}

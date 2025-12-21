---
title: Interactive Sandbox
description: Play with el-form in a live, embedded sandbox to explore the API hands-on.
keywords:
  - interactive sandbox
  - live examples
  - el form playground
  - el form quick start
---

import { InteractiveSandbox } from '@site/src/components';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { quickStartBasicFiles } from '@site/src/sandboxes/quickStartBasic';

# Interactive Sandbox

Experiment with El Form directly inside the docs. Use the navigation below to jump to different sandbox categories as we expand coverage.

## Quick Start Examples

### useForm • Basic Form

The default embedded sandbox mirrors the introductory `useForm` example from the guide, complete with live schema validation.

<BrowserOnly>
  {() => (
    <InteractiveSandbox
      title="useForm Quick Start"
      files={quickStartBasicFiles}
      previewHeight={420}
      activeFile="/src/App.tsx"
    />
  )}
</BrowserOnly>

#### What you can try

- Adjust the Zod schema rules to see validation updates instantly.
- Inspect the live form state in the debug panel to understand how `useForm` tracks values and errors.
- Copy the generated files into your own project when you're ready to move beyond the docs.

Looking for the full walkthrough? Head back to the [Quick Start guide](/docs/quick-start) or dive deeper in the [useForm Guide](/docs/guides/use-form#quick-start) for installation steps and additional context around this example.

## Coming Soon

- AutoForm, error handling, and array field sandboxes
- StackBlitz links for external editing
- Dark-mode optimized themes and layout presets tailored to each example

> More interactive examples are on the way—this page will grow into the central hub for sandboxes across the documentation.

---

Need a dedicated sandbox for a specific component or hook? [Open an issue](https://github.com/colorpulse6/el-form/issues/new/choose) and let us know what would help.

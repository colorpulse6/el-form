# Documentation Components

This directory contains all the custom React components used in the El Form documentation.

## Components

### `CodeBlock.tsx`

Enhanced code block component with syntax highlighting and copy functionality.

- Features: Copy button, syntax highlighting, macOS-style window controls
- Props: `children`, `language`, `title`

### `FeatureCard.tsx`

Card component for highlighting features with icons and descriptions.

- Features: Hover effects, gradient backgrounds, animated icons
- Props: `icon`, `title`, `description`, `className`

### `Callout.tsx`

Alert/callout component for important information.

- Features: Multiple types (info, warning, success, error), gradient backgrounds
- Props: `type`, `title`, `children`

### `InstallCommand.tsx`

Interactive installation command component with package manager tabs.

- Features: npm/yarn/pnpm tabs, copy functionality, terminal styling
- Props: `npm`, `yarn`, `pnpm`

### `ApiReference.tsx`

Component for documenting API methods and properties.

- Features: Parameter documentation, examples, return types
- Props: `name`, `type`, `description`, `parameters`, `returns`, `example`

### `InteractivePreview.tsx`

Component for showing live examples with optional code display.

- Features: Toggle code view, macOS-style window, gradient backgrounds
- Props: `title`, `children`, `code`

### `ProgressSteps.tsx`

Step-by-step progress indicator component.

- Features: Progress visualization, step completion states
- Props: `steps`

## Usage

All components are exported from both their individual files and the main `DocComponents.tsx` file for backward compatibility.

```tsx
// Import from individual files
import { CodeBlock } from "@site/src/components/CodeBlock";

// Or import from the main file
import { CodeBlock } from "@site/src/components/DocComponents";

// Or use the index file
import { CodeBlock } from "@site/src/components";
```

## Styling

All components use Tailwind CSS for styling and support both light and dark themes automatically.

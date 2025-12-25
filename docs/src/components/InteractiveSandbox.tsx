import React from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  type SandpackFiles,
  type SandpackProviderProps,
  type SandpackPredefinedTemplate,
  type SandpackInitMode,
} from "@codesandbox/sandpack-react";
import { githubLight, sandpackDark } from "@codesandbox/sandpack-themes";
import { useColorMode } from "@docusaurus/theme-common";

const DEFAULT_TEMPLATE: SandpackPredefinedTemplate = "react-ts";

const DEFAULT_DEPENDENCIES: Record<string, string> = {
  react: "18.2.0",
  "react-dom": "18.2.0",
  "el-form-react": "4.1.2",
  zod: "3.23.8",
  "@types/react": "18.2.45",
  "@types/react-dom": "18.2.18",
  typescript: "5.4.5",
};

export type InteractiveSandboxLink = {
  label: string;
  href: string;
};

export type InteractiveSandboxProps = {
  /** Title shown next to the Interactive Sandbox label */
  title?: string;
  /** Map of file paths to Sandpack file definitions */
  files: SandpackFiles;
  /** Override or extend npm dependencies injected into the sandbox */
  dependencies?: Record<string, string>;
  /** Additional Sandpack setup (environment, entry file, main, etc.) */
  customSetup?: SandpackProviderProps["customSetup"];
  /** Entry file path (defaults to /src/main.tsx for the Vite template) */
  entry?: string;
  /** Height in pixels for the preview iframe */
  previewHeight?: number;
  /** Pass-through Sandpack options (e.g. autoReload delay) */
  options?: SandpackProviderProps["options"];
  /** Links rendered in the header (e.g. GitHub, StackBlitz) */
  externalLinks?: InteractiveSandboxLink[];
  /** Initial Sandpack start mode (lazy prevents SSR issues) */
  initMode?: SandpackInitMode;
  /** File to focus when the sandbox loads */
  activeFile?: string;
};

export const InteractiveSandbox: React.FC<InteractiveSandboxProps> = ({
  title,
  files,
  dependencies,
  customSetup,
  entry = "/src/main.tsx",
  previewHeight = 460,
  options,
  externalLinks,
  initMode,
  activeFile,
}) => {
  const { colorMode } = useColorMode();

  const theme = colorMode === "dark" ? sandpackDark : githubLight;

  const mergedDependencies = {
    ...DEFAULT_DEPENDENCIES,
    ...dependencies,
  };

  const providerSetup: SandpackProviderProps["customSetup"] = {
    entry,
    dependencies: mergedDependencies,
    ...customSetup,
  };

  const resolvedInitMode: SandpackInitMode =
    initMode ?? options?.initMode ?? "user-visible";

  const defaultVisibleFiles = React.useMemo(() => {
    return Object.entries(files)
      .filter(([, value]) =>
        typeof value === "string" ? true : value.hidden !== true
      )
      .map(([path]) => path);
  }, [files]);

  const mergedOptions = {
    recompileMode: "delayed" as const,
    recompileDelay: 500,
    autorun: true,
    ...(options ?? {}),
    initMode: resolvedInitMode,
    activeFile: options?.activeFile ?? activeFile ?? "/App.tsx",
    visibleFiles: options?.visibleFiles ?? defaultVisibleFiles,
  } satisfies SandpackProviderProps["options"];

  return (
    <div
      className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-xl"
      data-testid="interactive-sandbox"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Interactive Sandbox
          </span>
          {title && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
              {title}
            </span>
          )}
        </div>
        {externalLinks && externalLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {externalLinks.map(({ label, href }) => (
              <a
                key={label + href}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs font-medium text-blue-600 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-200 transition-colors border border-blue-200 dark:border-blue-700 rounded-md px-2 py-1"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>

      <SandpackProvider
        template={DEFAULT_TEMPLATE}
        files={files}
        customSetup={providerSetup}
        options={mergedOptions}
        theme={theme}
      >
        <SandpackLayout
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: 0,
            border: "none",
            background: "transparent",
          }}
        >
          <div
            style={{
              flex: "1 1 50%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--sp-colors-surface2, #e4e7eb)",
            }}
          >
            <SandpackFileExplorer style={{ maxHeight: 120 }} />
            <SandpackCodeEditor
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{ flex: 1, minHeight: previewHeight }}
            />
          </div>
          <div
            style={{
              flex: "1 1 50%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SandpackPreview
              showNavigator
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ flex: 1, minHeight: previewHeight }}
            />
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default InteractiveSandbox;

import React from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackFileExplorer,
  type SandpackFiles,
  type SandpackProviderProps,
  type SandpackPredefinedTemplate,
  type SandpackInitMode,
} from "@codesandbox/sandpack-react";
import { githubLight, sandpackDark } from "@codesandbox/sandpack-themes";
import { useColorMode } from "@docusaurus/theme-common";
import clsx from "clsx";

const DEFAULT_TEMPLATE: SandpackPredefinedTemplate = "vite-react-ts";

const DEFAULT_DEPENDENCIES: Record<string, string> = {
  react: "18.2.0",
  "react-dom": "18.2.0",
  "el-form-react-hooks": "3.10.0",
  "@types/react": "18.2.45",
  "@types/react-dom": "18.2.18",
  typescript: "5.4.5",
  vite: "5.0.8",
  "@vitejs/plugin-react": "4.2.1",
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
    environment: "node",
    ...customSetup,
  };

  const resolvedInitMode: SandpackInitMode =
    initMode ?? options?.initMode ?? "lazy";

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
    activeFile: options?.activeFile ?? activeFile ?? "/src/App.tsx",
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
          className={clsx(
            "!border-none !bg-transparent",
            "interactive-sandbox__layout flex flex-col lg:flex-row"
          )}
        >
          <div className="lg:w-1/2 xl:w-[55%] flex flex-col bg-slate-50/60 dark:bg-slate-900/40 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">
            <SandpackFileExplorer className="max-h-44 lg:max-h-full overflow-auto" />
            <SandpackCodeEditor
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{ minHeight: previewHeight }}
            />
          </div>
          <div className="lg:w-1/2 xl:w-[45%] flex flex-col bg-white dark:bg-slate-900">
            <SandpackPreview
              showNavigator
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: previewHeight }}
            />
            <SandpackConsole
              showHeader
              resetOnPreviewRestart
              className="interactive-sandbox__console border-t border-slate-200 dark:border-slate-700"
              style={{ maxHeight: 200 }}
            />
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default InteractiveSandbox;

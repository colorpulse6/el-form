import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useColorMode } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  type SandpackFiles,
} from "@codesandbox/sandpack-react";
import { githubLight, sandpackDark } from "@codesandbox/sandpack-themes";

export interface SandboxProps {
  /** Sandpack file map. At minimum an entry-point App.tsx. */
  files: SandpackFiles;
  /** File to focus when the sandbox loads. */
  activeFile?: string;
  /** Override/extend the injected dependency map (e.g. pin a peer). */
  dependencies?: Record<string, string>;
  /** Preview pane height in px. */
  previewHeight?: number;
}

// Non-el-form deps the examples need. el-form versions come from customFields.
const BASE_DEPENDENCIES: Record<string, string> = {
  react: "18.2.0",
  "react-dom": "18.2.0",
  zod: "^3.23.0",
};

function SandboxInner({
  files,
  activeFile,
  dependencies,
  previewHeight = 460,
}: SandboxProps) {
  const { colorMode } = useColorMode();
  const { siteConfig } = useDocusaurusContext();
  const elFormVersions =
    (siteConfig.customFields?.elFormVersions as Record<string, string>) ?? {};

  const mergedDependencies = {
    ...BASE_DEPENDENCIES,
    ...elFormVersions,
    ...dependencies,
  };

  return (
    <div className="my-6">
      <SandpackProvider
        template="react-ts"
        theme={colorMode === "dark" ? sandpackDark : githubLight}
        files={files}
        customSetup={{ dependencies: mergedDependencies }}
        options={{ initMode: "lazy", ...(activeFile ? { activeFile } : {}) }}
      >
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers showTabs />
          <SandpackPreview
            showOpenInCodeSandbox
            style={{ height: previewHeight }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

/**
 * Inline el-form sandbox. SSR-safe (Sandpack is client-only) and only imported by
 * the pages that use it, so the heavy bundle is code-split onto those pages.
 */
export function Sandbox(props: SandboxProps) {
  return (
    <BrowserOnly fallback={<div className="my-6">Loading sandbox…</div>}>
      {() => <SandboxInner {...props} />}
    </BrowserOnly>
  );
}

import React, { useState } from "react";

// Installation Command Component
export const InstallCommand: React.FC<{
  npm?: string;
  yarn?: string;
  pnpm?: string;
}> = ({ npm, yarn, pnpm }) => {
  const [activeTab, setActiveTab] = useState<"npm" | "yarn" | "pnpm">("pnpm");
  const [copied, setCopied] = useState(false);

  const commands = {
    npm: npm || "npm install el-form zod",
    yarn: yarn || "yarn add el-form zod",
    pnpm: pnpm || "pnpm add el-form zod",
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="my-8 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {Object.keys(commands).map((pkg) => (
          <button
            key={pkg}
            onClick={() => setActiveTab(pkg as keyof typeof commands)}
            className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ${
              activeTab === pkg
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500 dark:border-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            {pkg}
          </button>
        ))}
      </div>
      <div className="p-6 relative">
        <pre className="text-sm font-mono bg-slate-900 dark:bg-slate-950 text-green-400 p-4 rounded-lg overflow-x-auto border border-slate-800">
          <code>{commands[activeTab]}</code>
        </pre>
        <button
          onClick={() => copyToClipboard(commands[activeTab])}
          className="absolute top-8 right-8 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200 flex items-center gap-1 shadow-md"
        >
          {copied ? "✓ Copied!" : "📋 Copy"}
        </button>
      </div>
    </div>
  );
};

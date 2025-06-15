import React, { useState } from "react";

// Enhanced Code Block with copy functionality
export const CodeBlock: React.FC<{
  children: string;
  language?: string;
  title?: string;
}> = ({ children, language = "typescript", title }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg bg-white dark:bg-slate-800">
      {title && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-2">
              {title}
            </span>
          </div>
          <button
            onClick={copyToClipboard}
            className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1.5 shadow-sm"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
        </div>
      )}
      <div className="relative group">
        <pre className="p-6 text-sm overflow-x-auto bg-slate-900 dark:bg-slate-950 text-slate-100">
          <code className={`language-${language}`}>{children}</code>
        </pre>
        {!title && (
          <button
            onClick={copyToClipboard}
            className="absolute top-4 right-4 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 shadow-md"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
        )}
      </div>
    </div>
  );
};

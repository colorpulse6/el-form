import React, { useState } from "react";
import { CodeBlock } from "./CodeBlock";

// Interactive Preview Component
export const InteractivePreview: React.FC<{
  title?: string;
  children: React.ReactNode;
  code?: string;
}> = ({ title, children, code }) => {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="my-8 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl bg-white dark:bg-slate-800">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          {title && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {title}
            </span>
          )}
        </div>
        {code && (
          <button
            onClick={() => setShowCode(!showCode)}
            className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1.5"
          >
            {showCode ? "👁️ Hide Code" : "📝 Show Code"}
          </button>
        )}
      </div>

      <div className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        {children}
      </div>

      {code && showCode && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <CodeBlock language="tsx">{code}</CodeBlock>
        </div>
      )}
    </div>
  );
};

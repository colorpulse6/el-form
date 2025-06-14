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

// Feature Highlight Card
export const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}> = ({ icon, title, description, className = "" }) => {
  return (
    <div
      className={`group p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${className}`}
    >
      <div className="flex items-center mb-4">
        <div className="mr-4 text-2xl p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

// Callout/Alert Component
export const Callout: React.FC<{
  type: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
}> = ({ type, title, children }) => {
  const styles = {
    info: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-900 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700 dark:text-blue-100",
    warning:
      "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-900 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700 dark:text-yellow-100",
    success:
      "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-900 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 dark:text-green-100",
    error:
      "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-900 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-700 dark:text-red-100",
  };

  const icons = {
    info: "💡",
    warning: "⚠️",
    success: "✅",
    error: "❌",
  };

  const iconBg = {
    info: "bg-blue-100 dark:bg-blue-800/50",
    warning: "bg-yellow-100 dark:bg-yellow-800/50",
    success: "bg-green-100 dark:bg-green-800/50",
    error: "bg-red-100 dark:bg-red-800/50",
  };

  return (
    <div className={`my-6 p-6 rounded-xl border ${styles[type]} shadow-lg`}>
      <div className="flex items-start">
        <div className={`mr-4 p-2 rounded-lg ${iconBg[type]}`}>
          <span className="text-lg">{icons[type]}</span>
        </div>
        <div className="flex-1">
          {title && <div className="font-semibold mb-2 text-lg">{title}</div>}
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

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

// API Reference Component
export const ApiReference: React.FC<{
  name: string;
  type: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }>;
  returns?: string;
  example?: string;
}> = ({ name, type, description, parameters, returns, example }) => {
  return (
    <div className="my-6 p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
      <div className="mb-4">
        <h4 className="text-lg font-mono font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {name}
          <span className="ml-2 text-sm font-normal text-slate-600 dark:text-slate-400">
            {type}
          </span>
        </h4>
        <p className="text-slate-700 dark:text-slate-300">{description}</p>
      </div>

      {parameters && parameters.length > 0 && (
        <div className="mb-4">
          <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Parameters:
          </h5>
          <div className="space-y-2">
            {parameters.map((param, index) => (
              <div key={index} className="flex items-start space-x-3">
                <code className="text-sm bg-white dark:bg-slate-900 px-2 py-1 rounded border">
                  {param.name}
                  {param.optional ? "?" : ""}
                </code>
                <div className="flex-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {param.type}
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {param.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {returns && (
        <div className="mb-4">
          <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Returns:
          </h5>
          <code className="text-sm bg-white dark:bg-slate-900 px-2 py-1 rounded border">
            {returns}
          </code>
        </div>
      )}

      {example && (
        <div>
          <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Example:
          </h5>
          <CodeBlock language="typescript">{example}</CodeBlock>
        </div>
      )}
    </div>
  );
};

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

// Progress Steps Component
export const ProgressSteps: React.FC<{
  steps: Array<{
    title: string;
    description: string;
    completed?: boolean;
    current?: boolean;
  }>;
}> = ({ steps }) => {
  return (
    <div className="my-8">
      {steps.map((step, index) => (
        <div key={index} className="relative flex items-start mb-8 last:mb-0">
          {index < steps.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-16 bg-slate-200 dark:bg-slate-700"></div>
          )}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
              step.completed
                ? "bg-green-500"
                : step.current
                ? "bg-blue-500"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            {step.completed ? "✓" : index + 1}
          </div>
          <div className="ml-6 flex-1">
            <h3
              className={`text-lg font-semibold mb-2 ${
                step.current
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {step.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

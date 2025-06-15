import React from "react";
import { CodeBlock } from "./CodeBlock";

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

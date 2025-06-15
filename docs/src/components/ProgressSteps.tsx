import React from "react";

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

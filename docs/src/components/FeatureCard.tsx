import React from "react";

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
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700  transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
};

import React from "react";

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

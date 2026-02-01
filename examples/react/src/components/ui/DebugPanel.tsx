import { useState } from "react";

interface DebugPanelProps {
  title?: string;
  data: Record<string, unknown>;
  defaultCollapsed?: boolean;
  variant?: "default" | "errors" | "success";
}

const variantClasses = {
  default: "bg-gray-50 border-gray-200",
  errors: "bg-red-50 border-red-200",
  success: "bg-green-50 border-green-200",
};

const variantHeaderClasses = {
  default: "text-gray-700",
  errors: "text-red-700",
  success: "text-green-700",
};

export function DebugPanel({
  title = "Debug",
  data,
  defaultCollapsed = true,
  variant = "default",
}: DebugPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const hasData = Object.keys(data).length > 0;

  if (!hasData && variant === "default") {
    return null;
  }

  return (
    <div className={`rounded-lg border ${variantClasses[variant]} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={`
          w-full px-4 py-2 text-left text-sm font-medium
          flex items-center justify-between
          hover:bg-opacity-80 transition-colors
          ${variantHeaderClasses[variant]}
        `}
      >
        <span>{title}</span>
        <span className="text-xs">{collapsed ? "+" : "-"}</span>
      </button>
      {!collapsed && (
        <div className="px-4 py-3 border-t border-inherit">
          <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Simplified status bar for form state
interface FormStatusBarProps {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting?: boolean;
  extra?: Record<string, string | number>;
}

export function FormStatusBar({ isValid, isDirty, isSubmitting, extra }: FormStatusBarProps) {
  return (
    <div className="flex flex-wrap gap-4 text-sm bg-blue-50 px-4 py-3 rounded-lg mb-5">
      <span className="flex items-center gap-1">
        Valid: {isValid ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}
      </span>
      <span className="flex items-center gap-1">
        Dirty: {isDirty ? <span className="text-amber-600">Yes</span> : <span className="text-gray-500">No</span>}
      </span>
      {isSubmitting !== undefined && (
        <span className="flex items-center gap-1">
          Submitting: {isSubmitting ? <span className="text-blue-600">Yes</span> : <span className="text-gray-500">No</span>}
        </span>
      )}
      {extra && Object.entries(extra).map(([key, value]) => (
        <span key={key} className="flex items-center gap-1">
          {key}: <span className="text-gray-700">{value}</span>
        </span>
      ))}
    </div>
  );
}

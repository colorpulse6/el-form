import { HTMLAttributes, forwardRef, ReactNode } from "react";

interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ label, htmlFor, error, hint, required, className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-4 ${className}`} {...props}>
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

FormGroup.displayName = "FormGroup";

// Reusable input styles
export const inputBaseClasses = `
  w-full px-3 py-2 text-sm
  border border-gray-300 rounded-md
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  disabled:bg-gray-100 disabled:cursor-not-allowed
`;

export const inputErrorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

export const selectBaseClasses = `
  w-full px-3 py-2 text-sm
  border border-gray-300 rounded-md
  bg-white
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  disabled:bg-gray-100 disabled:cursor-not-allowed
`;

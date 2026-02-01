import { HTMLAttributes, forwardRef } from "react";

type SectionVariant = "default" | "gray" | "blue" | "green" | "amber" | "purple";

interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  variant?: SectionVariant;
  headerAction?: React.ReactNode;
}

const variantClasses: Record<SectionVariant, string> = {
  default: "bg-white",
  gray: "bg-gray-50",
  blue: "bg-blue-50",
  green: "bg-green-50",
  amber: "bg-amber-50",
  purple: "bg-purple-50",
};

export const FormSection = forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, variant = "gray", headerAction, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-lg p-4 mb-5
          ${variantClasses[variant]}
          ${className}
        `}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
        {children}
      </div>
    );
  }
);

FormSection.displayName = "FormSection";

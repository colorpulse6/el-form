import React, { createContext } from "react";
import { UseFormReturn, useField, useFormContext } from "el-form-react-hooks";
import type { AutoFormFieldConfig } from "../types";
import { useDiscriminatedUnionContext } from "el-form-react-hooks";
import { getDiscriminatedUnionInfo, getLiteralValue } from "el-form-core";
import type { z } from "zod";

// Discriminated Union Context for schema-driven FormSwitch
interface DiscriminatedUnionContextValue {
  schema?: z.ZodTypeAny;
  unionMetadata?: {
    discriminatorField: string;
    options: Array<{ value: string; label: string }>;
    unionOptions: Record<string, any[]>;
  };
}

const DiscriminatedUnionContext = createContext<
  DiscriminatedUnionContextValue | undefined
>(undefined);

// Supported primitive discriminator types
type DiscriminatorPrimitive = string | number | boolean;

// New schema-driven props (preferred)
type SchemaDrivenProps = {
  field: string;
  unionOptions?: Record<string, AutoFormFieldConfig[]>;
  discriminatorValue?: DiscriminatorPrimitive;
  renderCase?: (
    value: DiscriminatorPrimitive,
    fields: AutoFormFieldConfig[],
    form: UseFormReturn<any>
  ) => React.ReactNode;
  children?: React.ReactNode; // For back-compat or custom cases
};

// Back-compat props (no narrowing)
type BackCompatProps<T extends Record<string, any>> = {
  on?: DiscriminatorPrimitive | undefined | null;
  form?: UseFormReturn<T>;
  children: React.ReactNode;
  // Explicitly forbid new props
  field?: never;
  unionOptions?: never;
  discriminatorValue?: never;
  renderCase?: never;
};

export type FormSwitchProps<T extends Record<string, any>> =
  | SchemaDrivenProps
  | BackCompatProps<T>;

// Implementation
const FormSwitchImpl = (props: any) => {
  // Handle schema-aware overload first
  if ("schema" in props) {
    const { schema, field, children } = props;
    const ctx = useFormContext();
    const formApi = ctx?.form;

    // Extract discriminator info
    const unionInfo = getDiscriminatedUnionInfo(schema);
    if (!unionInfo) {
      console.warn("FormSwitch: Provided schema is not a discriminated union");
      return <>{children}</>;
    }

    // Use provided field or default to discriminator field
    const activeField = field || unionInfo.discriminator;

    // Validate field matches discriminator
    if (activeField !== unionInfo.discriminator) {
      console.warn(
        `FormSwitch: Field "${activeField}" doesn't match the discriminator "${unionInfo.discriminator}" in your discriminated union schema.`
      );
    }

    // Create discriminated union context value for type inference
    const discriminatedUnionValue: DiscriminatedUnionContextValue = {
      schema,
      unionMetadata: {
        discriminatorField: unionInfo.discriminator,
        options: unionInfo.options.map((option: any) => {
          const discriminatorValue = getLiteralValue(
            option.shape[unionInfo.discriminator]
          );
          return {
            value: String(discriminatorValue),
            label:
              String(discriminatorValue).charAt(0).toUpperCase() +
              String(discriminatorValue).slice(1),
          };
        }),
        unionOptions: unionInfo.options.reduce(
          (acc: Record<string, any[]>, option: any) => {
            const discriminatorValue = getLiteralValue(
              option.shape[unionInfo.discriminator]
            );
            acc[String(discriminatorValue)] = [];
            return acc;
          },
          {}
        ),
      },
    };

    // Read current discriminant value
    const slice = useField(activeField);
    const current = slice.value as any;

    // If the discriminator hasn't been set yet, don't attempt to render a branch.
    if (current == null) return null;

    // Render children with FormCase filtering and discriminated union context
    return (
      <DiscriminatedUnionContext.Provider value={discriminatedUnionValue}>
        {(() => {
          const childrenArray = React.Children.toArray(children);
          for (const child of childrenArray) {
            if (!React.isValidElement(child)) continue;
            const childProps: any = child.props;
            if (childProps?.value === current) {
              return childProps.children(formApi as UseFormReturn<any>);
            }
          }
          return null;
        })()}
      </DiscriminatedUnionContext.Provider>
    );
  }

  // Handle regular FormSwitch logic
  const discriminatedUnionContext = useDiscriminatedUnionContext();

  // Helper to validate field matches discriminator in discriminated union schemas
  const validateDiscriminatedUnionField = (field: string) => {
    if (!discriminatedUnionContext?.schema) return;

    const unionInfo = getDiscriminatedUnionInfo(
      discriminatedUnionContext.schema
    );
    if (unionInfo && unionInfo.discriminator !== field) {
      console.warn(
        `FormSwitch: Field "${field}" doesn't match the discriminator "${unionInfo.discriminator}" in your discriminated union schema. ` +
          `Consider using field="${unionInfo.discriminator}" to match your schema.`
      );
    }
  };

  // Handle schema-driven API
  if ("field" in props && "unionOptions" in props) {
    const { field, unionOptions, discriminatorValue, renderCase, children } =
      props;
    const ctx = useFormContext();
    const formApi = ctx?.form;

    // Read current discriminant value
    let current: DiscriminatorPrimitive | undefined | null = discriminatorValue;
    if (!current) {
      const slice = useField(field);
      current = slice.value as any;
    }

    // If the discriminator hasn't been set yet, don't attempt to render a branch.
    if (current == null) return null;

    // If unionOptions provided, auto-generate cases
    if (unionOptions && typeof unionOptions === "object") {
      const fields = unionOptions[String(current)] || [];
      if (renderCase) {
        return renderCase(current, fields, formApi);
      }
      // Default rendering
      return (
        <div className="space-y-4">
          {fields.map((fieldConfig: AutoFormFieldConfig) => {
            const fieldProps = formApi.register(fieldConfig.name);
            const error = formApi.formState.errors[fieldConfig.name];
            const touched = formApi.formState.touched[fieldConfig.name];

            const fieldValue =
              "checked" in fieldProps
                ? fieldProps.checked
                : "value" in fieldProps
                ? fieldProps.value
                : undefined;

            // Simple default field rendering (can be enhanced)
            return (
              <div key={fieldConfig.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {fieldConfig.label || fieldConfig.name}
                </label>
                <input
                  type={fieldConfig.type || "text"}
                  value={fieldValue || ""}
                  onChange={fieldProps.onChange}
                  onBlur={fieldProps.onBlur}
                  placeholder={fieldConfig.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {error && touched && (
                  <div className="text-red-500 text-sm">⚠️ {String(error)}</div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Fall back to children if no unionOptions
    return <>{children}</>;
  }

  // Handle field prop with context-based unionOptions
  if (
    "field" in props &&
    !("unionOptions" in props) &&
    discriminatedUnionContext?.unionMetadata
  ) {
    const { field, children } = props;
    const ctx = useFormContext();
    const formApi = ctx?.form;

    // Validate field matches discriminator
    validateDiscriminatedUnionField(field);
    const { unionMetadata } = discriminatedUnionContext;

    // Read current discriminant value
    const slice = useField(field);
    const current = slice.value as any;

    // If the discriminator hasn't been set yet, don't attempt to render a branch.
    if (current == null) return null;

    // Use unionOptions from context
    const fields = unionMetadata.unionOptions[String(current)] || [];
    if (fields.length > 0) {
      // Auto-render fields from schema
      return (
        <div className="space-y-4">
          {fields.map((fieldConfig: AutoFormFieldConfig) => {
            const fieldProps = formApi.register(fieldConfig.name);
            const error = formApi.formState.errors[fieldConfig.name];
            const touched = formApi.formState.touched[fieldConfig.name];

            const fieldValue =
              "checked" in fieldProps
                ? fieldProps.checked
                : "value" in fieldProps
                ? fieldProps.value
                : undefined;

            return (
              <div key={fieldConfig.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {fieldConfig.label || fieldConfig.name}
                </label>
                <input
                  type={fieldConfig.type || "text"}
                  value={fieldValue || ""}
                  onChange={fieldProps.onChange}
                  onBlur={fieldProps.onBlur}
                  placeholder={fieldConfig.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {error && touched && (
                  <div className="text-red-500 text-sm">⚠️ {String(error)}</div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Fall back to children
    return <>{children}</>;
  }

  // Handle field prop with manual children (backwards compatibility)
  if ("field" in props && !("unionOptions" in props)) {
    const { field, children } = props;
    const ctx = useFormContext();
    const formApi = ctx?.form;

    // Validate field matches discriminator
    validateDiscriminatedUnionField(field);

    // Read current discriminant value
    const slice = useField(field);
    const current = slice.value as any;

    // If the discriminator hasn't been set yet, don't attempt to render a branch.
    if (current == null) return null;

    const childrenArray = React.Children.toArray(children);

    // Detect duplicate case values at runtime for developer feedback
    const seen = new Set<DiscriminatorPrimitive>();
    for (const child of childrenArray) {
      if (!React.isValidElement(child)) continue;
      const val = (child as any).props?.value as DiscriminatorPrimitive;
      if (val === undefined) continue;
      if (seen.has(val)) {
        // eslint-disable-next-line no-console
        console.warn(
          "FormSwitch: duplicate case value detected:",
          val,
          "— ensure case values are unique."
        );
      }
      seen.add(val);
    }

    // Type guard for FormCase elements
    function isFormCaseElement(el: unknown): el is React.ReactElement<{
      value: DiscriminatorPrimitive;
      children: (form: UseFormReturn<any>) => React.ReactNode;
    }> {
      if (!React.isValidElement(el)) return false;
      const props: any = el.props;
      return (
        props &&
        ["string", "number", "boolean"].includes(typeof props.value) &&
        typeof props.children === "function"
      );
    }

    for (const child of childrenArray) {
      if (!isFormCaseElement(child)) continue;
      if ((child.props as any).value === current) {
        return child.props.children(formApi as UseFormReturn<any>);
      }
    }

    return null;
  }

  // Back-compat branch: on + form, no narrowing
  const { on, form, children } = props;
  if (on !== undefined) {
    console.warn(
      "FormSwitch: 'form' and 'on' props are deprecated; use the 'field' prop for type-safe narrowing."
    );
  }

  const current: DiscriminatorPrimitive | undefined | null = on as any;
  if (current == null) return null;
  const formApi =
    (form as UseFormReturn<any> | undefined) ?? useFormContext()?.form;

  const childrenArray = React.Children.toArray(children);
  function isFormCaseElementCompat(el: unknown): el is React.ReactElement<{
    value: DiscriminatorPrimitive;
    children: (form: UseFormReturn<any>) => React.ReactNode;
  }> {
    if (!React.isValidElement(el)) return false;
    const props: any = el.props;
    return (
      props &&
      ["string", "number", "boolean"].includes(typeof props.value) &&
      typeof props.children === "function"
    );
  }

  for (const child of childrenArray) {
    if (!isFormCaseElementCompat(child)) continue;
    if (child.props.value === current) {
      return child.props.children(formApi as UseFormReturn<any>);
    }
  }

  return null;
};

// Memoized FormSwitch component with custom comparison
const MemoizedFormSwitch = React.memo(
  FormSwitchImpl,
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary rerenders
    // Only re-render if relevant props change

    // For schema-driven API
    if ("field" in prevProps && "field" in nextProps) {
      // Compare field name
      if (prevProps.field !== nextProps.field) return false;

      // Compare unionOptions if both have it
      if ("unionOptions" in prevProps && "unionOptions" in nextProps) {
        if (prevProps.unionOptions !== nextProps.unionOptions) return false;
      }

      // Compare discriminatorValue if both have it
      if (
        "discriminatorValue" in prevProps &&
        "discriminatorValue" in nextProps
      ) {
        if (prevProps.discriminatorValue !== nextProps.discriminatorValue)
          return false;
      }

      // Compare renderCase function reference
      if (prevProps.renderCase !== nextProps.renderCase) return false;

      // Compare children
      if (prevProps.children !== nextProps.children) return false;

      return true; // No changes, don't re-render
    }

    // For back-compat API
    if ("on" in prevProps && "on" in nextProps) {
      if (prevProps.on !== nextProps.on) return false;
      if (prevProps.form !== nextProps.form) return false;
      if (prevProps.children !== nextProps.children) return false;
      return true; // No changes, don't re-render
    }

    // Different prop patterns, re-render
    return false;
  }
);

// Export the memoized component
export const FormSwitch = MemoizedFormSwitch;

import React from "react";
import {
  UseFormReturn,
  useField,
  useFormContext,
} from "el-form-react-hooks";
import type { AutoFormFieldConfig } from "../types";
import { useDiscriminatedUnionContext } from "el-form-react-hooks";

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

// Overload: Schema-driven API
export function FormSwitch(props: SchemaDrivenProps): JSX.Element | null;

// Overload: Back-compat API
export function FormSwitch<T extends Record<string, any>>(
  props: BackCompatProps<T>
): JSX.Element | null;

// Implementation
export function FormSwitch(props: any) {
  const discriminatedUnionContext = useDiscriminatedUnionContext();
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
  if ("field" in props && !("unionOptions" in props) && discriminatedUnionContext?.unionMetadata) {
    const { field, children } = props;
    const ctx = useFormContext();
    const formApi = ctx?.form;
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
}

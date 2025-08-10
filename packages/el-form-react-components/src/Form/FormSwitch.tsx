import React from "react";
import { UseFormReturn } from "el-form-react-hooks";

// Supported primitive discriminator types
type DiscriminatorPrimitive = string | number | boolean;

interface FormSwitchProps<T extends Record<string, any>> {
  /**
   * Current discriminator value. May be temporarily undefined during initial render
   * if the form field has not been initialized yet, so we allow undefined for robustness.
   */
  on: DiscriminatorPrimitive | undefined | null;
  form: UseFormReturn<T>;
  children: React.ReactNode;
  /** Optional fallback rendered when no case matches */
  fallback?: React.ReactNode | ((form: UseFormReturn<T>) => React.ReactNode);
}

export function FormSwitch<T extends Record<string, any>>({
  on,
  form,
  children,
  fallback,
}: FormSwitchProps<T>) {
  // If the discriminator hasn't been set yet, don't attempt to render a branch.
  if (on == null) return null;

  const childrenArray = React.Children.toArray(children);

  // Type guard to ensure an element matches the expected FormCase shape
  function isFormCaseElement(el: unknown): el is React.ReactElement<{
    value: DiscriminatorPrimitive;
    children: (form: UseFormReturn<T>) => React.ReactNode;
  }> {
    if (!React.isValidElement(el)) return false;
    const props: any = el.props;
    return (
      props &&
      ["string", "number", "boolean"].includes(typeof props.value) &&
      typeof props.children === "function"
    );
  }

  // Duplicate detection removed.

  for (const child of childrenArray) {
    if (!isFormCaseElement(child)) continue;
    if (child.props.value === on) {
      // Fully typed now without casting
      return child.props.children(form);
    }
  }

  // Dev warning removed.

  if (fallback) {
    if (typeof fallback === "function") {
      // Narrow to the function variant of the fallback union
      return (fallback as (form: UseFormReturn<T>) => React.ReactNode)(form);
    }
    return fallback;
  }
  return null;
}

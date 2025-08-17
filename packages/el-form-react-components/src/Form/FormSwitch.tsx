import React from "react";
import {
  UseFormReturn,
  useFormSelector,
  useField,
  useFormContext,
} from "el-form-react-hooks";
import type { Path } from "el-form-react-hooks";

// Supported primitive discriminator types
type DiscriminatorPrimitive = string | number | boolean;

interface FormSwitchProps<T extends Record<string, any>> {
  /**
   * Current discriminator value. May be temporarily undefined during initial render
   * if the form field has not been initialized yet, so we allow undefined for robustness.
   */
  on?: DiscriminatorPrimitive | undefined | null; // deprecated
  form?: UseFormReturn<T>; // deprecated
  field?: Path<T>;
  select?: (state: { values: Partial<T> } & any) => DiscriminatorPrimitive;
  children: React.ReactNode;
  /** Optional fallback rendered when no case matches */
  fallback?: React.ReactNode | ((form: UseFormReturn<T>) => React.ReactNode);
}

export function FormSwitch<T extends Record<string, any>>({
  on,
  form,
  field,
  select,
  children,
  fallback,
}: FormSwitchProps<T>) {
  // Prefer new API: field/select
  let current: DiscriminatorPrimitive | undefined | null = undefined;
  let formApi: UseFormReturn<T> | undefined = form;

  // Get form instance from context if not provided and using field/select
  if (!formApi && (field || select)) {
    const ctx = useFormContext<T>();
    formApi = ctx?.form;
  }

  if (field) {
    const slice = useField<any, any>(field as any);
    current = slice.value as any;
  } else if (select) {
    current = useFormSelector(select as any) as any;
  } else {
    if (form) {
      // eslint-disable-next-line no-console
      console.warn(
        "FormSwitch: 'form' and 'on' props are deprecated; use 'field' or 'select' instead."
      );
    }

    current = on as any;
  }

  // If the discriminator hasn't been set yet, don't attempt to render a branch.
  if (current == null) return null;

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
    if (child.props.value === current) {
      // Fully typed now without casting
      return child.props.children(formApi as any);
    }
  }

  // Dev warning removed.

  if (fallback) {
    if (typeof fallback === "function") {
      // Narrow to the function variant of the fallback union
      return (fallback as (form: UseFormReturn<T>) => React.ReactNode)(
        formApi as any
      );
    }
    return fallback;
  }
  return null;
}

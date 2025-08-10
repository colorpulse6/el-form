import React from "react";
import { UseFormReturn } from "el-form-react-hooks";

interface FormSwitchProps<T extends Record<string, any>> {
  /**
   * Current discriminator value. May be temporarily undefined during initial render
   * if the form field has not been initialized yet, so we allow undefined for robustness.
   */
  on: string | undefined | null;
  form: UseFormReturn<T>;
  children: React.ReactNode;
}

export function FormSwitch<T extends Record<string, any>>({
  on,
  form,
  children,
}: FormSwitchProps<T>) {
  // If the discriminator hasn't been set yet, don't attempt to render a branch.
  if (on == null) return null;

  const childrenArray = React.Children.toArray(children);

  // Type guard to ensure an element matches the expected FormCase shape
  function isFormCaseElement(el: unknown): el is React.ReactElement<{
    value: string;
    children: (form: UseFormReturn<T>) => React.ReactNode;
  }> {
    if (!React.isValidElement(el)) return false;
    const props: any = el.props;
    return (
      props &&
      typeof props.value === "string" &&
      typeof props.children === "function"
    );
  }

  for (const child of childrenArray) {
    if (!isFormCaseElement(child)) continue;
    if (child.props.value === on) {
      // Fully typed now without casting
      return child.props.children(form);
    }
  }

  // If we got here, no matching case was found. Provide a helpful dev warning.
  if (process.env.NODE_ENV !== "production") {
    const available = childrenArray
      .filter(isFormCaseElement)
      .map((c) => c.props.value)
      .join(", ");
    // Only warn if there is at least one FormCase child (otherwise user might be composing differently)
    if (available) {
      // eslint-disable-next-line no-console
      console.warn(
        `[el-form] FormSwitch: no FormCase matched value "${on}". Available cases: [${available}].` +
          " This can happen if defaultValues uses a value outside the discriminated union, the field was reset, or the FormCase value has a typo."
      );
    }
  }

  return null;
}

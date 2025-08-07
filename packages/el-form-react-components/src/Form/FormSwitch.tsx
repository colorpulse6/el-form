import React from "react";
import { UseFormReturn } from "el-form-react-hooks";

interface FormSwitchProps<T extends Record<string, any>> {
  on: string;
  form: UseFormReturn<T>;
  children: React.ReactNode;
}

export function FormSwitch<T extends Record<string, any>>({
  on,
  form,
  children,
}: FormSwitchProps<T>) {
  const childrenArray = React.Children.toArray(children);

  for (const child of childrenArray) {
    if (React.isValidElement(child) && child.props.value === on) {
      // Type assertion to narrow the form to the specific branch
      // This is safe because we're conditionally rendering based on the discriminator value
      return child.props.children(form as any);
    }
  }

  return null;
}

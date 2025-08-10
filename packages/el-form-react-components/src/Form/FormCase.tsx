import React from "react";
import { UseFormReturn } from "el-form-react-hooks";

type DiscriminatorPrimitive = string | number | boolean;

interface FormCaseProps<T extends Record<string, any>> {
  value: DiscriminatorPrimitive;
  children: (form: UseFormReturn<T>) => React.ReactNode;
}

export function FormCase<T extends Record<string, any>>(
  _props: FormCaseProps<T>
) {
  // Shell component: intentionally renders nothing.
  // The render function (children) is invoked by FormSwitch when its value matches.
  return null;
}

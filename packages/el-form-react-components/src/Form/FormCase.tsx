import React from "react";
import { UseFormReturn } from "el-form-react-hooks";

interface FormCaseProps<T extends Record<string, any>> {
  value: string;
  children: (form: UseFormReturn<T>) => React.ReactNode;
}

export function FormCase<T extends Record<string, any>>({
  children,
}: FormCaseProps<T>) {
  // This component is a shell. The logic is handled by FormSwitch.
  return <>{children}</>;
}

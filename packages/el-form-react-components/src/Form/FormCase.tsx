// @deprecated FormCase will be removed in a future version. Use conditional rendering with `useFormWatch` instead.
import React from "react";
import type { UseFormReturn, Path } from "el-form-react-hooks";
import type { CaseOf, Allowed } from "./types";

export interface FormCaseProps<
  T extends Record<string, any>,
  P extends Path<T>,
  V extends Allowed<T, P>
> {
  value: V;
  children: (form: UseFormReturn<CaseOf<T, P, V>>) => React.ReactNode;
}

export function FormCase<
  T extends Record<string, any>,
  P extends Path<T>,
  const V extends Allowed<T, P>
>(_props: FormCaseProps<T, P, V>) {
  // Shell component: intentionally renders nothing.
  // The render function (children) is invoked by FormSwitch when its value matches.
  return null;
}

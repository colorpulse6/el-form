import React from "react";
import type { UseFormReturn, Path } from "el-form-react-hooks";
import type { CaseOf, Allowed } from "./types";
import type { z } from "zod";

// Schema-aware FormCase with compile-time validation
export function SchemaFormCase<
  T extends z.ZodDiscriminatedUnion<any, any>,
  V extends z.infer<T>["type"]
>(_props: {
  value: V;
  children: (
    form: UseFormReturn<Extract<z.infer<T>, { type: V }>>
  ) => React.ReactNode;
}) {
  // Shell component: intentionally renders nothing.
  // The render function (children) is invoked by FormSwitch when its value matches.
  return null;
}

// Utility for creating type-safe FormCase components
export function createFormCase<
  T extends Record<string, any>,
  P extends Path<T>
>() {
  return function FormCase<V extends Allowed<T, P>>(_props: {
    value: V;
    children: (form: UseFormReturn<CaseOf<T, P, V>>) => React.ReactNode;
  }) {
    // Shell component: intentionally renders nothing.
    // The render function (children) is invoked by FormSwitch when its value matches.
    return null;
  };
}

// Legacy FormCase for backward compatibility
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

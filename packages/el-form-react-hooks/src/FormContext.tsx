import React, { createContext, useContext } from "react";
import { UseFormReturn, FormContextValue } from "./types";

// Context with proper generic typing
const FormContext = createContext<FormContextValue<any> | undefined>(undefined);

// Provider component
export function FormProvider<T extends Record<string, any>>({
  children,
  form,
  formId,
}: {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  formId?: string;
}) {
  return (
    <FormContext.Provider value={{ form, formId }}>
      {children}
    </FormContext.Provider>
  );
}

// Hook to access form context with proper typing
export function useFormContext<
  T extends Record<string, any> = any
>(): FormContextValue<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context as FormContextValue<T>;
}

// Convenience hook to get just the form
export function useFormState<
  T extends Record<string, any> = any
>(): UseFormReturn<T> {
  const { form } = useFormContext<T>();
  return form;
}

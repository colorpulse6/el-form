import React, { createContext, useContext, useEffect, useRef } from "react";
import { SubscriptionContext } from "./SubscriptionContext";
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
  const listenersRef = useRef(new Set<() => void>());

  // Notify subscribers whenever the formState object changes
  useEffect(() => {
    listenersRef.current.forEach((cb) => cb());
  }, [form.formState]);

  const subscribe = (cb: () => void) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  };

  const getState = () => form.formState;

  return (
    <FormContext.Provider value={{ form, formId }}>
      <SubscriptionContext.Provider value={{ subscribe, getState }}>
        {children}
      </SubscriptionContext.Provider>
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

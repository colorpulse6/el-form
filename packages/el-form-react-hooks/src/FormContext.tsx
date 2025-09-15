import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { SubscriptionContext } from "./SubscriptionContext";
import { UseFormReturn, FormContextValue } from "./types";
import {
  getTypeName,
  getDiscriminatedUnionInfo,
  getLiteralValue,
} from "el-form-core";

// Context with proper generic typing
const FormContext = createContext<FormContextValue<any> | undefined>(undefined);

// Discriminated Union Context for schema-driven FormSwitch
export interface DiscriminatedUnionContextValue {
  schema?: any;
  unionMetadata?: {
    discriminatorField: string;
    options: Array<{ value: string; label: string }>;
    unionOptions: Record<string, any[]>;
  };
}

const DiscriminatedUnionContext = createContext<
  DiscriminatedUnionContextValue | undefined
>(undefined);

// Provider component
export function FormProvider<T extends Record<string, any>>({
  children,
  form,
  formId,
  schema,
}: {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  formId?: string;
  schema?: any;
}) {
  const listenersRef = useRef(new Set<() => void>());
  const latestFormRef = useRef(form);

  useEffect(() => {
    latestFormRef.current = form;
  }, [form]);

  // Notify subscribers whenever the formState object changes
  useEffect(() => {
    listenersRef.current.forEach((cb) => cb());
  }, [form.formState]);

  const subscribe = useCallback((cb: () => void) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  const getState = useCallback(() => latestFormRef.current.formState, []);

  // Stable context value that always exposes the latest form via getter without changing identity
  const stableContextRef = useRef<{
    form: UseFormReturn<T>;
    formId?: string;
  }>();
  if (!stableContextRef.current) {
    const holder: any = {};
    Object.defineProperty(holder, "form", {
      get: () => latestFormRef.current,
      enumerable: true,
    });
    Object.defineProperty(holder, "formId", {
      get: () => formId,
      enumerable: true,
    });
    stableContextRef.current = holder as {
      form: UseFormReturn<T>;
      formId?: string;
    };
  }
  const subscriptionContextValue = useMemo(
    () => ({ subscribe, getState }),
    [subscribe, getState]
  );

  // Extract discriminated union metadata from schema if provided
  const discriminatedUnionValue = useMemo(() => {
    if (!schema) return undefined;

    // Import discriminated union utilities from el-form-core
    // const { getTypeName, getDiscriminatedUnionInfo, getLiteralValue } = require("el-form-core");

    if (getTypeName(schema) === "ZodDiscriminatedUnion") {
      const du = getDiscriminatedUnionInfo(schema);
      if (!du) return undefined;
      const { discriminator: discriminatorField, options } = du;

      return {
        schema,
        unionMetadata: {
          discriminatorField,
          options: options.map((option: any) => {
            const discriminatorValue = getLiteralValue(
              option.shape[discriminatorField]
            );
            return {
              value: discriminatorValue,
              label:
                String(discriminatorValue).charAt(0).toUpperCase() +
                String(discriminatorValue).slice(1),
            };
          }),
          unionOptions: options.reduce(
            (acc: Record<string, any[]>, option: any) => {
              const discriminatorValue = getLiteralValue(
                option.shape[discriminatorField]
              );
              // Generate fields from the option schema (simplified version)
              acc[String(discriminatorValue)] = []; // We'll populate this properly
              return acc;
            },
            {}
          ),
        },
      };
    }

    return { schema };
  }, [schema]);

  return (
    <FormContext.Provider value={stableContextRef.current as any}>
      <SubscriptionContext.Provider value={subscriptionContextValue}>
        <DiscriminatedUnionContext.Provider value={discriminatedUnionValue}>
          {children}
        </DiscriminatedUnionContext.Provider>
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

// Hook to access discriminated union context
export function useDiscriminatedUnionContext():
  | DiscriminatedUnionContextValue
  | undefined {
  return useContext(DiscriminatedUnionContext);
}

import React, { createContext, useContext } from "react";
import type { FormState } from "./types";

export interface SubscriptionContextValue<T extends Record<string, any>> {
  subscribe: (cb: () => void) => () => void;
  getState: () => FormState<T>;
}

const SubscriptionContext = createContext<SubscriptionContextValue<any> | null>(
  null
);

export function useSubscriptionContext<T extends Record<string, any>>() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx)
    throw new Error(
      "useSubscriptionContext must be used within a FormProvider"
    );
  return ctx as SubscriptionContextValue<T>;
}

export { SubscriptionContext };

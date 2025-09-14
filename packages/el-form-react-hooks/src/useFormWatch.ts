import { useContext, useState, useEffect, useCallback } from "react";
import { getNestedValue } from "el-form-core";
import { SubscriptionContext } from "./SubscriptionContext";
import type { Path, PathValue, FormState } from "./types";

export function useFormWatch<T extends Record<string, any>, P extends Path<T>>(
  name: P
): PathValue<T, P> {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useFormWatch must be used within a FormProvider");
  }

  const { subscribe, getState } = context;

  const [value, setValue] = useState<PathValue<T, P>>(
    getNestedValue(getState().values, name)
  );

  const memoizedSelector = useCallback(
    (state: FormState<T>) => getNestedValue(state.values, name),
    [name]
  );

  useEffect(() => {
    const checkForUpdate = () => {
      const wholeFormState = getState();
      const newValue = memoizedSelector(wholeFormState);
      setValue((prevValue: PathValue<T, P>) => {
        if (prevValue !== newValue) {
          return newValue;
        }
        return prevValue;
      });
    };

    const unsubscribe = subscribe(checkForUpdate);
    // Initial check in case the value has changed between component render and effect execution
    checkForUpdate();
    return unsubscribe;
  }, [subscribe, memoizedSelector, getState]);

  return value;
}

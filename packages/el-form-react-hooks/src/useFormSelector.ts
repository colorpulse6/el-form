import { useRef, useSyncExternalStore } from "react";
import { useFormContext } from "./FormContext";
import type { FormState } from "./types";

/**
 * Select a slice of the form state and subscribe to changes in that slice.
 * Default equality uses Object.is. Pass a custom equality for arrays/objects
 * (e.g., shallowEqual) to avoid unnecessary notifications.
 */
export function useFormSelector<TSelected>(
  selector: (s: FormState<any>) => TSelected,
  equalityFn: (a: TSelected, b: TSelected) => boolean = Object.is
): TSelected {
  const { form, subscribe, getState } = useFormContext<any>();

  const lastSelectedRef = useRef<TSelected | undefined>(undefined);

  const subscribeFn = (onStoreChange: () => void) => {
    if (subscribe) return subscribe(onStoreChange);
    // Fallback: no-op unsubscribe if no provider subscribe is available
    return () => {};
  };

  const getSnapshot = () => {
    const state = (getState ? getState() : form.formState) as FormState<any>;
    const nextSelected = selector(state);
    const prevSelected = lastSelectedRef.current;
    if (prevSelected !== undefined && equalityFn(prevSelected, nextSelected)) {
      return prevSelected;
    }
    lastSelectedRef.current = nextSelected;
    return nextSelected;
  };

  const getServerSnapshot = getSnapshot;

  return useSyncExternalStore(subscribeFn, getSnapshot, getServerSnapshot);
}

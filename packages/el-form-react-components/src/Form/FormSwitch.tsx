// @deprecated FormSwitch will be removed in a future version. Use conditional rendering with `useFormWatch` instead.
import React from "react";
import {
  UseFormReturn,
  useFormSelector,
  useField,
  useFormContext,
} from "el-form-react-hooks";
import type { Path, PathValue } from "el-form-react-hooks";
import type { Allowed, Unique } from "./types";
import type { FormCaseProps } from "./FormCase";

// Supported primitive discriminator types
type DiscriminatorPrimitive = string | number | boolean;

// Preserve per-child V inference for narrowing via a mapped union with captured V
type CaseElement<
  T extends Record<string, any>,
  P extends Path<T>
> = Allowed<T, P> extends infer V
  ? V extends Allowed<T, P>
    ? React.ReactElement<FormCaseProps<T, P, V>>
    : never
  : never;

// Anchored, type-safe props (preferred)
type AnchoredBaseProps<
  T extends Record<string, any>,
  P extends Path<T> = Path<T>
> = {
  field: P;
  select?: (state: { values: Partial<T> }) => PathValue<T, P>;
  children: CaseElement<T, P> | CaseElement<T, P>[];
};


// Back-compat props (no narrowing)
type BackCompatProps<T extends Record<string, any>> = {
  on?: DiscriminatorPrimitive | undefined | null;
  form?: UseFormReturn<T>;
  children: React.ReactNode;
  // Explicitly forbid anchored props so this overload can't match when they are present
  field?: never;
  select?: never;
  values?: never;
};

export type FormSwitchProps<
  T extends Record<string, any>,
  P extends Path<T> = Path<T>,
  V extends readonly Allowed<T, P>[] = readonly Allowed<T, P>[]
> =
  | (AnchoredBaseProps<T, P> & { values?: V & Unique<V> })
  | BackCompatProps<T>;

// Overload: Anchored WITH values (infer V and enforce uniqueness)
export function FormSwitch<
  T extends Record<string, any>,
  P extends Path<T>,
  const V extends readonly Allowed<T, P>[] = readonly Allowed<T, P>[]
>(
  props: AnchoredBaseProps<T, P> & { values: readonly [...V] & Unique<readonly [...V]> }
): JSX.Element | null;

// Overload: Anchored WITHOUT values
export function FormSwitch<
  T extends Record<string, any>,
  P extends Path<T>
>(props: AnchoredBaseProps<T, P>): JSX.Element | null;

// Overload: Back-compat API
export function FormSwitch<T extends Record<string, any>>(
  props: BackCompatProps<T>
): JSX.Element | null;

// Implementation
export function FormSwitch<
  T extends Record<string, any>,
  P extends Path<T> = Path<T>
>(props: any) {
  // eslint-disable-next-line no-console
  console.warn(
    "FormSwitch is deprecated and will be removed in a future version. Use conditional rendering with `useFormWatch` instead."
  );
  // Prefer new API: anchored by field
  if ("field" in props) {
    const { field, select, values, children } = props;
    const ctx = useFormContext<T>();
    const formApi = ctx?.form as UseFormReturn<T> | undefined;

    // Read current discriminant value
    let current: Allowed<T, P> | undefined | null = undefined;
    if (select) {
      current = useFormSelector((state: any) =>
        select({ values: (state as any).values as Partial<T> })
      ) as any;
    } else {
      const slice = useField<T, P>(field);
      current = slice.value as any;
    }

    // If the discriminator hasn't been set yet, don't attempt to render a branch.
    if (current == null) return null;

    const childrenArray = React.Children.toArray(children);

    // Detect duplicate case values at runtime for developer feedback
    const seen = new Set<DiscriminatorPrimitive>();
    for (const child of childrenArray) {
      if (!React.isValidElement(child)) continue;
      const val = (child as any).props?.value as DiscriminatorPrimitive;
      if (val === undefined) continue;
      if (seen.has(val)) {
        // eslint-disable-next-line no-console
        console.warn(
          "FormSwitch: duplicate case value detected:",
          val,
          "— ensure case values are unique."
        );
      }
      seen.add(val);
    }

    // If a values tuple was provided, perform dev-time checks
    if (values && Array.isArray(values)) {
      const allowedSet = new Set(values as readonly DiscriminatorPrimitive[]);
      for (const child of childrenArray) {
        if (!React.isValidElement(child)) continue;
        const val = (child as any).props?.value as DiscriminatorPrimitive;
        if (val !== undefined && !allowedSet.has(val)) {
          // eslint-disable-next-line no-console
          console.warn(
            "FormSwitch: child case value not present in provided 'values' tuple:",
            val
          );
        }
      }
      if (!allowedSet.has(current as any)) {
        // eslint-disable-next-line no-console
        console.warn(
          "FormSwitch: current discriminant value not present in provided 'values' tuple:",
          current
        );
      }
    }

    // Type guard for FormCase elements in anchored mode
    function isFormCaseElement<V extends Allowed<T, P>>(
      el: unknown
    ): el is React.ReactElement<FormCaseProps<T, P, V>> {
      if (!React.isValidElement(el)) return false;
      const props: any = el.props;
      return (
        props &&
        ["string", "number", "boolean"].includes(typeof props.value) &&
        typeof props.children === "function"
      );
    }

    for (const child of childrenArray) {
      if (!isFormCaseElement(child)) continue;
      if ((child.props as any).value === (current as any)) {
        return (child.props.children as any)(formApi as any);
      }
    }

    return null;
  }

  // Back-compat branch: on + form, no narrowing
  const { on, form, children } = props as BackCompatProps<T>;
  if (on !== undefined) {
    // eslint-disable-next-line no-console
    console.warn(
      "FormSwitch: 'form' and 'on' props are deprecated; use the 'field' prop for type-safe narrowing."
    );
  }

  const current: DiscriminatorPrimitive | undefined | null = on as any;
  if (current == null) return null;
  const formApi = (form as UseFormReturn<T> | undefined) ??
    useFormContext<T>()?.form;

  const childrenArray = React.Children.toArray(children);
  function isFormCaseElementCompat(el: unknown): el is React.ReactElement<{
    value: DiscriminatorPrimitive;
    children: (form: UseFormReturn<T>) => React.ReactNode;
  }> {
    if (!React.isValidElement(el)) return false;
    const props: any = el.props;
    return (
      props &&
      ["string", "number", "boolean"].includes(typeof props.value) &&
      typeof props.children === "function"
    );
  }

  for (const child of childrenArray) {
    if (!isFormCaseElementCompat(child)) continue;
    if (child.props.value === current) {
      return child.props.children((formApi as any) as UseFormReturn<T>);
    }
  }

  return null;
}

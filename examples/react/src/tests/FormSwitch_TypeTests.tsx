// Type-level tests for FormSwitch/FormCase discriminated union narrowing
import { FormSwitch, FormCase } from "el-form-react-components";
import { useForm, FormProvider } from "el-form-react-hooks";

export default function FormSwitchTypeTests() {
  type FormData = { kind: "a"; aValue: string } | { kind: "b"; bValue: string };

  const form = useForm<FormData>({
    defaultValues: { kind: "a", aValue: "" },
  });

  // Valid narrowing: register only accepts keys in the current branch
  (() => (
    <FormProvider form={form}>
      <FormSwitch<FormData, "kind"> field="kind" values={["a", "b"] as const}>
        <FormCase<FormData, "kind", "a"> value="a">
          {(f) => {
            f.register("a");
            // @ts-expect-error wrong field in 'a' branch
            f.register("bValue");
            // Intentionally trying an invalid key here would fail if narrowing is effective.
            return null;
          }}
        </FormCase>
        <FormCase<FormData, "kind", "b"> value="b">
          {(f) => {
            f.register("bValue");
            // @ts-expect-error wrong field in 'b' branch
            f.register("aValue");
            // Intentionally trying an invalid key here would fail if narrowing is effective.
            return null;
          }}
        </FormCase>
      </FormSwitch>
    </FormProvider>
  ))();

  // Duplicate values tuple should be flagged at compile-time
  (() => (
    <FormSwitch<FormData, "kind", ["a", "a"]>
      field="kind"
      // @ts-expect-error duplicate discriminant values are not allowed
      values={["a", "a"] as const}
    >
      <FormCase value="a">{() => null}</FormCase>
    </FormSwitch>
  ))();

  // Mismatched selector return type should error
  (() => (
    <FormSwitch<FormData, "kind">
      field="kind"
      values={["a", "b"] as const}
      // @ts-expect-error select must return the same type as the field path value
      select={() => 123}
    >
      <FormCase value="a">{() => null}</FormCase>
    </FormSwitch>
  ))();

  return null;
}

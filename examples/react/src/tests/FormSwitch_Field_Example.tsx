import { useForm, FormProvider } from "el-form-react-hooks";
import { FormSwitch, FormCase } from "el-form-react-components";

export default function FormSwitchFieldExample() {
  const form = useForm<{ kind: "a" | "b"; aValue?: string; bValue?: string }>({
    defaultValues: { kind: "a", aValue: "", bValue: "" },
  });

  const kindField = form.register("kind");

  return (
    <FormProvider form={form}>
      <div>
        <label>
          Kind
          <select {...kindField} aria-label="kind">
            <option value="a">A</option>
            <option value="b">B</option>
          </select>
        </label>

        <FormSwitch field="kind">
          <FormCase value="a">
            {(f) => (
              <label>
                A Value
                <input
                  aria-label="aValue"
                  type="text"
                  {...f.register("aValue")}
                />
              </label>
            )}
          </FormCase>
          <FormCase value="b">
            {(f) => (
              <label>
                B Value
                <input
                  aria-label="bValue"
                  type="text"
                  {...f.register("bValue")}
                />
              </label>
            )}
          </FormCase>
        </FormSwitch>
      </div>
    </FormProvider>
  );
}

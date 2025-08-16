import React from "react";
import { useForm } from "el-form-react-hooks";
import { FormSwitch, FormCase } from "el-form-react-components";

// Back-compat example: using deprecated `on` and `form` props
export default function FormSwitchBackCompatExample() {
  const form = useForm<{
    kind: "left" | "right";
    left?: string;
    right?: string;
  }>({
    defaultValues: { kind: "left" },
  });

  return (
    <div>
      <label>
        Kind
        <select {...form.register("kind")} aria-label="kind">
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </label>

      <FormSwitch on={form.watch("kind")} form={form}>
        <FormCase value="left">
          {(f) => (
            <label>
              Left
              <input aria-label="left" type="text" {...f.register("left")} />
            </label>
          )}
        </FormCase>
        <FormCase value="right">
          {(f) => (
            <label>
              Right
              <input aria-label="right" type="text" {...f.register("right")} />
            </label>
          )}
        </FormCase>
      </FormSwitch>
    </div>
  );
}

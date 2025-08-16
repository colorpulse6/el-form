import React from "react";
import { useForm, FormProvider, useFormSelector } from "el-form-react-hooks";
import { FormSwitch, FormCase } from "el-form-react-components";

export default function FormSwitchSelectExample() {
  const form = useForm<{
    profile: { type: "guest" | "member" };
    guestCode?: string;
    memberId?: string;
  }>({
    defaultValues: { profile: { type: "guest" }, guestCode: "", memberId: "" },
  });

  const selector = (s: any) => s.values.profile?.type ?? "guest";

  return (
    <FormProvider form={form}>
      <div>
        <label>
          Profile Type
          <select {...form.register("profile.type")} aria-label="type">
            <option value="guest">Guest</option>
            <option value="member">Member</option>
          </select>
        </label>

        <FormSwitch select={selector}>
          <FormCase value="guest">
            {(f) => (
              <label>
                Guest Code
                <input
                  aria-label="guestCode"
                  type="text"
                  {...f.register("guestCode")}
                />
              </label>
            )}
          </FormCase>
          <FormCase value="member">
            {(f) => (
              <label>
                Member ID
                <input
                  aria-label="memberId"
                  type="text"
                  {...f.register("memberId")}
                />
              </label>
            )}
          </FormCase>
        </FormSwitch>
      </div>
    </FormProvider>
  );
}

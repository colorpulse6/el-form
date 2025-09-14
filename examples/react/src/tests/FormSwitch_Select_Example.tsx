import { useForm, FormProvider, useFormState, useFormWatch } from "el-form-react-hooks";

export default function FormSwitchSelectExample() {
  type FormData = {
    profile: { type: "guest" | "member" };
    guestCode?: string;
    memberId?: string;
  };

  const form = useForm<FormData>({
    defaultValues: { profile: { type: "guest" }, guestCode: "", memberId: "" },
  });

  return (
    <FormProvider form={form}>
      <InnerForm />
    </FormProvider>
  );
}

function InnerForm() {
  const { register } = useFormState();
  const profileType = useFormWatch("profile.type");

  return (
    <div>
      <label>
        Profile Type
        <select {...register("profile.type")} aria-label="type">
          <option value="guest">Guest</option>
          <option value="member">Member</option>
        </select>
      </label>

      {profileType === "guest" && (
        <label>
          Guest Code
          <input
            aria-label="guestCode"
            type="text"
            {...register("guestCode")}
          />
        </label>
      )}
      {profileType === "member" && (
        <label>
          Member ID
          <input
            aria-label="memberId"
            type="text"
            {...register("memberId")}
          />
        </label>
      )}
    </div>
  );
}

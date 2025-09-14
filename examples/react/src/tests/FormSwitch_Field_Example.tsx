import { useForm, FormProvider, useFormState, useFormWatch } from "el-form-react-hooks";

export default function FormSwitchFieldExample() {
  type FormData =
    | { kind: "a"; aValue: string }
    | { kind: "b"; bValue: string };

  const form = useForm<FormData>({
    defaultValues: { kind: "a", aValue: "" },
  });

  return (
    <FormProvider form={form}>
      <InnerForm />
    </FormProvider>
  );
}

function InnerForm() {
  const { register } = useFormState();
  const kindValue = useFormWatch("kind");

  return (
    <div>
      <label>
        Kind
        <select {...register("kind")} aria-label="kind">
          <option value="a">A</option>
          <option value="b">B</option>
        </select>
      </label>

      {kindValue === "a" && (
        <label>
          A Value
          <input
            aria-label="aValue"
            type="text"
            {...register("aValue")}
          />
        </label>
      )}
      {kindValue === "b" && (
        <label>
          B Value
          <input
            aria-label="bValue"
            type="text"
            {...register("bValue")}
          />
        </label>
      )}
    </div>
  );
}

import type { SandpackFiles } from "@codesandbox/sandpack-react";

const APP = `import {
  useForm,
  FormProvider,
  useFormContext,
  useFieldArray,
} from "el-form-react-hooks";

type Form = { items: { name: string; quantity: number }[] };

export default function App() {
  // useFieldArray reads the form from context, so wrap the fields in
  // <FormProvider> and consume it with useFormContext inside <Items />.
  const form = useForm<Form>({
    defaultValues: { items: [{ name: "", quantity: 1 }] },
  });

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif", maxWidth: 420 }}>
      <FormProvider form={form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            alert(JSON.stringify(data, null, 2))
          )}
          style={{ display: "grid", gap: 12 }}
        >
          <Items />
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    </div>
  );
}

function Items() {
  const { register } = useFormContext<Form>();
  const { fields, append, remove } = useFieldArray<Form, "items">({
    name: "items",
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id} style={{ display: "flex", gap: 8 }}>
          {/* key is the stable field.id, never the array index */}
          <input {...register(\`items.\${index}.name\`)} placeholder="Name" />
          <input
            type="number"
            {...register(\`items.\${index}.quantity\`)}
            placeholder="Qty"
            style={{ width: 70 }}
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: "", quantity: 1 })}>
        Add item
      </button>
    </>
  );
}
`;

export const fieldArrayFiles: SandpackFiles = { "/App.tsx": APP };

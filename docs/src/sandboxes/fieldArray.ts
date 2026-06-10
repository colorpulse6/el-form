import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { EXAMPLE_STYLES } from "./exampleStyles";

const APP = `import {
  useForm,
  FormProvider,
  useFormContext,
  useFieldArray,
} from "el-form-react-hooks";
import "./styles.css";

type Form = { items: { name: string; quantity: number }[] };

export default function App() {
  // useFieldArray reads the form from context, so wrap the fields in
  // <FormProvider> and consume it with useFormContext inside <Items />.
  const form = useForm<Form>({
    defaultValues: { items: [{ name: "", quantity: 1 }] },
  });

  return (
    <FormProvider form={form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          alert(JSON.stringify(data, null, 2))
        )}
      >
        <Items />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

function Items() {
  const { register } = useFormContext<Form>().form;
  const { fields, append, remove } = useFieldArray<Form, "items">({
    name: "items",
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id} className="row">
          {/* key is the stable field.id, never the array index */}
          <input {...register(\`items.\${index}.name\`)} placeholder="Name" />
          <input
            type="number"
            {...register(\`items.\${index}.quantity\`)}
            placeholder="Qty"
            style={{ width: 90 }}
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

export const fieldArrayFiles: SandpackFiles = {
  "/App.tsx": APP,
  "/styles.css": EXAMPLE_STYLES,
};

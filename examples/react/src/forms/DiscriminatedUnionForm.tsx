import { useForm } from "el-form-react-hooks";
import { z } from "zod";
import { FormSwitch, FormCase } from "el-form-react-components";

const catSchema = z.object({
  type: z.literal("cat"),
  meow: z.string().min(1, "Meow is required"),
});

const dogSchema = z.object({
  type: z.literal("dog"),
  bark: z.string().min(1, "Bark is required"),
});

const animalSchema = z.discriminatedUnion("type", [catSchema, dogSchema]);

type AnimalSchema = z.infer<typeof animalSchema>;

export function DiscriminatedUnionForm() {
  const form = useForm<AnimalSchema>({
    validators: {
      onChange: animalSchema,
    },
    defaultValues: {
      type: "cat",
      meow: "",
    },
  });

  const { watch, handleSubmit } = form;
  const type = watch("type");

  const onSubmit = handleSubmit((data) => {
    console.log("Form submitted:", data);
    alert("Success! Check the console.");
  });

  return (
    <form onSubmit={onSubmit}>
      <select {...form.register("type")}>
        <option value="cat">Cat</option>
        <option value="dog">Dog</option>
      </select>

      <FormSwitch on={type} form={form}>
        <FormCase value="cat">
          {(catForm) => (
            <div>
              <label>Meow</label>
              <input {...catForm.register("meow")} />
              {catForm.formState.errors.meow && (
                <p>{catForm.formState.errors.meow}</p>
              )}
            </div>
          )}
        </FormCase>
        <FormCase value="dog">
          {(dogForm) => (
            <div>
              <label>Bark</label>
              <input {...dogForm.register("bark")} />
              {dogForm.formState.errors.bark && (
                <p>{dogForm.formState.errors.bark}</p>
              )}
            </div>
          )}
        </FormCase>
      </FormSwitch>

      <button type="submit">Submit</button>
    </form>
  );
}

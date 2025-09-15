import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const catSchema = z.object({
  type: z.literal("cat"),
  meow: z.string().min(1, "Meow is required"),
  favoriteFood: z.string().min(1, "Favorite food is required"),
});

const dogSchema = z.object({
  type: z.literal("dog"),
  bark: z.string().min(1, "Bark is required"),
  breed: z.string().min(1, "Breed is required"),
});

const animalSchema = z.discriminatedUnion("type", [catSchema, dogSchema]);

export function AutoDiscriminatedUnionForm() {
  const handleSubmit = (data: any) => {
    console.log("AutoForm submitted:", data);
    alert("Success! Check the console.");
  };

  return (
    <div>
      <h2>AutoForm with Discriminated Union</h2>
      <p>
        This form is automatically generated from a discriminated union schema!
      </p>

      <AutoForm
        schema={animalSchema}
        onSubmit={handleSubmit}
        initialValues={{ type: "cat", meow: "" }}
        columns={1}
      />
    </div>
  );
}

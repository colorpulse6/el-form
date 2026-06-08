import { AutoForm } from "el-form-react-components";
import { useState } from "react";
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
  const [submitResult, setSubmitResult] = useState<any>(null);

  const handleSubmit = (data: any) => {
    console.log("AutoForm submitted:", data);
    setSubmitResult(data);
    window.setTimeout(() => alert("Success! Check the console."), 0);
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

      {submitResult && (
        <pre data-testid="submit-result">
          {JSON.stringify(submitResult, null, 2)}
        </pre>
      )}
    </div>
  );
}

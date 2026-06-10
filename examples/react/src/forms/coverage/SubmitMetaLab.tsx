import { useForm } from "el-form-react-hooks";
import z from "zod";
import {
  Button,
  Card,
  FormGroup,
  FormSection,
  inputBaseClasses,
} from "../../components/ui";

type SubmitMetaValues = {
  name: string;
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

const defaultValues: SubmitMetaValues = {
  name: "",
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

// Exercises the formState submit-meta trio: isSubmitted / isSubmitSuccessful /
// submitCount (plus isSubmitting). An invalid submit flips isSubmitted and bumps
// submitCount without success; a valid submit sets isSubmitSuccessful; reset
// clears all of them.
export function SubmitMetaLab() {
  const { register, formState, submit, reset } = useForm<SubmitMetaValues>({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: () => {
      // No side effect needed; the meta panel reflects submission state.
    },
  });

  const meta = {
    isSubmitted: formState.isSubmitted,
    isSubmitSuccessful: formState.isSubmitSuccessful,
    submitCount: formState.submitCount,
    isSubmitting: formState.isSubmitting,
  };

  return (
    <div className="space-y-6" data-testid="submit-meta-lab">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Submit Meta Lab</h2>
        <p className="mt-1 text-sm text-gray-600">
          Tracks <code>isSubmitted</code>, <code>isSubmitSuccessful</code>, and{" "}
          <code>submitCount</code> across invalid submit, valid submit, and
          reset.
        </p>
      </div>

      <FormSection title="Field" variant="gray">
        <FormGroup
          label="Name"
          htmlFor="meta-name"
          required
          error={formState.errors.name as string}
        >
          <input
            id="meta-name"
            type="text"
            {...register("name")}
            className={inputBaseClasses}
          />
        </FormGroup>
      </FormSection>

      <FormSection title="Submit controls" variant="amber">
        <Button type="button" className="mr-2 mb-2" onClick={() => submit()}>
          Submit
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="mr-2 mb-2"
          onClick={() => reset()}
        >
          Reset Form
        </Button>
      </FormSection>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          Submit meta
        </h3>
        <pre data-testid="submit-meta-json" className="text-xs">
          {formatJson(meta)}
        </pre>
      </Card>
    </div>
  );
}

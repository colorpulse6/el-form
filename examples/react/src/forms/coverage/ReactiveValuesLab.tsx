import { useState } from "react";
import { useForm } from "el-form-react-hooks";
import {
  Button,
  Card,
  FormGroup,
  FormSection,
  inputBaseClasses,
} from "../../components/ui";

type ReactiveValues = {
  name: string;
  email: string;
};

const defaultValues: ReactiveValues = {
  name: "Ada",
  email: "ada@example.com",
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

// Exercises the reactive `values` option plus `keepDirtyValues`: pushing a new
// external source either overwrites the whole form (keepDirty off) or preserves
// the user's edited fields while syncing the rest (keepDirty on).
export function ReactiveValuesLab() {
  const [externalValues, setExternalValues] =
    useState<ReactiveValues>(defaultValues);
  const [keepDirty, setKeepDirty] = useState(false);

  const { register, formState, watch } = useForm<ReactiveValues>({
    defaultValues,
    values: externalValues,
    keepDirtyValues: keepDirty,
  });

  const values = watch();

  return (
    <div className="space-y-6" data-testid="reactive-values-lab">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reactive Values Lab</h2>
        <p className="mt-1 text-sm text-gray-600">
          The <code>values</code> option re-syncs the form when the external
          source changes; <code>keepDirtyValues</code> preserves edited fields.
        </p>
      </div>

      <FormSection title="External source controls" variant="blue">
        <Button
          type="button"
          className="mr-2 mb-2"
          onClick={() =>
            setExternalValues({
              name: "Grace",
              email: "grace@example.com",
            })
          }
        >
          Push Grace
        </Button>
        <Button
          type="button"
          className="mr-2 mb-2"
          onClick={() =>
            setExternalValues({
              name: "Linus",
              email: "linus@example.com",
            })
          }
        >
          Push Linus
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="mr-2 mb-2"
          onClick={() => setKeepDirty((prev) => !prev)}
        >
          Toggle keepDirtyValues
        </Button>
      </FormSection>

      <FormSection title="Form fields" variant="gray">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormGroup label="Name" htmlFor="rv-name">
            <input
              id="rv-name"
              type="text"
              {...register("name")}
              className={inputBaseClasses}
            />
          </FormGroup>
          <FormGroup label="Email" htmlFor="rv-email">
            <input
              id="rv-email"
              type="email"
              {...register("email")}
              className={inputBaseClasses}
            />
          </FormGroup>
        </div>
      </FormSection>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Form values
          </h3>
          <pre data-testid="rv-values" className="text-xs">
            {formatJson(values)}
          </pre>
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            External source
          </h3>
          <pre data-testid="rv-external" className="text-xs">
            {formatJson(externalValues)}
          </pre>
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Sync state
          </h3>
          <pre data-testid="rv-sync-state" className="text-xs">
            {formatJson({ keepDirtyValues: keepDirty, isDirty: formState.isDirty })}
          </pre>
        </Card>
      </div>
    </div>
  );
}

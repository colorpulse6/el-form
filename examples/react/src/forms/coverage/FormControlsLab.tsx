import { useState, type FocusEvent } from "react";
import { useForm } from "el-form-react-hooks";
import z from "zod";
import {
  Button,
  Card,
  FormGroup,
  FormSection,
  inputBaseClasses,
  selectBaseClasses,
} from "../../components/ui";

type FormControlsValues = {
  name: string;
  email: string;
  age: number;
  role: "user" | "admin";
  notes: string;
  agreed: boolean;
  profile: {
    city: string;
  };
};

const controlsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  age: z.number().min(0, "Age must be zero or greater"),
  role: z.enum(["user", "admin"]),
  notes: z.string(),
  agreed: z.boolean(),
  profile: z.object({
    city: z.string().min(1, "City is required"),
  }),
});

const defaultValues: FormControlsValues = {
  name: "",
  email: "",
  age: 18,
  role: "user",
  notes: "",
  agreed: false,
  profile: {
    city: "",
  },
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function FormControlsLab() {
  const [submitResult, setSubmitResult] = useState<Record<string, unknown>>({
    status: "idle",
  });
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [activeField, setActiveField] = useState("none");

  const logOperation = (label: string) => {
    setOperationLog((current) => [
      `${new Date().toISOString()} ${label}`,
      ...current.slice(0, 19),
    ]);
  };

  const readActiveField = () => {
    const activeElement = document.activeElement;
    if (
      !activeElement ||
      !(activeElement instanceof HTMLElement) ||
      activeElement === document.body
    ) {
      setActiveField("none");
      return;
    }

    const fieldName =
      activeElement.getAttribute("name") ||
      activeElement.getAttribute("id") ||
      "unknown";
    const label = activeElement.dataset.fieldLabel || fieldName;
    setActiveField(`${label} (${fieldName})`);
  };

  const trackFocus = (label: string) => (event: FocusEvent<HTMLElement>) => {
    const fieldName =
      event.currentTarget.getAttribute("name") ||
      event.currentTarget.getAttribute("id") ||
      "unknown";
    setActiveField(`${label} (${fieldName})`);
  };

  const {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    updateValue,
    setValues,
    resetValues,
    resetField,
    setError,
    clearErrors,
    trigger,
    markFieldTouched,
    markFieldUntouched,
    markAllTouched,
    setFocus,
    submit,
    submitAsync,
    canSubmit,
    watch,
    getFieldState,
    isFieldDirty,
    isFieldTouched,
    isFieldValid,
    getDirtyFields,
    getTouchedFields,
    hasErrors,
    getErrorCount,
  } = useForm<FormControlsValues>({
    defaultValues,
    validators: { onChange: controlsSchema, onSubmit: controlsSchema },
    onSubmit: async (values) => {
      setSubmitResult({
        source: "useForm onSubmit",
        success: true,
        data: values,
      });
      logOperation("onSubmit");
    },
  });

  const values = watch();
  const dirtyFields = getDirtyFields();
  const touchedFields = getTouchedFields();
  const fieldState = {
    email: {
      getFieldState: getFieldState("email"),
      isFieldDirty: isFieldDirty("email"),
      isFieldTouched: isFieldTouched("email"),
      isFieldValid: isFieldValid("email"),
    },
    dirtyFields,
    touchedFields,
  };

  const runOperation = (label: string, operation: () => void) => {
    operation();
    logOperation(label);
  };

  const runAsyncOperation = async (
    label: string,
    operation: () => Promise<unknown>
  ) => {
    const result = await operation();
    logOperation(label);
    return result;
  };

  const focusField = (
    label: string,
    name: "name" | "email",
    options?: { shouldSelect?: boolean }
  ) => {
    setFocus(name, options);
    window.setTimeout(readActiveField, 0);
    logOperation(label);
  };

  const onValid = (data: FormControlsValues) => {
    setSubmitResult({
      source: "handleSubmit onValid",
      success: true,
      data,
    });
    logOperation("handleSubmit valid");
  };

  const onError = (errors: Record<keyof FormControlsValues, string>) => {
    setSubmitResult({
      source: "handleSubmit onError",
      success: false,
      errors,
    });
    logOperation("handleSubmit error");
  };

  const buttonClass = "mr-2 mb-2";
  const statusLine = [
    `isValid=${formState.isValid}`,
    `isDirty=${formState.isDirty}`,
    `isSubmitting=${formState.isSubmitting}`,
    `canSubmit=${canSubmit}`,
    `hasErrors=${hasErrors()}`,
    `getErrorCount=${getErrorCount()}`,
  ].join(" | ");

  return (
    <div className="space-y-6" data-testid="form-controls-lab">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Form Controls Lab
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Exercises value, error, touched, focus, and submit APIs from useForm.
        </p>
      </div>

      <Card variant="info" className="text-sm">
        <div data-testid="status-line">{statusLine}</div>
        <div className="mt-2">
          Active field: <span data-testid="active-field">{activeField}</span>
        </div>
      </Card>

      <form
        onSubmit={handleSubmit(onValid, onError)}
        className="space-y-6"
        noValidate
      >
        <FormSection title="Fields" variant="gray">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormGroup
              label="Name"
              htmlFor="name"
              required
              error={formState.errors.name as string}
            >
              <input
                id="name"
                type="text"
                {...register("name")}
                data-field-label="Name"
                onFocus={trackFocus("Name")}
                className={inputBaseClasses}
              />
            </FormGroup>

            <FormGroup
              label="Email"
              htmlFor="email"
              required
              error={formState.errors.email as string}
            >
              <input
                id="email"
                type="email"
                {...register("email")}
                data-field-label="Email"
                onFocus={trackFocus("Email")}
                className={inputBaseClasses}
              />
            </FormGroup>

            <FormGroup
              label="Age"
              htmlFor="age"
              required
              error={formState.errors.age as string}
            >
              <input
                id="age"
                type="number"
                {...register("age")}
                data-field-label="Age"
                onFocus={trackFocus("Age")}
                className={inputBaseClasses}
              />
            </FormGroup>

            <FormGroup
              label="Role"
              htmlFor="role"
              required
              error={formState.errors.role as string}
            >
              <select
                id="role"
                {...register("role")}
                data-field-label="Role"
                onFocus={trackFocus("Role")}
                className={selectBaseClasses}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </FormGroup>

            <FormGroup
              label="Profile City"
              htmlFor="profile-city"
              required
              error={
                (formState.errors as Record<string, string>)["profile.city"]
              }
            >
              <input
                id="profile-city"
                type="text"
                {...register("profile.city")}
                data-field-label="Profile City"
                onFocus={trackFocus("Profile City")}
                className={inputBaseClasses}
              />
            </FormGroup>

            <FormGroup label="Agreed" htmlFor="agreed">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  id="agreed"
                  type="checkbox"
                  {...register("agreed")}
                  data-field-label="Agreed"
                  onFocus={trackFocus("Agreed")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Agreed
              </label>
            </FormGroup>

            <FormGroup
              label="Notes"
              htmlFor="notes"
              className="md:col-span-2"
              error={formState.errors.notes as string}
            >
              <textarea
                id="notes"
                {...register("notes")}
                data-field-label="Notes"
                onFocus={trackFocus("Notes")}
                rows={3}
                className={`${inputBaseClasses} resize-y`}
              />
            </FormGroup>
          </div>

          <Button type="submit" variant="primary">
            Submit Form
          </Button>
        </FormSection>
      </form>

      <FormSection title="Value and Reset APIs" variant="blue">
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runOperation("Set Name Ada", () => setValue("name", "Ada"))
          }
        >
          Set Name Ada
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runOperation("Update Age", () =>
              updateValue("age", (current) => current + 1)
            )
          }
        >
          Update Age
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runOperation("Set Many", () =>
              setValues({
                email: "ada@example.com",
                profile: { city: "Paris" },
              })
            )
          }
        >
          Set Many
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={buttonClass}
          onClick={() => runOperation("Reset Values", () => resetValues())}
        >
          Reset Values
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={buttonClass}
          onClick={() =>
            runOperation("Reset Field Name", () => resetField("name"))
          }
        >
          Reset Field Name
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={buttonClass}
          onClick={() =>
            runOperation("Reset Keep Errors", () =>
              reset({ keepErrors: true })
            )
          }
        >
          Reset Keep Errors
        </Button>
      </FormSection>

      <FormSection title="State, Error, Touched, and Focus APIs" variant="green">
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runOperation("Set Email Error", () =>
              setError("email", "Email already taken")
            )
          }
        >
          Set Email Error
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runOperation("Clear Email Error", () => clearErrors("email"))
          }
        >
          Clear Email Error
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() => runOperation("Clear All Errors", () => clearErrors())}
        >
          Clear All Errors
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runAsyncOperation("Trigger Email", () => trigger("email"))
          }
        >
          Trigger Email
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() => runAsyncOperation("Trigger All", () => trigger())}
        >
          Trigger All
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runOperation("Mark Email Touched", () =>
              markFieldTouched("email")
            )
          }
        >
          Mark Email Touched
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runOperation("Mark Email Untouched", () =>
              markFieldUntouched("email")
            )
          }
        >
          Mark Email Untouched
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            runOperation("Mark All Touched", () => markAllTouched())
          }
        >
          Mark All Touched
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() => focusField("Focus Email", "email")}
        >
          Focus Email
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={() =>
            focusField("Focus Name Select", "name", { shouldSelect: true })
          }
        >
          Focus Name Select
        </Button>
      </FormSection>

      <FormSection title="Submit APIs" variant="amber">
        <Button
          type="button"
          className={buttonClass}
          onClick={() => runAsyncOperation("Submit Programmatic", submit)}
        >
          Submit Programmatic
        </Button>
        <Button
          type="button"
          className={buttonClass}
          onClick={async () => {
            const result = await runAsyncOperation(
              "Submit Async Result",
              submitAsync
            );
            setSubmitResult({
              source: "submitAsync",
              result,
            });
          }}
        >
          Submit Async Result
        </Button>
      </FormSection>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Values</h3>
          <pre
            data-testid="values-json"
            className="max-h-72 overflow-auto text-xs"
          >
            {formatJson(values)}
          </pre>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Errors</h3>
          <pre
            data-testid="errors-json"
            className="max-h-72 overflow-auto text-xs"
          >
            {formatJson(formState.errors)}
          </pre>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Dirty</h3>
          <pre
            data-testid="dirty-json"
            className="max-h-72 overflow-auto text-xs"
          >
            {formatJson(dirtyFields)}
          </pre>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Touched</h3>
          <pre
            data-testid="touched-json"
            className="max-h-72 overflow-auto text-xs"
          >
            {formatJson(touchedFields)}
          </pre>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Field State
          </h3>
          <pre
            data-testid="field-state-json"
            className="max-h-72 overflow-auto text-xs"
          >
            {formatJson(fieldState)}
          </pre>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Submit Result
          </h3>
          <pre
            data-testid="submit-result"
            className="max-h-72 overflow-auto text-xs"
          >
            {formatJson(submitResult)}
          </pre>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Operation Log
          </h3>
          <pre
            data-testid="operation-log"
            className="max-h-72 overflow-auto text-xs"
          >
            {formatJson(operationLog)}
          </pre>
        </Card>
      </div>
    </div>
  );
}

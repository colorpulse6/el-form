import { useState } from "react";
import { FormProvider, useForm, type UseFormReturn } from "el-form-react-hooks";
import {
  AutoForm,
  createField,
  SelectField,
  TextareaField,
  TextField,
  type AutoFormErrorProps,
  type AutoFormFieldProps,
} from "el-form-react-components";
import z from "zod";
import { Button, Card } from "../../components/ui";

type FieldComponentValues = {
  title: string;
  description: string;
  category: string;
};

const fieldComponentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Choose a category"),
});

const fieldComponentDefaults: FieldComponentValues = {
  title: "",
  description: "",
  category: "",
};

const titleHelper = createField<FieldComponentValues, "title">("title");

const autoFormSchema = z.object({
  title: z.string().min(4, "AutoForm title must be at least 4 characters"),
  summary: z.string().min(12, "AutoForm summary must be at least 12 characters"),
  kind: z.enum(["draft", "published"]),
});

type AutoFormValues = z.infer<typeof autoFormSchema>;

const autoFormInitialValues: AutoFormValues = {
  title: "",
  summary: "",
  kind: "draft",
};

type ResultState =
  | { status: "idle" }
  | { status: "prefilled"; data: unknown }
  | { status: "valid"; data: unknown }
  | { status: "error"; errors: Record<string, string> };

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function issuesToErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((errors, issue) => {
    const fieldName = issue.path.join(".") || "form";
    errors[fieldName] = issue.message;
    return errors;
  }, {});
}

function CustomTextField({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  inputRef,
  required,
  error,
  touched,
}: AutoFormFieldProps) {
  const fieldId = `component-lab-autoform-${name}`;
  const errorId = `${fieldId}-error`;

  return (
    <div
      className="space-y-1 rounded-md border border-cyan-200 bg-cyan-50 p-3"
      data-testid={`autoform-custom-${name}`}
    >
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={fieldId} className="text-sm font-semibold text-gray-900">
          {label}
        </label>
        <span
          className="text-xs font-medium uppercase tracking-wide text-cyan-700"
          data-testid="autoform-custom-text-badge"
        >
          componentMap:text
        </span>
      </div>
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        ref={inputRef}
        placeholder={placeholder}
        required={required}
        aria-invalid={touched && error ? true : undefined}
        aria-describedby={touched && error ? errorId : undefined}
        className="w-full rounded-md border border-cyan-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      {touched && error && (
        <div id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

function CustomAutoFormErrors({ errors, touched }: AutoFormErrorProps) {
  const visibleErrors = Object.entries(errors).filter(([field]) => touched[field]);

  return (
    <div
      className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm"
      data-testid="autoform-custom-error-component"
    >
      <div className="font-semibold text-red-900">Custom AutoForm errors</div>
      {visibleErrors.length === 0 ? (
        <div className="mt-1 text-red-700" data-testid="autoform-custom-error-empty">
          No visible AutoForm errors
        </div>
      ) : (
        <ul className="mt-2 space-y-1">
          {visibleErrors.map(([field, error]) => (
            <li key={field} role="alert" data-testid={`autoform-error-${field}`}>
              <span className="font-medium">{field}:</span> {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FieldComponentsSection() {
  const [result, setResult] = useState<ResultState>({ status: "idle" });

  const form = useForm<FieldComponentValues>({
    defaultValues: fieldComponentDefaults,
    validators: {
      onBlur: fieldComponentSchema,
      onSubmit: fieldComponentSchema,
    },
    validateOn: "onBlur",
  });

  const handleValid = (values: FieldComponentValues) => {
    setResult({ status: "valid", data: values });
  };

  const handleError = (errors: Record<keyof FieldComponentValues, string>) => {
    setResult({ status: "error", errors });
  };

  const fillValidValues = () => {
    const values = {
      title: "Component exports",
      description: "Textarea field coverage note",
      category: "guide",
    };
    form.setValues(values);
    form.clearErrors();
    setResult({ status: "prefilled", data: values });
  };

  const showInvalidState = async () => {
    form.markAllTouched();
    await form.trigger();
    const parsed = fieldComponentSchema.safeParse(form.formState.values);
    setResult(
      parsed.success
        ? { status: "valid", data: parsed.data }
        : { status: "error", errors: issuesToErrors(parsed.error) }
    );
  };

  return (
    <Card className="space-y-4" data-testid="field-components-section">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Exported Field Components
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          TextField, TextareaField, and SelectField rendered from FormProvider.
        </p>
      </div>

      <FormProvider form={form}>
        <form
          onSubmit={form.handleSubmit(handleValid, handleError)}
          className="space-y-4"
          noValidate
          data-testid="field-components-form"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div data-testid="field-components-title">
              <TextField<FieldComponentValues, "title">
                name="title"
                label="Export Title"
                placeholder="Enter a title"
                required
              />
            </div>
            <div data-testid="field-components-category">
              <SelectField<FieldComponentValues, "category">
                name="category"
                label="Export Category"
                placeholder="Choose a category"
                required
                options={[
                  { value: "guide", label: "Guide" },
                  { value: "reference", label: "Reference" },
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <div data-testid="field-components-description">
                <TextareaField<FieldComponentValues, "description">
                  name="description"
                  label="Export Description"
                  placeholder="Enter at least 10 characters"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={showInvalidState}
              data-testid="field-components-invalid"
            >
              Show Invalid Field Errors
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={fillValidValues}
              data-testid="field-components-fill-valid"
            >
              Fill Valid Field Values
            </Button>
            <Button type="submit" data-testid="field-components-submit">
              Submit Exported Fields
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.reset();
                setResult({ status: "idle" });
              }}
              data-testid="field-components-reset"
            >
              Reset Exported Fields
            </Button>
          </div>
        </form>
      </FormProvider>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="info">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">
            createField Helper
          </h4>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="font-medium text-gray-700">name</dt>
              <dd data-testid="create-field-name">{String(titleHelper.name)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">getValue</dt>
              <dd data-testid="create-field-value">
                {String(titleHelper.getValue(form) ?? "")}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">getError</dt>
              <dd data-testid="create-field-error">
                {titleHelper.getError(form) ?? "none"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">getTouched</dt>
              <dd data-testid="create-field-touched">
                {String(Boolean(titleHelper.getTouched(form)))}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">
            Field State
          </h4>
          <pre data-testid="field-components-state" className="text-xs">
            {formatJson({
              values: form.formState.values,
              errors: form.formState.errors,
              touched: form.formState.touched,
              canSubmit: form.canSubmit,
            })}
          </pre>
        </Card>

        <Card>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">
            Exported Field Result
          </h4>
          <pre data-testid="field-components-result" className="text-xs">
            {formatJson(result)}
          </pre>
        </Card>
      </div>
    </Card>
  );
}

function AutoFormSection() {
  const [submitResult, setSubmitResult] = useState<ResultState>({
    status: "idle",
  });
  const [errorResult, setErrorResult] = useState<ResultState>({
    status: "idle",
  });

  const fillAutoFormValues = (formApi: UseFormReturn<AutoFormValues>) => {
    const values: AutoFormValues = {
      title: "AutoForm coverage",
      summary: "Custom AutoForm rendering is visible",
      kind: "published",
    };
    formApi.setValues(values);
    formApi.clearErrors();
    setSubmitResult({ status: "prefilled", data: values });
    setErrorResult({ status: "idle" });
  };

  return (
    <Card className="space-y-4" data-testid="autoform-section">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          AutoForm Customization
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Grid layout, field overrides, componentMap, custom errors, and
          render-prop controls.
        </p>
      </div>

      <AutoForm<AutoFormValues>
        schema={autoFormSchema}
        initialValues={autoFormInitialValues}
        validateOn="onSubmit"
        layout="grid"
        columns={12}
        fields={[
          {
            name: "title",
            label: "AutoForm Custom Title",
            placeholder: "Rendered by componentMap",
            colSpan: 6,
            required: false,
          },
          {
            name: "summary",
            label: "AutoForm Summary Override",
            type: "textarea",
            placeholder: "Rendered as a textarea by field config",
            colSpan: 12,
            required: false,
          },
          {
            name: "kind",
            label: "Publication Kind Override",
            placeholder: "Choose a kind",
            colSpan: 6,
            required: false,
          },
        ]}
        componentMap={{ text: CustomTextField }}
        customErrorComponent={CustomAutoFormErrors}
        onSubmit={(values) => {
          setSubmitResult({ status: "valid", data: values });
          setErrorResult({ status: "idle" });
        }}
        onError={(errors) => {
          setErrorResult({
            status: "error",
            errors: errors as Record<string, string>,
          });
          setSubmitResult({ status: "idle" });
        }}
      >
        {(formApi) => (
          <div
            className="mb-4 space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4"
            data-testid="autoform-render-prop-panel"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card variant="info">
                <h4 className="mb-2 text-sm font-semibold text-gray-900">
                  AutoForm Status
                </h4>
                <pre data-testid="autoform-can-submit-panel" className="text-xs">
                  {formatJson({
                    canSubmit: formApi.canSubmit,
                    isValid: formApi.formState.isValid,
                    values: formApi.formState.values,
                  })}
                </pre>
              </Card>
              <Card>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">
                  AutoForm Touched
                </h4>
                <pre data-testid="autoform-touched-panel" className="text-xs">
                  {formatJson(formApi.formState.touched)}
                </pre>
              </Card>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="success"
                onClick={() => fillAutoFormValues(formApi)}
                data-testid="autoform-fill-valid"
              >
                Fill Valid AutoForm Values
              </Button>
              <Button type="submit" data-testid="autoform-submit">
                Submit AutoForm
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  formApi.reset();
                  setSubmitResult({ status: "idle" });
                  setErrorResult({ status: "idle" });
                }}
                data-testid="autoform-reset"
              >
                Reset AutoForm
              </Button>
            </div>
          </div>
        )}
      </AutoForm>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">
            AutoForm Submit Result
          </h4>
          <pre data-testid="autoform-submit-result" className="text-xs">
            {formatJson(submitResult)}
          </pre>
        </Card>
        <Card>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">
            AutoForm Error Result
          </h4>
          <pre data-testid="autoform-error-result" className="text-xs">
            {formatJson(errorResult)}
          </pre>
        </Card>
      </div>
    </Card>
  );
}

export function ComponentLab() {
  return (
    <div className="space-y-6" data-testid="component-lab">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Component Lab</h2>
        <p className="mt-1 text-sm text-gray-600">
          Browser coverage fixture for component package exports.
        </p>
      </div>

      <FieldComponentsSection />
      <AutoFormSection />
    </div>
  );
}

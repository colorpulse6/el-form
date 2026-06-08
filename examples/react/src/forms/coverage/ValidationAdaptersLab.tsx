import { useState } from "react";
import { useForm, type UseFormOptions } from "el-form-react-hooks";
import z from "zod";
import {
  Button,
  Card,
  FormGroup,
  inputBaseClasses,
  inputErrorClasses,
} from "../../components/ui";

type BranchId =
  | "zod"
  | "standard-schema-shape"
  | "custom-function"
  | "yup-like"
  | "valibot-like"
  | "arktype-like"
  | "effect-like";

type AdapterValues = {
  value: string;
};

type AdapterResult =
  | {
      branch: BranchId;
      success: true;
      outcome: "success";
      data: AdapterValues;
    }
  | {
      branch: BranchId;
      success: false;
      outcome: "failure";
      errors: Record<string, string>;
    };

type AdapterBranch = {
  id: BranchId;
  title: string;
  description: string;
  buildOptions: () => UseFormOptions<AdapterValues>;
};

function standardSchema(message = "Standard Schema invalid") {
  return {
    "~standard": {
      validate: (value: any) =>
        value.value === "ok" ? {} : { issues: [{ path: ["value"], message }] },
    },
  };
}

function yupLike(message = "Yup-like invalid") {
  return {
    __isYupSchema__: true,
    validate: () => undefined,
    validateSync: (value: any) => {
      if (value.value !== "ok") {
        throw { inner: [{ path: "value", message }] };
      }
    },
  };
}

function valibotLike(message = "Valibot-like invalid") {
  return {
    _types: {},
    kind: "schema",
    parse: (value: any) => {
      if (value.value !== "ok") {
        throw new Error(message);
      }
    },
  };
}

function arkTypeLike(message = "ArkType-like invalid") {
  return {
    kind: "schema",
    assert: (value: any) => {
      if (value.value !== "ok") {
        throw new Error(message);
      }
    },
  };
}

function effectLike(message = "Effect-like invalid") {
  return {
    _schema: {},
    validate: (value: any) =>
      value.value === "ok"
        ? { _tag: "Success" }
        : { _tag: "Failure", message },
  };
}

function customFunction(message = "Custom function invalid") {
  return ({ value }: { value: string }) =>
    value === "ok" ? undefined : message;
}

const zodSchema = z.object({
  value: z.string().refine((value) => value === "ok", "Zod invalid"),
});

const defaultValues: AdapterValues = {
  value: "invalid",
};

const adapterBranches: AdapterBranch[] = [
  {
    id: "zod",
    title: "Zod",
    description: "Real zod schema",
    buildOptions: () => ({
      defaultValues,
      validators: { onSubmit: zodSchema },
    }),
  },
  {
    id: "standard-schema-shape",
    title: "Standard Schema",
    description: "Standard Schema adapter shape fixture",
    buildOptions: () => ({
      defaultValues,
      validators: { onSubmit: standardSchema() },
    }),
  },
  {
    id: "custom-function",
    title: "Custom function",
    description: "Custom validator function",
    buildOptions: () => ({
      defaultValues,
      fieldValidators: { value: { onSubmit: customFunction() } },
    }),
  },
  {
    id: "yup-like",
    title: "Yup-like",
    description: "Yup-like adapter shape fixture",
    buildOptions: () => ({
      defaultValues,
      validators: { onSubmit: yupLike() },
    }),
  },
  {
    id: "valibot-like",
    title: "Valibot-like",
    description: "Valibot-like adapter shape fixture",
    buildOptions: () => ({
      defaultValues,
      validators: { onSubmit: valibotLike() },
    }),
  },
  {
    id: "arktype-like",
    title: "ArkType-like",
    description: "ArkType-like adapter shape fixture",
    buildOptions: () => ({
      defaultValues,
      validators: { onSubmit: arkTypeLike() },
    }),
  },
  {
    id: "effect-like",
    title: "Effect-like",
    description: "Effect-like adapter shape fixture",
    buildOptions: () => ({
      defaultValues,
      validators: { onSubmit: effectLike() },
    }),
  },
];

function formatResult(result: AdapterResult) {
  return JSON.stringify(result, null, 2);
}

function AdapterMiniForm({ branch }: { branch: AdapterBranch }) {
  const [result, setResult] = useState<AdapterResult>({
    branch: branch.id,
    success: false,
    outcome: "failure",
    errors: { value: "Submit to validate the invalid default value." },
  });

  const { register, handleSubmit, formState, setValue, clearErrors } =
    useForm<AdapterValues>(branch.buildOptions());

  const errors = formState.errors as Record<string, string>;
  const inputError = errors.value;
  const formError = errors.form;

  const onValid = (data: AdapterValues) => {
    setResult({
      branch: branch.id,
      success: true,
      outcome: "success",
      data,
    });
  };

  const onError = (validationErrors: Record<keyof AdapterValues, string>) => {
    setResult({
      branch: branch.id,
      success: false,
      outcome: "failure",
      errors: validationErrors as Record<string, string>,
    });
  };

  const setOk = () => {
    setValue("value", "ok");
    clearErrors();
  };

  return (
    <Card className="space-y-4" data-testid={`${branch.id}-row`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{branch.title}</h3>
        <p className="text-sm text-gray-600">{branch.description}</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit(onValid, onError)}
        noValidate
      >
        <FormGroup
          label={`${branch.id} value`}
          htmlFor={`${branch.id}-value`}
          error={inputError}
        >
          <input
            id={`${branch.id}-value`}
            type="text"
            aria-label={`${branch.id} value`}
            {...register("value")}
            className={`${inputBaseClasses} ${inputError ? inputErrorClasses : ""}`}
          />
        </FormGroup>

        {formError && (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm">
            Submit {branch.id}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={setOk}>
            Set {branch.id} ok
          </Button>
        </div>
      </form>

      <pre
        className="overflow-auto rounded-md bg-gray-900 p-3 text-xs text-white"
        data-testid={`${branch.id}-result`}
      >
        {formatResult(result)}
      </pre>
    </Card>
  );
}

export function ValidationAdaptersLab() {
  return (
    <div className="space-y-6" data-testid="validation-adapters-lab">
      <h2 className="text-2xl font-bold text-gray-900">Validation Adapters Lab</h2>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {adapterBranches.map((branch) => (
          <AdapterMiniForm key={branch.id} branch={branch} />
        ))}
      </div>
    </div>
  );
}

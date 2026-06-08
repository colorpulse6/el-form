import { useRef, useState } from "react";
import {
  fileValidator,
  fileValidators,
  type ValidatorFunction,
} from "el-form-core";
import { useForm } from "el-form-react-hooks";
import {
  Button,
  Card,
  FormGroup,
  inputBaseClasses,
  inputErrorClasses,
} from "../../components/ui";

type FileValidatorsLabValues = {
  image: File | null;
  avatar: File | null;
  document: File | null;
  gallery: File[] | null;
  video: File | null;
  audio: File | null;
  customExtension: File | null;
  customCount: File[] | null;
};

type FileFieldName = keyof FileValidatorsLabValues;
type FileValue = File | File[] | FileList | null | undefined;

type FileFieldConfig = {
  id: string;
  name: FileFieldName;
  label: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  validatorLabel: string;
};

type FileInfoOutput = ReturnType<
  ReturnType<typeof useForm<FileValidatorsLabValues>>["getFileInfo"]
>;

type FieldSummary = {
  fileNames: string[];
  error: string | null;
  info: FileInfoOutput[];
};

const defaultValues: FileValidatorsLabValues = {
  image: null,
  avatar: null,
  document: null,
  gallery: [],
  video: null,
  audio: null,
  customExtension: null,
  customCount: [],
};

const fieldValidatorMap: Record<FileFieldName, ValidatorFunction> = {
  image: fileValidators.image,
  avatar: fileValidators.avatar,
  document: fileValidators.document,
  gallery: fileValidators.gallery,
  video: fileValidators.video,
  audio: fileValidators.audio,
  customExtension: fileValidator({
    acceptedExtensions: ["txt"],
    minSize: 1,
  }),
  customCount: fileValidator({
    minFiles: 2,
    maxFiles: 3,
    acceptedTypes: ["text/plain"],
  }),
};

const fieldConfigs: FileFieldConfig[] = [
  {
    id: "image",
    name: "image",
    label: "Image preset",
    hint: "fileValidators.image: JPEG, PNG, GIF, or WebP up to 5MB.",
    accept: "image/jpeg,image/png,image/gif,image/webp",
    validatorLabel: "fileValidators.image",
  },
  {
    id: "avatar",
    name: "avatar",
    label: "Avatar preset",
    hint: "fileValidators.avatar: JPEG or PNG up to 2MB.",
    accept: "image/jpeg,image/png",
    validatorLabel: "fileValidators.avatar",
  },
  {
    id: "document",
    name: "document",
    label: "Document preset",
    hint: "fileValidators.document: PDF, Word, or plain text up to 10MB.",
    accept:
      "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,.pdf,.doc,.docx,.txt",
    validatorLabel: "fileValidators.document",
  },
  {
    id: "gallery",
    name: "gallery",
    label: "Gallery preset",
    hint: "fileValidators.gallery: up to 10 JPEG, PNG, or GIF images.",
    accept: "image/jpeg,image/png,image/gif",
    multiple: true,
    validatorLabel: "fileValidators.gallery",
  },
  {
    id: "video",
    name: "video",
    label: "Video preset",
    hint: "fileValidators.video: MP4, WebM, or MOV up to 50MB.",
    accept: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
    validatorLabel: "fileValidators.video",
  },
  {
    id: "audio",
    name: "audio",
    label: "Audio preset",
    hint: "fileValidators.audio: MP3, WAV, or OGG up to 20MB.",
    accept: "audio/mpeg,audio/wav,audio/ogg,.mp3,.wav,.ogg",
    validatorLabel: "fileValidators.audio",
  },
  {
    id: "custom-extension",
    name: "customExtension",
    label: "Custom extension",
    hint: 'fileValidator({ acceptedExtensions: ["txt"], minSize: 1 })',
    accept: ".txt,text/plain",
    validatorLabel: "fileValidator acceptedExtensions",
  },
  {
    id: "custom-count",
    name: "customCount",
    label: "Custom count",
    hint:
      'fileValidator({ minFiles: 2, maxFiles: 3, acceptedTypes: ["text/plain"] })',
    accept: "text/plain,.txt",
    multiple: true,
    validatorLabel: "fileValidator minFiles/maxFiles",
  },
];

function getSelectedFiles(value: FileValue): File[] {
  if (!value) return [];
  if (value instanceof File) return [value];
  return Array.from(value);
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function FileValidatorsLab() {
  const [submitResult, setSubmitResult] = useState<Record<string, unknown>>({
    status: "idle",
  });
  const inputRefs = useRef<Partial<Record<FileFieldName, HTMLInputElement>>>(
    {}
  );

  const {
    register,
    handleSubmit,
    formState,
    getFileInfo,
    removeFile,
    clearFiles,
    clearErrors,
    setError,
  } = useForm<FileValidatorsLabValues>({
    defaultValues,
    mode: "onChange",
    fieldValidators: {
      image: { onChange: fieldValidatorMap.image },
      avatar: { onChange: fieldValidatorMap.avatar },
      document: { onChange: fieldValidatorMap.document },
      gallery: { onChange: fieldValidatorMap.gallery },
      video: { onChange: fieldValidatorMap.video },
      audio: { onChange: fieldValidatorMap.audio },
      customExtension: { onChange: fieldValidatorMap.customExtension },
      customCount: { onChange: fieldValidatorMap.customCount },
    },
  });

  const buildSummary = (
    values: Partial<FileValidatorsLabValues>,
    errors: Partial<Record<FileFieldName, string>>
  ): Record<FileFieldName, FieldSummary> => {
    return fieldConfigs.reduce(
      (summary, field) => {
        const files = getSelectedFiles(values[field.name] as FileValue);
        summary[field.name] = {
          fileNames: files.map((file) => file.name),
          error: errors[field.name] ?? null,
          info: files.map((file) => getFileInfo(file)),
        };
        return summary;
      },
      {} as Record<FileFieldName, FieldSummary>
    );
  };

  const resetInput = (name: FileFieldName) => {
    const input = inputRefs.current[name];
    if (input) input.value = "";
  };

  const validateFieldValue = (name: FileFieldName, value: FileValue) => {
    const nextValues = {
      ...formState.values,
      [name]: value,
    };

    return fieldValidatorMap[name]({
      value,
      fieldName: name,
      values: nextValues,
    });
  };

  const clearField = (name: FileFieldName) => {
    clearFiles(name);
    clearErrors(name);
    resetInput(name);
  };

  const removeIndexedFile = (name: FileFieldName, index: number) => {
    const nextFiles = getSelectedFiles(
      formState.values[name] as FileValue
    ).filter((_, fileIndex) => fileIndex !== index);
    const nextValue = nextFiles;
    const validationError = validateFieldValue(name, nextValue);

    removeFile(name, index);
    resetInput(name);

    if (validationError) {
      setError(name, validationError);
    } else {
      clearErrors(name);
    }
  };

  const onValid = (data: FileValidatorsLabValues) => {
    setSubmitResult({
      status: "valid",
      fields: buildSummary(data, {}),
    });
  };

  const onError = (
    errors: Partial<Record<keyof FileValidatorsLabValues, string>>
  ) => {
    setSubmitResult({
      status: "invalid",
      fields: buildSummary(formState.values, errors),
    });
  };

  const currentSummary = buildSummary(formState.values, formState.errors);

  return (
    <div className="space-y-6" data-testid="file-validators-lab">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          File Validators Lab
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Exercises every core file validator preset plus two custom
          fileValidator configurations.
        </p>
      </div>

      <Card variant="info" className="text-sm">
        <div data-testid="file-validators-status">
          isValid={formState.isValid} | isDirty={formState.isDirty} |
          isSubmitting={formState.isSubmitting}
        </div>
      </Card>

      <form
        className="space-y-4"
        onSubmit={handleSubmit(onValid, onError)}
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {fieldConfigs.map((field) => {
            const error = formState.errors[field.name] as string | undefined;
            const files = getSelectedFiles(
              formState.values[field.name] as FileValue
            );
            const fileInfo = files.map((file) => getFileInfo(file));
            const registration = register(field.name);
            const hasFilesOrError = files.length > 0 || Boolean(error);

            return (
              <Card key={field.name} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {field.label}
                  </h3>
                  <p
                    className="text-xs font-medium text-gray-500"
                    data-testid={`${field.id}-validator`}
                  >
                    {field.validatorLabel}
                  </p>
                </div>

                <FormGroup
                  label={`${field.label} input`}
                  htmlFor={`${field.id}-input`}
                  hint={field.hint}
                >
                  <input
                    id={`${field.id}-input`}
                    type="file"
                    accept={field.accept}
                    multiple={field.multiple}
                    aria-label={field.label}
                    data-testid={`${field.id}-input`}
                    name={registration.name}
                    ref={(element) => {
                      if (element) inputRefs.current[field.name] = element;
                      else delete inputRefs.current[field.name];
                      registration.ref(element);
                    }}
                    onChange={registration.onChange}
                    onBlur={registration.onBlur}
                    className={`${inputBaseClasses} ${error ? inputErrorClasses : ""}`}
                  />
                </FormGroup>

                <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500">
                      Selected file names
                    </h4>
                    <ul
                      className="mt-1 space-y-1 text-gray-800"
                      data-testid={`${field.id}-names`}
                    >
                      {files.length > 0 ? (
                        files.map((file, index) => (
                          <li
                            key={`${file.name}-${index}`}
                            data-testid={`${field.id}-name-${index}`}
                          >
                            {file.name}
                          </li>
                        ))
                      ) : (
                        <li>No files selected</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500">
                      Current error
                    </h4>
                    <p
                      className={error ? "mt-1 text-red-600" : "mt-1 text-gray-700"}
                      data-testid={`${field.id}-error`}
                      role={error ? "alert" : undefined}
                    >
                      {error ?? "No error"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500">
                      getFileInfo output
                    </h4>
                    <pre
                      className="mt-1 max-h-40 overflow-auto rounded bg-white p-2 text-xs text-gray-800"
                      data-testid={`${field.id}-info`}
                    >
                      {formatJson(fileInfo)}
                    </pre>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => clearField(field.name)}
                    disabled={!hasFilesOrError}
                    data-testid={`${field.id}-clear`}
                  >
                    Clear
                  </Button>

                  {field.multiple &&
                    files.map((file, index) => (
                      <Button
                        key={`${file.name}-${index}-remove`}
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeIndexedFile(field.name, index)}
                        data-testid={`${field.id}-remove-${index}`}
                        aria-label={`Remove ${file.name} from ${field.label}`}
                      >
                        Remove {index + 1}
                      </Button>
                    ))}
                </div>
              </Card>
            );
          })}
        </div>

        <Button type="submit" data-testid="file-validators-submit">
          Submit file validators
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Current file state
          </h3>
          <pre
            className="max-h-96 overflow-auto text-xs"
            data-testid="file-validators-summary-json"
          >
            {formatJson(currentSummary)}
          </pre>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Submit result
          </h3>
          <pre
            className="max-h-96 overflow-auto text-xs"
            data-testid="file-validators-submit-result"
          >
            {formatJson(submitResult)}
          </pre>
        </Card>
      </div>
    </div>
  );
}

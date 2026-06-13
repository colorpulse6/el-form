import * as React from "react";
import { useForm } from "el-form-react-hooks";
import type { UseFormReturn, Path } from "el-form-react-hooks";
import type { ValidatorConfig } from "el-form-core";
import {
  AutoFormProps,
  AutoFormFieldConfig,
  AutoFormFieldProps,
  AutoFormErrorProps,
  ComponentMap,
} from "./types";
import { z } from "zod"; // Classic import for parsing conveniences
import {
  getTypeName,
  getDiscriminatedUnionInfo,
  getEnumValues,
  getLiteralValue,
  getArrayElementType,
  getStringChecks,
  getDef,
  getObjectShape,
} from "el-form-core";
import { FormSwitch, FormCase } from "./Form";
import { fieldAriaProps } from "./fieldAria";
import { cx } from "./utils/cx";

// Zod helpers now come from el-form-core (Zod 4 only)

// Default error component
const DefaultErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}: AutoFormErrorProps) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="el-form-error-summary">
      <h3>⚠️ Please fix the following errors:</h3>
      <ul>
        {errorEntries.map(([field, error]) => (
          <li key={field}>
            <span className="el-form-error-summary-bullet">•</span>
            <span className="el-form-error-summary-field">{field}:</span>
            <span className="el-form-error-summary-value">{String(error)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Default field component
const DefaultField: React.FC<AutoFormFieldProps> = ({
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
  options,
  className,
  inputClassName,
  labelClassName,
  errorClassName,
}: AutoFormFieldProps) => {
  const fieldId = `field-${name}`;
  const aria = fieldAriaProps({ fieldId, error, touched, required });

  if (type === "checkbox") {
    return (
      <div className={className || "el-form-checkbox-row"}>
        <input
          id={fieldId}
          name={name}
          type="checkbox"
          checked={!!value}
          onChange={onChange}
          onBlur={onBlur}
          ref={inputRef}
          aria-invalid={aria["aria-invalid"]}
          aria-describedby={aria["aria-describedby"]}
          aria-required={aria["aria-required"]}
          className={inputClassName || "el-form-checkbox"}
        />
        <label
          htmlFor={fieldId}
          className={labelClassName || "el-form-label"}
        >
          {label}
        </label>
      </div>
    );
  }

  const hasError = touched && error;
  const inputClasses = cx(
    inputClassName || "el-form-input",
    hasError && "el-form-input-error"
  );

  return (
    <div className={className || "el-form-field"}>
      {label && (
        <label htmlFor={fieldId} className={labelClassName || "el-form-label"}>
          {label}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          id={fieldId}
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          ref={inputRef}
          aria-invalid={aria["aria-invalid"]}
          aria-describedby={aria["aria-describedby"]}
          aria-required={aria["aria-required"]}
          placeholder={placeholder}
          className={inputClassName || "el-form-textarea"}
          rows={4}
        />
      ) : type === "select" && options ? (
        <select
          id={fieldId}
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          ref={inputRef}
          aria-invalid={aria["aria-invalid"]}
          aria-describedby={aria["aria-describedby"]}
          aria-required={aria["aria-required"]}
          className={inputClassName || "el-form-select"}
        >
          <option value="">{placeholder || "Select an option"}</option>
          {options.map((option: { value: string; label: string }) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          ref={inputRef}
          aria-invalid={aria["aria-invalid"]}
          aria-describedby={aria["aria-describedby"]}
          aria-required={aria["aria-required"]}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}

      {hasError && (
        <div
          id={aria.errorId}
          role="alert"
          className={errorClassName || "el-form-error-message"}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Array Field Component for handling nested arrays
interface ArrayFieldProps {
  fieldConfig: AutoFormFieldConfig;
  value: any[];
  path: string;
  onAddItem: (path: string, item: any) => void;
  onRemoveItem: (path: string, index: number) => void;
  onValueChange: UseFormReturn<any>["setValue"];
  register: any;
  formState: any;
}

const ArrayField: React.FC<ArrayFieldProps> = ({
  fieldConfig,
  value = [],
  path,
  onAddItem,
  onRemoveItem,
  onValueChange,
  register,
  formState,
}: ArrayFieldProps) => {
  const arrayValue = Array.isArray(value) ? value : [];

  const createEmptyItem = () => {
    if (!fieldConfig.fields) return {};

    // Handle primitive arrays (like array of strings)
    if (
      fieldConfig.fields.length === 1 &&
      fieldConfig.fields[0].name === "value"
    ) {
      const fieldType = fieldConfig.fields[0].type;
      if (fieldType === "number") {
        return 0;
      } else if (fieldType === "checkbox") {
        return false;
      } else {
        return "";
      }
    }

    // Handle object arrays
    const emptyItem: any = {};
    fieldConfig.fields.forEach((field) => {
      if (field.type === "array") {
        emptyItem[field.name] = [];
      } else if (field.type === "number") {
        emptyItem[field.name] = 0;
      } else {
        emptyItem[field.name] = "";
      }
    });
    return emptyItem;
  };

  const handleAddItem = () => {
    onAddItem(path, createEmptyItem());
  };

  const handleRemoveItem = (index: number) => {
    onRemoveItem(path, index);
  };

  const renderNestedField = (
    nestedFieldConfig: AutoFormFieldConfig,
    itemIndex: number,
    itemPath: string
  ) => {
    // Handle primitive arrays (like array of strings)
    if (nestedFieldConfig.name === "value") {
      const fieldValue = arrayValue[itemIndex] || "";

      return (
        <div key={itemPath} className="el-form-field">
          <input
            type={nestedFieldConfig.type || "text"}
            value={fieldValue}
            onChange={(e) => {
              const newValue =
                nestedFieldConfig.type === "number"
                  ? e.target.value
                    ? Number(e.target.value)
                    : 0
                  : e.target.value;
              onValueChange(itemPath, newValue);
            }}
            placeholder={nestedFieldConfig.placeholder || "Enter value"}
            className="el-form-input"
          />
        </div>
      );
    }

    // Handle object arrays
    const fieldPath = `${itemPath}.${nestedFieldConfig.name}`;
    const fieldValue = arrayValue[itemIndex]?.[nestedFieldConfig.name] || "";

    if (nestedFieldConfig.type === "array") {
      return (
        <ArrayField
          key={fieldPath}
          fieldConfig={nestedFieldConfig}
          value={fieldValue}
          path={fieldPath}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onValueChange={onValueChange}
          register={register}
          formState={formState}
        />
      );
    }

    return (
      <div key={fieldPath} className="el-form-field">
        {nestedFieldConfig.label && (
          <label className="el-form-label">{nestedFieldConfig.label}</label>
        )}
        <input
          type={nestedFieldConfig.type || "text"}
          value={fieldValue}
          onChange={(e) => {
            const newValue =
              nestedFieldConfig.type === "number"
                ? e.target.value
                  ? Number(e.target.value)
                  : 0
                : e.target.value;
            onValueChange(fieldPath, newValue);
          }}
          placeholder={nestedFieldConfig.placeholder}
          className="el-form-input"
        />
      </div>
    );
  };

  return (
    <div className="el-form-array">
      <div className="el-form-array-header">
        <label className="el-form-label">
          {fieldConfig.label || fieldConfig.name}
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="el-form-array-add-button"
        >
          ✨ Add {fieldConfig.label || fieldConfig.name}
        </button>
      </div>

      <div className="el-form-array">
        {arrayValue.map((_, index) => {
          const itemPath = `${path}[${index}]`;

          return (
            <div key={index} className="el-form-array-item">
              <div className="el-form-array-header">
                <h4 className="el-form-label">
                  {fieldConfig.label || fieldConfig.name} #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="el-form-array-remove-button"
                >
                  🗑️ Remove
                </button>
              </div>

              <div className="el-form-object-grid">
                {fieldConfig.fields?.map((nestedField) =>
                  renderNestedField(nestedField, index, itemPath)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {arrayValue.length === 0 && (
        <div className="el-form-array-empty">
          <div>📝</div>
          No {fieldConfig.label?.toLowerCase() || fieldConfig.name} added yet.
          <br />
          Click "Add" to create your first entry.
        </div>
      )}
    </div>
  );
};

// Helper to unwrap ZodOptional, ZodNullable, and ZodDefault wrapper types
function unwrapZodType(schema: z.ZodTypeAny): z.ZodTypeAny {
  const typeName = getTypeName(schema as any);
  if (
    typeName === "ZodOptional" ||
    typeName === "ZodNullable" ||
    typeName === "ZodDefault"
  ) {
    const def = getDef(schema as any);
    const inner = def?.innerType || def?.type;
    return inner ? unwrapZodType(inner) : schema;
  }
  return schema;
}

function generateFieldsFromSchema<T extends z.ZodTypeAny>(
  schema: T
): AutoFormFieldConfig[] {
  const rootType = getTypeName(schema as any);

  // Handle discriminated union at root
  if (rootType === "ZodDiscriminatedUnion") {
    const du = getDiscriminatedUnionInfo(schema as any);
    if (!du) return [];
    const { discriminator: discriminatorField, options } = du;
    const fieldConfig: AutoFormFieldConfig = {
      name: "__discriminatedUnion__",
      type: "discriminatedUnion",
      discriminatorField,
      unionOptions: {},
    };

    fieldConfig.options = options.map((option: any) => {
      const discriminatorValue = getLiteralValue(
        option.shape[discriminatorField]
      );
      return {
        value: discriminatorValue,
        label:
          String(discriminatorValue).charAt(0).toUpperCase() +
          String(discriminatorValue).slice(1),
      };
    });

    options.forEach((option: any) => {
      const discriminatorValue = getLiteralValue(
        option.shape[discriminatorField]
      );
      fieldConfig.unionOptions![String(discriminatorValue)] =
        generateFieldsFromSchema(option as any);
    });

    return [fieldConfig];
  }

  if (getTypeName(schema as any) !== "ZodObject") return [];

  const shape = getObjectShape(schema as any) as Record<string, z.ZodTypeAny>;
  const fields: AutoFormFieldConfig[] = [];
  for (const key in shape) {
    if (!Object.prototype.hasOwnProperty.call(shape, key)) continue;
    const rawZodType = shape[key] as z.ZodTypeAny;
    // Unwrap optional/nullable/default wrappers to get the inner type
    const zodType = unwrapZodType(rawZodType);
    const typeName = getTypeName(zodType as any);
    // A field is required unless the RAW (pre-unwrap) type is one of the
    // optional/nullable/default wrappers.
    const rawTypeName = getTypeName(rawZodType as any);
    const required = !(
      rawTypeName === "ZodOptional" ||
      rawTypeName === "ZodNullable" ||
      rawTypeName === "ZodDefault"
    );
    const fieldConfig: AutoFormFieldConfig = {
      name: key,
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase()),
      type: "text",
      required,
    };

    if (typeName === "ZodString") {
      const checks = getStringChecks(zodType as any);
      if (checks.some((c: any) => c.kind === "email"))
        fieldConfig.type = "email";
      else if (checks.some((c: any) => c.kind === "url"))
        fieldConfig.type = "url";
    } else if (typeName === "ZodNumber") fieldConfig.type = "number";
    else if (typeName === "ZodBoolean") fieldConfig.type = "checkbox";
    else if (typeName === "ZodEnum") {
      fieldConfig.type = "select";
      fieldConfig.options = getEnumValues(zodType as any).map((v: string) => ({
        value: v,
        label: v,
      }));
    } else if (typeName === "ZodDate") fieldConfig.type = "date";
    else if (typeName === "ZodDiscriminatedUnion") {
      fieldConfig.type = "discriminatedUnion";
      const inner = getDiscriminatedUnionInfo(zodType as any);
      if (!inner) {
        continue;
      }
      const { discriminator: discriminatorField, options } = inner;
      fieldConfig.discriminatorField = discriminatorField;
      fieldConfig.unionOptions = {};
      fieldConfig.options = options.map((option: any) => {
        const discriminatorValue = getLiteralValue(
          option.shape[discriminatorField]
        );
        return {
          value: discriminatorValue,
          label:
            String(discriminatorValue).charAt(0).toUpperCase() +
            String(discriminatorValue).slice(1),
        };
      });
      options.forEach((option: any) => {
        const discriminatorValue = getLiteralValue(
          option.shape[discriminatorField]
        );
        fieldConfig.unionOptions![String(discriminatorValue)] =
          generateFieldsFromSchema(option as any);
      });
    } else if (typeName === "ZodArray") {
      fieldConfig.type = "array";
      const arrayElementType = getArrayElementType(zodType as any);
      if (
        arrayElementType &&
        getTypeName(arrayElementType as any) === "ZodObject"
      ) {
        fieldConfig.fields = generateFieldsFromSchema(arrayElementType as any);
      } else if (arrayElementType) {
        const elementTypeName = getTypeName(arrayElementType as any);
        let elementType: "text" | "number" | "checkbox" = "text";
        if (elementTypeName === "ZodNumber") elementType = "number";
        else if (elementTypeName === "ZodBoolean") elementType = "checkbox";
        fieldConfig.fields = [
          { name: "value", type: elementType, label: "Value" },
        ];
      }
    } else if (typeName === "ZodObject") {
      // Handle nested object fields by flattening with dot notation
      const nestedFields = generateFieldsFromSchema(zodType);
      nestedFields.forEach((nestedField) => {
        fields.push({
          ...nestedField,
          name: `${key}.${nestedField.name}`,
          label: `${fieldConfig.label} ${nestedField.label}`,
        });
      });
      continue; // Skip pushing the parent fieldConfig since we flattened
    }
    fields.push(fieldConfig);
  }
  return fields;
}

// Component for rendering discriminated union fields
interface DiscriminatedUnionFieldProps {
  fieldConfig: AutoFormFieldConfig;
  formApi: any;
  componentMap?: ComponentMap;
}

const DiscriminatedUnionField: React.FC<DiscriminatedUnionFieldProps> = ({
  fieldConfig,
  formApi,
  componentMap,
}) => {
  const { register, watch } = formApi;

  if (!fieldConfig.discriminatorField || !fieldConfig.unionOptions) {
    return null;
  }

  // Register the discriminator field
  const discriminatorProps = register(fieldConfig.discriminatorField);
  const discriminatorValue = watch(fieldConfig.discriminatorField);

  // Render the discriminator selector
  const DiscriminatorComponent =
    (fieldConfig.type && componentMap?.[fieldConfig.type]) || DefaultField;

  return (
    <div className="discriminated-union-field">
      {/* Render the discriminator selector */}
      <div className="el-form-field">
        <DiscriminatorComponent
          name={fieldConfig.discriminatorField}
          label={fieldConfig.label || fieldConfig.name}
          type="select"
          value={discriminatorValue}
          onChange={discriminatorProps.onChange}
          onBlur={discriminatorProps.onBlur}
          options={fieldConfig.options}
        />
      </div>

      {/* Render conditional fields using FormSwitch with union metadata (Phase 1: prepare metadata, Phase 2: update FormSwitch) */}
      <FormSwitch on={discriminatorValue} form={formApi}>
        {fieldConfig.options?.map((option) => (
          <FormCase key={option.value} value={option.value}>
            {(form) => {
              const optionFields =
                fieldConfig.unionOptions![option.value] || [];
              return (
                <div className="el-form-array">
                  {optionFields
                    .filter(
                      (field) => field.name !== fieldConfig.discriminatorField
                    )
                    .map((field) => {
                      const fieldProps = form.register(field.name);
                      const error = form.formState.errors[field.name];
                      const touched = form.formState.touched[field.name];

                      const fieldValue =
                        "checked" in fieldProps
                          ? fieldProps.checked
                          : "value" in fieldProps
                          ? fieldProps.value
                          : undefined;

                      const FieldComponent =
                        field.component ||
                        (field.type && componentMap?.[field.type]) ||
                        DefaultField;

                      return (
                        <FieldComponent
                          key={field.name}
                          name={field.name}
                          label={field.label || field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={fieldValue}
                          onChange={fieldProps.onChange}
                          onBlur={fieldProps.onBlur}
                          inputRef={fieldProps.ref}
                          required={field.required}
                          error={error}
                          touched={touched}
                          options={field.options}
                          className={field.className}
                          inputClassName={field.inputClassName}
                          labelClassName={field.labelClassName}
                          errorClassName={field.errorClassName}
                        />
                      );
                    })}
                </div>
              );
            }}
          </FormCase>
        ))}
      </FormSwitch>
    </div>
  );
};

// Merge auto-generated fields with manual field overrides
function mergeFields(
  autoFields: AutoFormFieldConfig[],
  manualFields: AutoFormFieldConfig[]
): AutoFormFieldConfig[] {
  const manualFieldsMap = new Map(
    manualFields.map((field) => [field.name, field])
  );

  // Start with auto-generated fields and override with manual ones
  const mergedFields = autoFields.map((autoField) => {
    const manualField = manualFieldsMap.get(autoField.name);
    if (manualField) {
      // Merge the manual field with auto-generated field (manual takes priority)
      return { ...autoField, ...manualField };
    }
    return autoField;
  });

  // Add any manual fields that don't exist in auto-generated fields
  manualFields.forEach((manualField) => {
    if (!autoFields.some((autoField) => autoField.name === manualField.name)) {
      mergedFields.push(manualField);
    }
  });

  return mergedFields;
}

export function AutoForm<T extends Record<string, any>>({
  schema,
  fields,
  initialValues = {},
  layout = "flex",
  columns = 12,
  theme,
  onSubmit,
  onError,
  children,
  customErrorComponent,
  componentMap,
  validators,
  fieldValidators,
  validateOn = "onSubmit",
  submitButtonProps,
  resetButtonProps,
}: AutoFormProps<T>) {
  // Special handling for root-level discriminated unions
  const isRootDiscriminatedUnion =
    getTypeName(schema as any) === "ZodDiscriminatedUnion";

  // Create validator config for the form
  // If custom validators are provided, use them; otherwise use the schema
  const formValidators = validators || {
    [validateOn === "manual" ? "onSubmit" : validateOn]: schema,
    // Ensure onSubmit validation is always available for form submission
    ...(validateOn !== "onSubmit" && validateOn !== "manual"
      ? { onSubmit: schema }
      : {}),
  };

  const formApi = useForm<T>({
    validators: formValidators,
    fieldValidators: fieldValidators as
      | Record<keyof T, ValidatorConfig>
      | undefined,
    defaultValues: initialValues,
    validateOn,
  });

  const {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    addArrayItem,
    removeArrayItem,
  } = formApi;

  // Merge auto-generated fields with manual overrides
  const autoGeneratedFields = generateFieldsFromSchema(schema);
  const fieldsToRender = fields
    ? mergeFields(autoGeneratedFields, fields)
    : autoGeneratedFields;

  // Choose which error component to use
  const ErrorComponent = customErrorComponent || DefaultErrorComponent;

  const renderField = (fieldConfig: AutoFormFieldConfig) => {
    const fieldName = fieldConfig.name as keyof T;

    // Map colSpan to an inline layout style: grid → gridColumn span, flex → flexBasis
    const fieldContainerStyle: React.CSSProperties =
      layout === "grid"
        ? { gridColumn: `span ${fieldConfig.colSpan || 1}` }
        : {
            flexBasis: `${((fieldConfig.colSpan || 12) / 12) * 100}%`,
            flexShrink: 0,
          };

    // Handle array fields
    if (fieldConfig.type === "array") {
      const fieldProps = register(fieldName as Path<T>);
      const fieldValue = "value" in fieldProps ? fieldProps.value : [];
      const arrayValue = Array.isArray(fieldValue) ? fieldValue : [];
      return (
        <div key={fieldConfig.name} style={fieldContainerStyle}>
          <ArrayField
            fieldConfig={fieldConfig}
            value={arrayValue}
            path={fieldConfig.name}
            onAddItem={addArrayItem}
            onRemoveItem={removeArrayItem}
            onValueChange={setValue}
            register={register}
            formState={formState}
          />
        </div>
      );
    }

    // Handle discriminated union fields
    if (fieldConfig.type === "discriminatedUnion") {
      return (
        <div key={fieldConfig.name} style={fieldContainerStyle}>
          <DiscriminatedUnionField
            fieldConfig={fieldConfig}
            formApi={formApi}
            componentMap={componentMap}
          />
        </div>
      );
    }

    // Handle regular fields
    const fieldProps = register(fieldName as Path<T>);
    const error = formState.errors[fieldName];
    const touched = formState.touched[fieldName];

    // Get the field value, handling both checkbox (checked) and regular (value) fields
    const fieldValue =
      "checked" in fieldProps
        ? fieldProps.checked
        : "value" in fieldProps
        ? fieldProps.value
        : undefined;

    // Determine which component to use:
    // 1. Field-level component override (existing behavior)
    // 2. ComponentMap override based on field type
    // 3. Default field component
    const FieldComponent =
      fieldConfig.component ||
      (fieldConfig.type && componentMap?.[fieldConfig.type]) ||
      DefaultField;

    return (
      <div key={fieldConfig.name} style={fieldContainerStyle}>
        <FieldComponent
          name={fieldConfig.name}
          label={fieldConfig.label || fieldConfig.name}
          type={fieldConfig.type}
          placeholder={fieldConfig.placeholder}
          value={fieldValue}
          onChange={fieldProps.onChange}
          onBlur={fieldProps.onBlur}
          inputRef={fieldProps.ref}
          required={fieldConfig.required}
          error={error}
          touched={touched}
          options={fieldConfig.options}
          className={fieldConfig.className}
          inputClassName={fieldConfig.inputClassName}
          labelClassName={fieldConfig.labelClassName}
          errorClassName={fieldConfig.errorClassName}
        />
      </div>
    );
  };

  const containerClasses = cx(
    "el-form-layout",
    layout === "flex" ? "el-form-layout--flex" : "el-form-layout--grid"
  );

  const containerStyle: React.CSSProperties | undefined =
    layout === "grid"
      ? ({ ["--el-form-columns"]: String(columns) } as React.CSSProperties)
      : undefined;

  // Default form rendering
  const defaultForm = (
    <div
      className="el-form-container"
      data-el-form-theme={theme && theme !== "default" ? theme : undefined}
    >
      <form
        onSubmit={handleSubmit(
          (data) => onSubmit(data),
          onError ||
            ((errors) => console.error("Form validation errors:", errors))
        )}
      >
        {/* Error Summary Component */}
        <ErrorComponent
          errors={formState.errors as Record<string, string>}
          touched={formState.touched as Record<string, boolean>}
        />

        <div className={containerClasses} style={containerStyle}>
          {isRootDiscriminatedUnion
            ? // Special handling for root-level discriminated unions
              (() => {
                const duRoot = getDiscriminatedUnionInfo(schema as any);
                if (!duRoot) {
                  return null;
                }
                const { discriminator: discriminatorField, options } =
                  duRoot as any;

                const fieldConfig: AutoFormFieldConfig = {
                  name: discriminatorField,
                  type: "discriminatedUnion",
                  discriminatorField: discriminatorField,
                  unionOptions: {},
                  options: (options as any).map((option: any) => {
                    const discriminatorValue = getLiteralValue(
                      option.shape[discriminatorField]
                    );
                    return {
                      value: discriminatorValue,
                      label:
                        discriminatorValue.charAt(0).toUpperCase() +
                        discriminatorValue.slice(1),
                    };
                  }),
                };

                // Generate field configs for each union option
                (options as any).forEach((option: any) => {
                  const discriminatorValue = getLiteralValue(
                    option.shape[discriminatorField]
                  );
                  fieldConfig.unionOptions![discriminatorValue] =
                    generateFieldsFromSchema(option);
                });

                return (
                  <DiscriminatedUnionField
                    fieldConfig={fieldConfig}
                    formApi={formApi}
                    componentMap={componentMap}
                  />
                );
              })()
            : // Normal field rendering
              fieldsToRender.map(renderField)}

          <div
            className="el-form-actions"
            style={
              layout === "grid"
                ? { gridColumn: "1 / -1" }
                : { flexBasis: "100%" }
            }
          >
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="el-form-submit-button"
              {...submitButtonProps}
            >
              {formState.isSubmitting ? (
                <>
                  <span className="el-form-spinner"></span>
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>

            <button
              type="button"
              onClick={() => reset()}
              className="el-form-reset-button"
              {...resetButtonProps}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  // If children render prop is provided, render it along with the form
  if (children) {
    return (
      <div
        className="el-form-container"
        data-el-form-theme={theme && theme !== "default" ? theme : undefined}
      >
        <form
          onSubmit={handleSubmit(
            (data) => onSubmit(data),
            onError ||
              ((errors) => console.error("Form validation errors:", errors))
          )}
        >
          {/* Error Summary Component */}
          <ErrorComponent
            errors={formState.errors as Record<string, string>}
            touched={formState.touched as Record<string, boolean>}
          />

          {children(formApi)}

          <div className={containerClasses} style={containerStyle}>
            {fieldsToRender.map(renderField)}
          </div>
        </form>
      </div>
    );
  }

  // Default rendering without render prop
  return defaultForm;
}

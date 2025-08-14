import * as React from "react";
import { useForm } from "el-form-react-hooks";
import type { UseFormReturn } from "el-form-react-hooks";
import type { ValidatorConfig } from "el-form-core";
import {
  AutoFormProps,
  AutoFormFieldConfig,
  AutoFormFieldProps,
  AutoFormErrorProps,
  GridColumns,
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
} from "el-form-core";
import { FormSwitch, FormCase } from "./Form";

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
            <span style={{ color: "#ef4444", marginRight: "0.5rem" }}>•</span>
            <span style={{ textTransform: "capitalize" }}>{field}:</span>
            <span style={{ marginLeft: "0.25rem" }}>{String(error)}</span>
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
  error,
  touched,
  options,
  className,
  inputClassName,
  labelClassName,
  errorClassName,
}: AutoFormFieldProps) => {
  const fieldId = `field-${name}`;

  if (type === "checkbox") {
    return (
      <div className={className || "flex items-center gap-x-3"}>
        <input
          id={fieldId}
          name={name}
          type="checkbox"
          checked={!!value}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClassName || "el-form-checkbox"}
        />
        <label
          htmlFor={fieldId}
          className={labelClassName || "text-sm font-medium text-gray-800"}
        >
          {label}
        </label>
      </div>
    );
  }

  const hasError = touched && error;
  const baseInputClasses = inputClassName || "el-form-input";
  const errorInputClasses = hasError ? "el-form-input-error" : "";
  const inputClasses = `${baseInputClasses} ${errorInputClasses}`.trim();

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
          placeholder={placeholder}
          className={inputClasses}
        />
      )}

      {hasError && (
        <div className={errorClassName || "el-form-error-message"}>
          <span>⚠️</span>
          <span className="ml-1">{error}</span>
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
        <div key={itemPath} className="space-y-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div key={fieldPath} className="space-y-1">
        {nestedFieldConfig.label && (
          <label className="block text-sm font-medium text-gray-700">
            {nestedFieldConfig.label}
          </label>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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

      <div className="space-y-4">
        {arrayValue.map((_, index) => {
          const itemPath = `${path}[${index}]`;

          return (
            <div key={index} className="el-form-array-item">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-gray-800">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldConfig.fields?.map((nestedField) =>
                  renderNestedField(nestedField, index, itemPath)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {arrayValue.length === 0 && (
        <div className="text-gray-500 text-sm italic text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-2xl mb-2">📝</div>
          No {fieldConfig.label?.toLowerCase() || fieldConfig.name} added yet.
          <br />
          Click "Add" to create your first entry.
        </div>
      )}
    </div>
  );
};

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

  const shape = getDef(schema as any)?.shape as Record<string, z.ZodTypeAny>;
  const fields: AutoFormFieldConfig[] = [];
  for (const key in shape) {
    if (!Object.prototype.hasOwnProperty.call(shape, key)) continue;
    const zodType = shape[key] as z.ZodTypeAny;
    const typeName = getTypeName(zodType as any);
    const fieldConfig: AutoFormFieldConfig = {
      name: key,
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase()),
      type: "text",
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

  // Render the discriminator select field
  const DiscriminatorComponent =
    (fieldConfig.type && componentMap?.[fieldConfig.type]) || DefaultField;

  return (
    <div className="discriminated-union-field">
      {/* Render the discriminator selector */}
      <div className="mb-4">
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

      {/* Render conditional fields using FormSwitch */}
      <FormSwitch on={discriminatorValue} form={formApi}>
        {fieldConfig.options?.map((option) => (
          <FormCase key={option.value} value={option.value}>
            {(form) => {
              const optionFields =
                fieldConfig.unionOptions![option.value] || [];
              return (
                <div className="space-y-4">
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

    // Map colSpan to Tailwind classes
    const getColSpanClass = (colSpan?: GridColumns) => {
      const spanMap: Record<GridColumns, string> = {
        1: "col-span-1",
        2: "col-span-2",
        3: "col-span-3",
        4: "col-span-4",
        5: "col-span-5",
        6: "col-span-6",
        7: "col-span-7",
        8: "col-span-8",
        9: "col-span-9",
        10: "col-span-10",
        11: "col-span-11",
        12: "col-span-12",
      };
      return spanMap[colSpan || 1];
    };

    const getFlexClass = (colSpan?: GridColumns) => {
      const flexMap: Record<GridColumns, string> = {
        1: "w-1/12",
        2: "w-2/12",
        3: "w-3/12",
        4: "w-4/12",
        5: "w-5/12",
        6: "w-6/12",
        7: "w-7/12",
        8: "w-8/12",
        9: "w-9/12",
        10: "w-10/12",
        11: "w-11/12",
        12: "w-full",
      };
      return flexMap[colSpan || 12];
    };

    const fieldContainerClasses =
      layout === "grid"
        ? getColSpanClass(fieldConfig.colSpan)
        : `flex-none ${getFlexClass(fieldConfig.colSpan)}`;

    // Handle array fields
    if (fieldConfig.type === "array") {
      const fieldProps = register(String(fieldName));
      const fieldValue = "value" in fieldProps ? fieldProps.value : [];
      const arrayValue = Array.isArray(fieldValue) ? fieldValue : [];
      return (
        <div key={fieldConfig.name} className={fieldContainerClasses}>
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
        <div key={fieldConfig.name} className={fieldContainerClasses}>
          <DiscriminatedUnionField
            fieldConfig={fieldConfig}
            formApi={formApi}
            componentMap={componentMap}
          />
        </div>
      );
    }

    // Handle regular fields
    const fieldProps = register(String(fieldName));
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
      <div key={fieldConfig.name} className={fieldContainerClasses}>
        <FieldComponent
          name={fieldConfig.name}
          label={fieldConfig.label || fieldConfig.name}
          type={fieldConfig.type}
          placeholder={fieldConfig.placeholder}
          value={fieldValue}
          onChange={fieldProps.onChange}
          onBlur={fieldProps.onBlur}
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

  // Map columns to Tailwind grid classes
  const getGridClass = (cols: GridColumns) => {
    const gridMap: Record<GridColumns, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
      10: "grid-cols-10",
      11: "grid-cols-11",
      12: "grid-cols-12",
    };
    return gridMap[cols];
  };

  const containerClasses =
    layout === "grid"
      ? `grid ${getGridClass(columns)} gap-4`
      : `flex flex-wrap gap-4`;

  // Default form rendering
  const defaultForm = (
    <div className="el-form-container">
      <form
        onSubmit={handleSubmit(
          (data) => onSubmit(data),
          onError ||
            ((errors) => console.error("Form validation errors:", errors))
        )}
        className="w-full"
      >
        {/* Error Summary Component */}
        <ErrorComponent
          errors={formState.errors as Record<string, string>}
          touched={formState.touched as Record<string, boolean>}
        />

        <div className={containerClasses}>
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
            className={`
            flex gap-4 mt-8
            ${layout === "grid" ? "col-span-full" : "w-full"}
          `
              .trim()
              .replace(/\s+/g, " ")}
          >
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="el-form-submit-button"
              {...submitButtonProps}
            >
              {formState.isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
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
      <div className="el-form-container">
        <form
          onSubmit={handleSubmit(
            (data) => onSubmit(data),
            onError ||
              ((errors) => console.error("Form validation errors:", errors))
          )}
          className="w-full"
        >
          {/* Error Summary Component */}
          <ErrorComponent
            errors={formState.errors as Record<string, string>}
            touched={formState.touched as Record<string, boolean>}
          />

          {children(formApi)}

          <div className={containerClasses}>
            {fieldsToRender.map(renderField)}
          </div>
        </form>
      </div>
    );
  }

  // Default rendering without render prop
  return defaultForm;
}

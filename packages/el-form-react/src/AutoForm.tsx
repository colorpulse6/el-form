import * as React from "react";
import { useForm } from "./useForm";
import {
  AutoFormProps,
  AutoFormFieldConfig,
  AutoFormFieldProps,
  AutoFormErrorProps,
  GridColumns,
} from "./types";
import { z } from "zod";
import "./styles.css";

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
}: AutoFormFieldProps) => {
  const fieldId = `field-${name}`;

  if (type === "checkbox") {
    return (
      <div className="flex items-center gap-x-2">
        <input
          id={fieldId}
          name={name}
          type="checkbox"
          checked={!!value}
          onChange={onChange}
          onBlur={onBlur}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
          {label}
        </label>
      </div>
    );
  }

  const inputClasses = `
    w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      touched && error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300"
    }
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700"
        >
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
          className={`${inputClasses} resize-none`}
          rows={4}
        />
      ) : type === "select" && options ? (
        <select
          id={fieldId}
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClasses}
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

      {touched && error && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
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
  onValueChange: (path: string, value: any) => void;
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {fieldConfig.label || fieldConfig.name}
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          + Add {fieldConfig.label || fieldConfig.name}
        </button>
      </div>

      <div className="space-y-4">
        {arrayValue.map((_, index) => {
          const itemPath = `${path}[${index}]`;

          return (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {fieldConfig.label || fieldConfig.name} #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fieldConfig.fields?.map((nestedField) =>
                  renderNestedField(nestedField, index, itemPath)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {arrayValue.length === 0 && (
        <div className="text-gray-500 text-sm italic text-center py-4">
          No {fieldConfig.label?.toLowerCase() || fieldConfig.name} added yet.
          Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

function generateFieldsFromSchema<T extends z.ZodType<any, any>>(
  schema: T
): AutoFormFieldConfig[] {
  if (!(schema instanceof z.ZodObject)) {
    return [];
  }

  const shape = (schema as z.ZodObject<any, any>).shape;
  const fields: AutoFormFieldConfig[] = [];

  for (const key in shape) {
    if (Object.prototype.hasOwnProperty.call(shape, key)) {
      const zodType = shape[key] as z.ZodTypeAny;
      const typeName = zodType._def.typeName;

      const fieldConfig: AutoFormFieldConfig = {
        name: key,
        label: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        type: "text", // Default to text
      };

      if (typeName === "ZodString") {
        const checks = (zodType._def as any).checks || [];
        if (checks.some((c: { kind: string }) => c.kind === "email")) {
          fieldConfig.type = "email";
        } else if (checks.some((c: { kind: string }) => c.kind === "url")) {
          fieldConfig.type = "url";
        }
      } else if (typeName === "ZodNumber") {
        fieldConfig.type = "number";
      } else if (typeName === "ZodBoolean") {
        fieldConfig.type = "checkbox";
      } else if (typeName === "ZodEnum") {
        fieldConfig.type = "select";
        fieldConfig.options = (zodType._def as any).values.map((v: string) => ({
          value: v,
          label: v,
        }));
      } else if (typeName === "ZodDate") {
        fieldConfig.type = "date";
      } else if (typeName === "ZodArray") {
        fieldConfig.type = "array";
        const arrayElementType = (zodType._def as any).type;
        if (arrayElementType instanceof z.ZodObject) {
          fieldConfig.fields = generateFieldsFromSchema(arrayElementType);
        } else {
          // For primitive arrays (string, number, etc.), create a simple field config
          const elementTypeName = arrayElementType._def.typeName;
          let elementType: "text" | "number" | "checkbox" = "text";

          if (elementTypeName === "ZodString") {
            elementType = "text";
          } else if (elementTypeName === "ZodNumber") {
            elementType = "number";
          } else if (elementTypeName === "ZodBoolean") {
            elementType = "checkbox";
          }

          fieldConfig.fields = [
            {
              name: "value",
              type: elementType,
              label: "Value",
            },
          ];
        }
      }

      fields.push(fieldConfig);
    }
  }

  return fields;
}

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
}: AutoFormProps<T>) {
  const formApi = useForm<T>({
    schema,
    initialValues,
    validateOnChange: true,
    validateOnBlur: true,
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
        {fieldsToRender.map(renderField)}

        <div
          className={`
          flex gap-3 mt-6
          ${layout === "grid" ? "col-span-full" : "w-full"}
        `
            .trim()
            .replace(/\s+/g, " ")}
        >
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="p-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {formState.isSubmitting ? "Submitting..." : "Submit"}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="p-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );

  // If children render prop is provided, render it along with the form
  if (children) {
    return (
      <div className="w-full">
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

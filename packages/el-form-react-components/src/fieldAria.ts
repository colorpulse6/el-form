export interface FieldAriaInput {
  fieldId: string;
  error?: unknown;
  touched?: unknown;
  required?: boolean;
}
export interface FieldAriaResult {
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-required"?: true;
  errorId: string;
}
/** ARIA props for an input + the id its error element should carry. */
export function fieldAriaProps({
  fieldId,
  error,
  touched,
  required,
}: FieldAriaInput): FieldAriaResult {
  const showError = Boolean(touched && error);
  const errorId = `${fieldId}-error`;
  return {
    ...(showError
      ? { "aria-invalid": true as const, "aria-describedby": errorId }
      : {}),
    ...(required ? { "aria-required": true as const } : {}),
    errorId,
  };
}

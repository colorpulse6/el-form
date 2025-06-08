import { z } from "zod";

export interface FormState<T extends Record<string, any>> {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface UseFormOptions<T extends Record<string, any>> {
  schema: z.ZodSchema<T>;
  initialValues?: Partial<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T extends Record<string, any>> {
  register: <Name extends keyof T>(
    name: Name
  ) => {
    name: Name;
    value: T[Name];
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: (e: React.FocusEvent<any>) => void;
  };
  handleSubmit: (
    onValid: (data: T) => void,
    onError?: (errors: Record<keyof T, string>) => void
  ) => (e: React.FormEvent) => void;
  formState: FormState<T>;
  reset: () => void;
  // Enhanced for nested arrays
  setValue: (path: string, value: any) => void;
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}



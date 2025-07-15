import { useCallback } from "react";
import { useForm } from "./useForm";
import { UseFormOptions, UseFormReturn } from "./types";

// React Query types - these will be available when @tanstack/react-query is installed
export interface UseMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> {
  mutationFn?: (variables: TVariables) => Promise<TData>;
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: TError) => number);
  [key: string]: any;
}

export interface UseMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: TData;
  error: TError | null;
  context?: TContext; // Added to use TContext
  [key: string]: any;
}

// Mock useMutation hook - will be replaced when React Query is properly installed
function useMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  _options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  // This is a placeholder implementation
  // In real usage, this would import from @tanstack/react-query
  console.warn(
    "useMutation placeholder - please install @tanstack/react-query"
  );

  return {
    mutate: (variables: TVariables) => {
      console.log("Mock mutation called with:", variables);
    },
    mutateAsync: async (variables: TVariables) => {
      console.log("Mock mutateAsync called with:", variables);
      throw new Error("Mock mutation - install @tanstack/react-query");
    },
    reset: () => {},
    isPending: false,
    isError: false,
    isSuccess: false,
    data: undefined,
    error: null,
  };
}

// Types for React Query integration
export interface MutationFormOptions<TData, TError, TVariables, TContext> {
  mutation: UseMutationOptions<TData, TError, TVariables, TContext>;
  onMutationSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
  onMutationError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
  // Function to extract field errors from mutation error
  extractFieldErrors?: (error: TError) => Record<string, string> | undefined;
  // Function to extract general error message
  extractErrorMessage?: (error: TError) => string | undefined;
}

export interface UseFormWithMutationOptions<
  T extends Record<string, any>,
  TData,
  TError,
  TVariables,
  TContext
> extends UseFormOptions<T> {
  mutation: MutationFormOptions<TData, TError, TVariables, TContext>;
}

export interface UseFormWithMutationReturn<
  T extends Record<string, any>,
  TData,
  TError,
  TVariables,
  TContext
> extends UseFormReturn<T> {
  mutation: UseMutationResult<TData, TError, TVariables, TContext>;
  submitWithMutation: (variables?: Omit<TVariables, keyof T>) => void;
  isSubmittingMutation: boolean;
}

/**
 * Enhanced useForm hook that integrates with React Query mutations
 * Automatically handles mutation errors and maps them to form field errors
 */
export function useFormWithMutation<
  T extends Record<string, any>,
  TData = unknown,
  TError = Error,
  TVariables = T,
  TContext = unknown
>(
  options: UseFormWithMutationOptions<T, TData, TError, TVariables, TContext>
): UseFormWithMutationReturn<T, TData, TError, TVariables, TContext> {
  const { mutation: mutationOptions, ...formOptions } = options;

  // Initialize the form
  const form = useForm<T>(formOptions);

  // Create the mutation with enhanced error handling
  const mutation = useMutation({
    ...mutationOptions.mutation,
    onSuccess: (data, variables, context) => {
      // Call original onSuccess if provided
      mutationOptions.mutation.onSuccess?.(data, variables, context);

      // Call form-specific success handler
      mutationOptions.onMutationSuccess?.(data, variables, context);

      // Clear any previous errors on successful submission
      form.clearErrors();
    },
    onError: (error, variables, context) => {
      // Extract field errors from mutation error
      if (mutationOptions.extractFieldErrors) {
        const fieldErrors = mutationOptions.extractFieldErrors(error);
        if (fieldErrors) {
          // Set field errors in the form
          Object.entries(fieldErrors).forEach(([field, message]) => {
            form.setError(field as keyof T, message);
          });
        }
      }

      // Extract general error message
      if (mutationOptions.extractErrorMessage) {
        const errorMessage = mutationOptions.extractErrorMessage(error);
        if (errorMessage) {
          form.setError("root" as keyof T, errorMessage);
        }
      }

      // Call original onError if provided
      mutationOptions.mutation.onError?.(error, variables, context);

      // Call form-specific error handler
      mutationOptions.onMutationError?.(error, variables, context);
    },
  });

  // Enhanced submit function that integrates with mutation
  const submitWithMutation = useCallback(
    (additionalVariables?: Omit<TVariables, keyof T>) => {
      // Create the submission handler
      const submissionHandler = form.handleSubmit(
        (formData) => {
          // Combine form data with any additional variables
          const variables = {
            ...formData,
            ...additionalVariables,
          } as TVariables;

          // Trigger the mutation
          mutation.mutate(variables);
        },
        (errors) => {
          // Handle form validation errors
          console.warn("Form validation failed:", errors);
        }
      );

      // Call the submission handler (simulating form submit event)
      submissionHandler({ preventDefault: () => {} } as React.FormEvent);
    },
    [form, mutation]
  );

  return {
    ...form,
    mutation,
    submitWithMutation,
    isSubmittingMutation: mutation.isPending,
  };
}

/**
 * Common error extractors for typical API responses
 */
export const errorExtractors = {
  // For APIs that return { fieldErrors: { field: "message" }, message: "general error" }
  standard: {
    extractFieldErrors: (error: any): Record<string, string> | undefined => {
      return error?.response?.data?.fieldErrors || error?.fieldErrors;
    },
    extractErrorMessage: (error: any): string | undefined => {
      return (
        error?.response?.data?.message || error?.message || "An error occurred"
      );
    },
  },

  // For APIs that return { errors: { field: ["message1", "message2"] } }
  arrayErrors: {
    extractFieldErrors: (error: any): Record<string, string> | undefined => {
      const errors = error?.response?.data?.errors || error?.errors;
      if (!errors) return undefined;

      const fieldErrors: Record<string, string> = {};
      Object.entries(errors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[field] = messages[0]; // Take first error message
        }
      });

      return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
    },
    extractErrorMessage: (error: any): string | undefined => {
      return (
        error?.response?.data?.message || error?.message || "Validation failed"
      );
    },
  },

  // For GraphQL errors
  graphql: {
    extractFieldErrors: (error: any): Record<string, string> | undefined => {
      const extensions = error?.graphQLErrors?.[0]?.extensions;
      return extensions?.fieldErrors || extensions?.fields;
    },
    extractErrorMessage: (error: any): string | undefined => {
      return (
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "GraphQL error occurred"
      );
    },
  },

  // For Zod validation errors from server
  zod: {
    extractFieldErrors: (error: any): Record<string, string> | undefined => {
      const zodErrors = error?.response?.data?.issues || error?.issues;
      if (!Array.isArray(zodErrors)) return undefined;

      const fieldErrors: Record<string, string> = {};
      zodErrors.forEach((issue: any) => {
        if (issue.path && issue.path.length > 0) {
          const fieldPath = issue.path.join(".");
          fieldErrors[fieldPath] = issue.message;
        }
      });

      return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
    },
    extractErrorMessage: (error: any): string | undefined => {
      return error?.response?.data?.message || "Validation failed";
    },
  },
};

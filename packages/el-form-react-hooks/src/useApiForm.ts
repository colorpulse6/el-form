import { useCallback } from "react";
import { useFormWithMutation, errorExtractors } from "./useFormWithMutation";
import { UseFormOptions } from "./types";

/**
 * Hook for creating forms with common API submission patterns
 * Provides pre-configured error handling for typical REST API responses
 */
export function useApiForm<T extends Record<string, any>>(
  formOptions: UseFormOptions<T> & {
    submitUrl?: string;
    submitMethod?: "POST" | "PUT" | "PATCH";
    headers?: Record<string, string>;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    errorExtractor?:
      | "standard"
      | "arrayErrors"
      | "graphql"
      | "zod"
      | {
          extractFieldErrors: (
            error: any
          ) => Record<string, string> | undefined;
          extractErrorMessage: (error: any) => string | undefined;
        };
  }
) {
  const {
    submitUrl,
    submitMethod = "POST",
    headers = { "Content-Type": "application/json" },
    onSuccess,
    onError,
    errorExtractor = "standard",
    ...restFormOptions
  } = formOptions;

  // Get error extraction functions
  const extractors =
    typeof errorExtractor === "string"
      ? errorExtractors[errorExtractor]
      : errorExtractor;

  // Default API submission function
  const defaultSubmitFn = useCallback(
    async (formData: T) => {
      if (!submitUrl) {
        throw new Error("submitUrl is required for API submission");
      }

      const response = await fetch(submitUrl, {
        method: submitMethod,
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw { response: { data: errorData }, ...errorData };
      }

      return response.json();
    },
    [submitUrl, submitMethod, headers]
  );

  return useFormWithMutation({
    ...restFormOptions,
    mutation: {
      mutation: {
        mutationFn: defaultSubmitFn,
      },
      onMutationSuccess: onSuccess,
      onMutationError: onError,
      ...extractors,
    },
  });
}

/**
 * Hook for forms that submit via React Query mutations
 * Allows complete customization of the mutation while providing form integration
 */
export function useMutationForm<
  T extends Record<string, any>,
  TData = unknown,
  TError = Error,
  TVariables = T
>(
  formOptions: UseFormOptions<T>,
  mutationOptions: {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    extractFieldErrors?: (error: TError) => Record<string, string> | undefined;
    extractErrorMessage?: (error: TError) => string | undefined;
    retry?: boolean | number;
    retryDelay?: number;
  }
) {
  return useFormWithMutation({
    ...formOptions,
    mutation: {
      mutation: {
        mutationFn: mutationOptions.mutationFn,
        retry: mutationOptions.retry,
        retryDelay: mutationOptions.retryDelay,
      },
      onMutationSuccess: mutationOptions.onSuccess,
      onMutationError: mutationOptions.onError,
      extractFieldErrors: mutationOptions.extractFieldErrors,
      extractErrorMessage: mutationOptions.extractErrorMessage,
    },
  });
}

/**
 * Hook specifically for server-side validation
 * Runs mutations that are expected to return validation errors
 */
export function useValidationForm<T extends Record<string, any>>(
  formOptions: UseFormOptions<T> & {
    validateUrl: string;
    validateMethod?: "POST" | "PUT" | "PATCH";
    validateHeaders?: Record<string, string>;
    onValidationSuccess?: (data: any) => void;
    onValidationError?: (error: any) => void;
    errorExtractor?: "standard" | "arrayErrors" | "graphql" | "zod";
  }
) {
  const {
    validateUrl,
    validateMethod = "POST",
    validateHeaders = { "Content-Type": "application/json" },
    onValidationSuccess,
    onValidationError,
    errorExtractor = "standard",
    ...restFormOptions
  } = formOptions;

  const form = useApiForm({
    ...restFormOptions,
    submitUrl: validateUrl,
    submitMethod: validateMethod,
    headers: validateHeaders,
    onSuccess: onValidationSuccess,
    onError: onValidationError,
    errorExtractor,
  });

  // Additional method for just validation (without form submission)
  const validateOnly = useCallback(async () => {
    try {
      const result = await form.mutation.mutateAsync(
        form.formState.values as T
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }, [form]);

  return {
    ...form,
    validateOnly,
  };
}

/**
 * Hook for optimistic updates with forms
 * Automatically handles optimistic updates and rollbacks on error
 */
export function useOptimisticForm<
  T extends Record<string, any>,
  TData = unknown
>(
  formOptions: UseFormOptions<T>,
  mutationOptions: {
    mutationFn: (variables: T) => Promise<TData>;
    optimisticUpdate?: (variables: T) => void;
    onSuccess?: (data: TData, variables: T) => void;
    onError?: (error: any, variables: T) => void;
    onRollback?: (variables: T) => void;
    extractFieldErrors?: (error: any) => Record<string, string> | undefined;
    extractErrorMessage?: (error: any) => string | undefined;
  }
) {
  return useMutationForm(formOptions, {
    mutationFn: mutationOptions.mutationFn,
    onSuccess: (data, variables) => {
      mutationOptions.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Rollback optimistic update
      mutationOptions.onRollback?.(variables);
      mutationOptions.onError?.(error, variables);
    },
    extractFieldErrors: mutationOptions.extractFieldErrors,
    extractErrorMessage: mutationOptions.extractErrorMessage,
  });
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "../utils";

// React Query types - these will be available when @tanstack/react-query is installed
// Fallback types for when React Query is not available
interface QueryResult<TData = unknown, TError = Error> {
  data: TData | undefined;
  error: TError | null;
  isError: boolean;
  isPending: boolean;
  isSuccess: boolean;
  refetch: () => void;
}

interface UseQueryOptions<TData = unknown> {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<TData>;
  enabled?: boolean;
  retry?: boolean | number;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  // Allow for additional options that React Query may use
  [key: string]: any;
}

// Try to import React Query, fallback to our own implementation
let useQuery: <TData = unknown, TError = Error>(
  options: UseQueryOptions<TData> & {
    queryKey: readonly unknown[];
    queryFn: () => Promise<TData>;
  }
) => QueryResult<TData, TError>;

try {
  // Try to import from React Query
  const reactQuery = require("@tanstack/react-query");
  useQuery = reactQuery.useQuery;
} catch {
  // Fallback implementation when React Query is not available
  useQuery = function <TData = unknown, TError = Error>({
    queryKey,
    queryFn,
    enabled = true,
  }: UseQueryOptions<TData> & {
    queryKey: readonly unknown[];
    queryFn: () => Promise<TData>;
  }): QueryResult<TData, TError> {
    const [state, setState] = useState<{
      data: TData | undefined;
      error: TError | null;
      isPending: boolean;
      isError: boolean;
      isSuccess: boolean;
    }>({
      data: undefined,
      error: null,
      isPending: false,
      isError: false,
      isSuccess: false,
    });

    const keyRef = useRef<string>();
    const currentKey = JSON.stringify(queryKey);

    useEffect(() => {
      if (!enabled || currentKey === keyRef.current) return;

      keyRef.current = currentKey;
      setState((prev) => ({ ...prev, isPending: true, isError: false }));

      queryFn()
        .then((data: TData) => {
          setState({
            data,
            error: null,
            isPending: false,
            isError: false,
            isSuccess: true,
          });
        })
        .catch((error: TError) => {
          setState({
            data: undefined,
            error,
            isPending: false,
            isError: true,
            isSuccess: false,
          });
        });
    }, [currentKey, enabled]);

    return {
      ...state,
      refetch: () => {
        keyRef.current = undefined; // Force refetch
      },
    };
  };
}

export interface FieldQueryValidationResult {
  isValid: boolean;
  error?: string;
  data?: any;
}

export interface UseFieldQueryOptions<
  TData = FieldQueryValidationResult,
  TError = Error
> {
  queryKey: (value: any, formValues?: any) => readonly unknown[];
  queryFn: (value: any, formValues?: any) => Promise<TData>;
  value: any;
  formValues?: any;
  enabled?: boolean | ((value: any, formValues?: any) => boolean);
  debounceMs?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  // Smart validation timing options
  validateOn?: ("onChange" | "onBlur" | "background")[];
  // React Query options
  queryOptions?: Omit<
    UseQueryOptions<TData>,
    "queryKey" | "queryFn" | "enabled"
  >;
}

export interface UseFieldQueryReturn<
  TData = FieldQueryValidationResult,
  TError = Error
> {
  isValidating: boolean;
  isValid: boolean;
  error: string | null;
  data: TData | undefined;
  revalidate: () => void;
  // React Query state
  queryState: {
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: TError | null;
    data: TData | undefined;
  };
}

/**
 * Hook for React Query-powered field validation with smart debouncing and caching
 */
export function useFieldQuery<
  TData = FieldQueryValidationResult,
  TError = Error
>({
  queryKey,
  queryFn,
  value,
  formValues = {},
  enabled = true,
  debounceMs = 300,
  onSuccess,
  onError,
  validateOn = ["onChange"],
  queryOptions = {},
}: UseFieldQueryOptions<TData, TError>): UseFieldQueryReturn<TData, TError> {
  // Debounce the value for API calls
  const debouncedValue = useDebounce(value, debounceMs);

  // Track if field has been touched/focused for smart validation timing
  const hasBeenTouched = useRef(false);
  const isBackgroundMode = useRef(false);

  // Determine if validation should be enabled
  const isEnabled = useMemo(() => {
    const baseEnabled =
      typeof enabled === "function"
        ? enabled(debouncedValue, formValues)
        : enabled;

    if (!baseEnabled) return false;

    // Smart validation timing logic
    if (validateOn.includes("onChange")) {
      return true; // Always validate on change
    }

    if (validateOn.includes("onBlur") && hasBeenTouched.current) {
      return true; // Only validate after field has been touched
    }

    if (validateOn.includes("background") && isBackgroundMode.current) {
      return true; // Background validation
    }

    return false;
  }, [debouncedValue, formValues, enabled, validateOn]);

  // Generate stable query key
  const stableQueryKey = useMemo(() => {
    return queryKey(debouncedValue, formValues);
  }, [queryKey, debouncedValue, formValues]);

  // React Query for validation
  const query = useQuery({
    queryKey: stableQueryKey,
    queryFn: () => queryFn(debouncedValue, formValues),
    enabled: isEnabled && !!debouncedValue, // Don't validate empty values
    retry: false, // Don't retry validation failures
    refetchOnWindowFocus: false, // Don't revalidate on window focus
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    ...queryOptions,
  });

  // Handle success/error callbacks
  useEffect(() => {
    if (query.isSuccess && query.data && onSuccess) {
      onSuccess(query.data as TData);
    }
  }, [query.isSuccess, query.data, onSuccess]);

  useEffect(() => {
    if (query.isError && query.error && onError) {
      onError(query.error as TError);
    }
  }, [query.isError, query.error, onError]);

  // Extract validation result
  const validationResult = useMemo(() => {
    if (query.isPending) {
      return {
        isValidating: true,
        isValid: false,
        error: null,
        data: undefined,
      };
    }

    if (query.isError) {
      return {
        isValidating: false,
        isValid: false,
        error: query.error?.message || "Validation failed",
        data: undefined,
      };
    }

    if (query.isSuccess && query.data) {
      // Handle different response formats
      const data = query.data as any;

      // Standard format: { isValid: boolean, error?: string }
      if (typeof data.isValid === "boolean") {
        return {
          isValidating: false,
          isValid: data.isValid,
          error: data.error || null,
          data: query.data,
        };
      }

      // Simple boolean response
      if (typeof data === "boolean") {
        return {
          isValidating: false,
          isValid: data,
          error: null,
          data: query.data,
        };
      }

      // Assume success if we get any data
      return {
        isValidating: false,
        isValid: true,
        error: null,
        data: query.data,
      };
    }

    // Default state
    return {
      isValidating: false,
      isValid: true, // Assume valid if no validation has run
      error: null,
      data: undefined,
    };
  }, [
    query.isPending,
    query.isError,
    query.isSuccess,
    query.data,
    query.error,
  ]);

  return {
    ...validationResult,
    revalidate: () => query.refetch(),
    queryState: {
      isPending: query.isPending,
      isError: query.isError,
      isSuccess: query.isSuccess,
      error: query.error as TError | null,
      data: query.data as TData | undefined,
    },
  };
}

// Helper hook for marking field as touched (to be integrated with useForm)
export function useFieldTouched() {
  const touchedRef = useRef(false);

  const markTouched = () => {
    touchedRef.current = true;
  };

  return { isTouched: touchedRef.current, markTouched };
}

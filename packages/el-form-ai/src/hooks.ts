import { useState, useCallback, useRef } from "react";
import { MCPClient } from "./mcp-client";
import {
  MCPConfig,
  AIFormGenerationRequest,
  AIFormGenerationResponse,
  AIFieldEnhancementRequest,
  AIFieldEnhancementResponse,
  AIValidationRequest,
  AIValidationResponse,
  AIErrorEnhancementRequest,
  AIErrorEnhancementResponse,
  UseAIFormBuilderReturn,
  UseAIValidationReturn,
} from "./types";

/**
 * Hook for AI-powered form building and enhancement
 */
export function useAIFormBuilder(config?: MCPConfig): UseAIFormBuilderReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<MCPClient | null>(null);

  // Initialize client lazily
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new MCPClient(config);
    }
    return clientRef.current;
  }, [config]);

  const generateForm = useCallback(
    async (
      request: AIFormGenerationRequest
    ): Promise<AIFormGenerationResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const client = getClient();
        const response = await client.generateForm(request);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getClient]
  );

  const enhanceField = useCallback(
    async (
      request: AIFieldEnhancementRequest
    ): Promise<AIFieldEnhancementResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const client = getClient();
        const response = await client.enhanceField(request);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getClient]
  );

  return {
    generateForm,
    enhanceField,
    isLoading,
    error,
  };
}

/**
 * Hook for AI-powered validation and error enhancement
 */
export function useAIValidation(config?: MCPConfig): UseAIValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<MCPClient | null>(null);

  // Initialize client lazily
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new MCPClient(config);
    }
    return clientRef.current;
  }, [config]);

  const validateWithAI = useCallback(
    async (request: AIValidationRequest): Promise<AIValidationResponse> => {
      setIsValidating(true);
      setError(null);

      try {
        const client = getClient();
        const response = await client.validateWithAI(request);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsValidating(false);
      }
    },
    [getClient]
  );

  const enhanceError = useCallback(
    async (
      request: AIErrorEnhancementRequest
    ): Promise<AIErrorEnhancementResponse> => {
      setIsValidating(true);
      setError(null);

      try {
        const client = getClient();
        const response = await client.enhanceError(request);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsValidating(false);
      }
    },
    [getClient]
  );

  return {
    validateWithAI,
    enhanceError,
    isValidating,
    error,
  };
}

/**
 * Debounce utility for AI validation
 */
export function useAIValidationDebounced(
  config?: MCPConfig,
  delay: number = 500
): UseAIValidationReturn & {
  validateWithAIDebounced: (request: AIValidationRequest) => void;
} {
  const { validateWithAI, enhanceError, isValidating, error } =
    useAIValidation(config);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const validateWithAIDebounced = useCallback(
    (request: AIValidationRequest) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        validateWithAI(request).catch((err) => {
          console.warn("Debounced AI validation failed:", err);
        });
      }, delay);
    },
    [validateWithAI, delay]
  );

  return {
    validateWithAI,
    enhanceError,
    isValidating,
    error,
    validateWithAIDebounced,
  };
}

import { z } from "zod";
import { AutoFormFieldConfig, AutoFormProps } from "el-form-react";

// MCP AI Configuration
export interface MCPConfig {
  endpoint?: string;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// AI Form Generation
export interface AIFormGenerationRequest {
  description: string;
  context?: {
    domain?: string; // e.g., "e-commerce", "healthcare", "education"
    userType?: string; // e.g., "admin", "customer", "student"
    requirements?: string[];
  };
  constraints?: {
    maxFields?: number;
    requiredFields?: string[];
    fieldTypes?: string[];
    validationRules?: Record<string, string>;
  };
}

export interface AIFormGenerationResponse {
  schema: z.ZodSchema<any>;
  fields: AutoFormFieldConfig[];
  formProps: Partial<AutoFormProps<any>>;
  suggestions?: {
    title?: string;
    description?: string;
    layout?: "grid" | "flex";
    styling?: Record<string, string>;
  };
}

// AI Field Enhancement
export interface AIFieldEnhancementRequest {
  fieldName: string;
  currentConfig: AutoFormFieldConfig;
  formContext: {
    allFields: AutoFormFieldConfig[];
    domain?: string;
    userInput?: Record<string, any>;
  };
}

export interface AIFieldEnhancementResponse {
  enhancedConfig: AutoFormFieldConfig;
  suggestions: string[];
  validationRules?: z.ZodSchema<any>;
}

// AI Validation
export interface AIValidationRequest {
  fieldName: string;
  value: any;
  context: {
    allValues: Record<string, any>;
    fieldType: string;
    businessRules?: string[];
  };
}

export interface AIValidationResponse {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
  confidence: number;
}

// AI Error Enhancement
export interface AIErrorEnhancementRequest {
  fieldName: string;
  originalError: string;
  context: {
    fieldValue: any;
    fieldType: string;
    userIntent?: string;
  };
}

export interface AIErrorEnhancementResponse {
  enhancedMessage: string;
  suggestions: string[];
  helpLinks?: Array<{ text: string; url: string }>;
}

// Hooks return types
export interface UseAIFormBuilderReturn {
  generateForm: (
    request: AIFormGenerationRequest
  ) => Promise<AIFormGenerationResponse>;
  enhanceField: (
    request: AIFieldEnhancementRequest
  ) => Promise<AIFieldEnhancementResponse>;
  isLoading: boolean;
  error: string | null;
}

export interface UseAIValidationReturn {
  validateWithAI: (
    request: AIValidationRequest
  ) => Promise<AIValidationResponse>;
  enhanceError: (
    request: AIErrorEnhancementRequest
  ) => Promise<AIErrorEnhancementResponse>;
  isValidating: boolean;
  error: string | null;
}

// Component Props
export interface AIFormBuilderProps {
  onFormGenerated: (response: AIFormGenerationResponse) => void;
  mcpConfig?: MCPConfig;
  className?: string;
  placeholder?: string;
}

export interface SmartAutoFormProps<T extends Record<string, any>>
  extends Omit<AutoFormProps<T>, "schema" | "fields"> {
  // Allow schema and fields to be optional for AI generation
  schema?: z.ZodSchema<T>;
  fields?: AutoFormFieldConfig[];

  // AI-specific props
  aiDescription?: string;
  enableAIValidation?: boolean;
  enableSmartErrors?: boolean;
  enableFieldSuggestions?: boolean;
  mcpConfig?: MCPConfig;

  // AI event handlers
  onAIFormGenerated?: (response: AIFormGenerationResponse) => void;
  onAIValidation?: (
    request: AIValidationRequest,
    response: AIValidationResponse
  ) => void;
}

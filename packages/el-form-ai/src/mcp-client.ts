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
} from "./types";

/**
 * MCP Client for AI-powered form operations
 * Handles communication with MCP-compatible AI services
 */
export class MCPClient {
  private config: Required<MCPConfig>;
  private baseHeaders: Record<string, string>;

  constructor(config: MCPConfig = {}) {
    this.config = {
      endpoint: config.endpoint || "http://localhost:3000",
      apiKey: config.apiKey || "",
      model: config.model || "claude-3-sonnet",
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.3,
    };

    this.baseHeaders = {
      "Content-Type": "application/json",
      ...(this.config.apiKey && {
        Authorization: `Bearer ${this.config.apiKey}`,
      }),
    };
  }

  /**
   * Generate a complete form from natural language description
   */
  async generateForm(
    request: AIFormGenerationRequest
  ): Promise<AIFormGenerationResponse> {
    const prompt = this.buildFormGenerationPrompt(request);

    const response = await this.makeRequest("/api/mcp/generate-form", {
      prompt,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    return this.parseFormGenerationResponse(response);
  }

  /**
   * Enhance a specific field with AI suggestions
   */
  async enhanceField(
    request: AIFieldEnhancementRequest
  ): Promise<AIFieldEnhancementResponse> {
    const prompt = this.buildFieldEnhancementPrompt(request);

    const response = await this.makeRequest("/api/mcp/enhance-field", {
      prompt,
      model: this.config.model,
      maxTokens: 1000,
      temperature: 0.4,
    });

    return this.parseFieldEnhancementResponse(response);
  }

  /**
   * Perform AI-powered validation beyond schema validation
   */
  async validateWithAI(
    request: AIValidationRequest
  ): Promise<AIValidationResponse> {
    const prompt = this.buildValidationPrompt(request);

    const response = await this.makeRequest("/api/mcp/validate", {
      prompt,
      model: this.config.model,
      maxTokens: 500,
      temperature: 0.1,
    });

    return this.parseValidationResponse(response);
  }

  /**
   * Enhance error messages with AI-powered suggestions
   */
  async enhanceError(
    request: AIErrorEnhancementRequest
  ): Promise<AIErrorEnhancementResponse> {
    const prompt = this.buildErrorEnhancementPrompt(request);

    const response = await this.makeRequest("/api/mcp/enhance-error", {
      prompt,
      model: this.config.model,
      maxTokens: 300,
      temperature: 0.5,
    });

    return this.parseErrorEnhancementResponse(response);
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.endpoint}${endpoint}`, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `MCP request failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("MCP Client Error:", error);
      throw new Error(`Failed to communicate with MCP service: ${error}`);
    }
  }

  private buildFormGenerationPrompt(request: AIFormGenerationRequest): string {
    return `
Generate a React form configuration based on the following requirements:

Description: ${request.description}

Context:
- Domain: ${request.context?.domain || "general"}
- User Type: ${request.context?.userType || "general"}
- Requirements: ${request.context?.requirements?.join(", ") || "none"}

Constraints:
- Max Fields: ${request.constraints?.maxFields || 20}
- Required Fields: ${
      request.constraints?.requiredFields?.join(", ") || "auto-determine"
    }
- Allowed Field Types: ${request.constraints?.fieldTypes?.join(", ") || "all"}

Please provide:
1. A Zod schema with appropriate validation rules
2. AutoForm field configurations with proper types and labels
3. Layout and styling suggestions
4. Best practice recommendations

Format the response as a JSON object with schema, fields, formProps, and suggestions.
    `.trim();
  }

  private buildFieldEnhancementPrompt(
    request: AIFieldEnhancementRequest
  ): string {
    return `
Enhance the following form field based on context and best practices:

Field Name: ${request.fieldName}
Current Configuration: ${JSON.stringify(request.currentConfig, null, 2)}

Form Context:
- All Fields: ${request.formContext.allFields.map((f) => f.name).join(", ")}
- Domain: ${request.formContext.domain || "general"}
- Current User Input: ${JSON.stringify(
      request.formContext.userInput || {},
      null,
      2
    )}

Please suggest improvements for:
1. Field validation rules
2. User experience enhancements
3. Accessibility improvements
4. Placeholder and label text
5. Input constraints and formatting

Format the response as JSON with enhancedConfig and suggestions.
    `.trim();
  }

  private buildValidationPrompt(request: AIValidationRequest): string {
    return `
Perform advanced validation for the following field:

Field: ${request.fieldName}
Value: ${JSON.stringify(request.value)}
Field Type: ${request.context.fieldType}

Context:
- All Form Values: ${JSON.stringify(request.context.allValues, null, 2)}
- Business Rules: ${request.context.businessRules?.join(", ") || "none"}

Please validate for:
1. Business rule compliance
2. Contextual appropriateness
3. Data consistency with other fields
4. Common sense validation
5. Security considerations

Provide validation result, specific errors, suggestions, and confidence level.
    `.trim();
  }

  private buildErrorEnhancementPrompt(
    request: AIErrorEnhancementRequest
  ): string {
    return `
Enhance the following error message to be more helpful and user-friendly:

Field: ${request.fieldName}
Original Error: ${request.originalError}
Field Value: ${JSON.stringify(request.context.fieldValue)}
Field Type: ${request.context.fieldType}
User Intent: ${request.context.userIntent || "unknown"}

Please provide:
1. A more user-friendly error message
2. Specific suggestions for fixing the error
3. Helpful resources or documentation links if applicable

Make the message encouraging and constructive rather than punitive.
    `.trim();
  }

  private parseFormGenerationResponse(response: any): AIFormGenerationResponse {
    // Parse the AI response and convert to proper TypeScript types
    // This would include converting string schema to actual Zod schema
    // For now, return a mock response structure
    return {
      schema: response.schema,
      fields: response.fields || [],
      formProps: response.formProps || {},
      suggestions: response.suggestions,
    };
  }

  private parseFieldEnhancementResponse(
    response: any
  ): AIFieldEnhancementResponse {
    return {
      enhancedConfig: response.enhancedConfig,
      suggestions: response.suggestions || [],
      validationRules: response.validationRules,
    };
  }

  private parseValidationResponse(response: any): AIValidationResponse {
    return {
      isValid: response.isValid ?? true,
      errors: response.errors || [],
      suggestions: response.suggestions || [],
      confidence: response.confidence ?? 0.5,
    };
  }

  private parseErrorEnhancementResponse(
    response: any
  ): AIErrorEnhancementResponse {
    return {
      enhancedMessage: response.enhancedMessage || response.originalError,
      suggestions: response.suggestions || [],
      helpLinks: response.helpLinks || [],
    };
  }
}

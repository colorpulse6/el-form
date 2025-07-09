import { z } from "zod";
import { AutoFormFieldConfig } from "el-form-react";

/**
 * Convert a string-based Zod schema to an actual Zod schema object
 * This would be used to parse AI-generated schema strings
 */
export function parseSchemaFromString(schemaString: string): z.ZodSchema<any> {
  try {
    // This is a simplified example - in practice, you'd need a more robust parser
    // or ensure the AI returns properly formatted schema objects
    const schemaFunction = new Function("z", `return ${schemaString}`);
    return schemaFunction(z);
  } catch (error) {
    console.error("Failed to parse schema from string:", error);
    throw new Error("Invalid schema format received from AI");
  }
}

/**
 * Generate a natural language description from existing form schema and fields
 * Useful for reverse-engineering forms or creating AI training data
 */
export function generateFormDescription(
  _schema: z.ZodSchema<any>,
  fields: AutoFormFieldConfig[]
): string {
  const fieldDescriptions = fields.map((field) => {
    const typeDescription = field.type || "text";
    const requiredText = field.label?.includes("*") ? "required" : "optional";
    return `${field.label || field.name} (${typeDescription}, ${requiredText})`;
  });

  return `A form with the following fields: ${fieldDescriptions.join(", ")}.`;
}

/**
 * Validate AI-generated form configuration
 * Ensures the AI response is valid and safe to use
 */
export function validateAIFormResponse(response: any): boolean {
  try {
    // Check required properties
    if (!response.schema || !response.fields) {
      return false;
    }

    // Validate fields array
    if (!Array.isArray(response.fields)) {
      return false;
    }

    // Check each field has required properties
    for (const field of response.fields) {
      if (!field.name || typeof field.name !== "string") {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("AI form response validation failed:", error);
    return false;
  }
}

/**
 * Sanitize AI-generated text to prevent XSS and other security issues
 */
export function sanitizeAIText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Basic sanitization - remove script tags and other potentially dangerous content
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

/**
 * Extract field suggestions from AI responses
 */
export function extractFieldSuggestions(aiResponse: string): string[] {
  const suggestions: string[] = [];

  // Look for common suggestion patterns in AI responses
  const suggestionPatterns = [
    /suggest(?:ion|s)?[:\s]+(.*?)(?:\n|$)/gi,
    /recommend(?:ation|s)?[:\s]+(.*?)(?:\n|$)/gi,
    /consider[:\s]+(.*?)(?:\n|$)/gi,
  ];

  suggestionPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(aiResponse)) !== null) {
      const suggestion = sanitizeAIText(match[1]);
      if (suggestion && !suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }
  });

  return suggestions;
}

/**
 * Convert form domain to AI context for better form generation
 */
export function getDomainContext(domain: string): {
  commonFields: string[];
  validationRules: Record<string, any>;
  styling: Record<string, any>;
} {
  const domainContexts: Record<string, any> = {
    "e-commerce": {
      commonFields: [
        "email",
        "firstName",
        "lastName",
        "address",
        "city",
        "zipCode",
        "phone",
      ],
      validationRules: {
        email: "Email format validation",
        phone: "Phone number format validation",
        zipCode: "Postal code validation",
      },
      styling: {
        theme: "professional",
        colors: "blue",
      },
    },
    healthcare: {
      commonFields: [
        "firstName",
        "lastName",
        "dateOfBirth",
        "email",
        "phone",
        "emergencyContact",
      ],
      validationRules: {
        dateOfBirth: "Age validation (18+)",
        phone: "Phone number format validation",
        email: "Email format validation",
      },
      styling: {
        theme: "clean",
        colors: "green",
      },
    },
    education: {
      commonFields: [
        "firstName",
        "lastName",
        "studentId",
        "email",
        "course",
        "year",
      ],
      validationRules: {
        studentId: "Student ID format validation",
        email: "Email format validation",
        year: "Academic year validation",
      },
      styling: {
        theme: "academic",
        colors: "indigo",
      },
    },
  };

  return (
    domainContexts[domain] || {
      commonFields: ["firstName", "lastName", "email"],
      validationRules: {},
      styling: { theme: "default", colors: "gray" },
    }
  );
}

/**
 * Merge AI suggestions with existing form configuration
 */
export function mergeAISuggestions(
  existingFields: AutoFormFieldConfig[],
  aiSuggestions: AutoFormFieldConfig[]
): AutoFormFieldConfig[] {
  const mergedFields = [...existingFields];

  aiSuggestions.forEach((suggestion) => {
    const existingIndex = mergedFields.findIndex(
      (field) => field.name === suggestion.name
    );

    if (existingIndex >= 0) {
      // Merge with existing field
      mergedFields[existingIndex] = {
        ...mergedFields[existingIndex],
        ...suggestion,
        // Preserve original name
        name: mergedFields[existingIndex].name,
      };
    } else {
      // Add new field
      mergedFields.push(suggestion);
    }
  });

  return mergedFields;
}

/**
 * Generate AI prompt context from current form state
 */
export function generatePromptContext(formData: {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  domain?: string;
}): string {
  const { values, errors, touched, domain } = formData;

  const context = [
    `Form Domain: ${domain || "general"}`,
    `Current Values: ${JSON.stringify(values)}`,
    `Current Errors: ${JSON.stringify(errors)}`,
    `Touched Fields: ${Object.keys(touched)
      .filter((key) => touched[key])
      .join(", ")}`,
  ];

  return context.join("\n");
}

import { useState, useCallback, useEffect } from "react";
import { AutoForm } from "el-form-react";
import { useAIFormBuilder } from "./hooks";
import {
  AIFormBuilderProps,
  SmartAutoFormProps,
  AIFormGenerationRequest,
  AIFormGenerationResponse,
} from "./types";

/**
 * AI Form Builder Component
 * Allows users to generate forms from natural language descriptions
 */
export function AIFormBuilder({
  onFormGenerated,
  mcpConfig,
  className = "",
  placeholder = "Describe the form you want to create...",
}: AIFormBuilderProps) {
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [userType, setUserType] = useState("");
  const { generateForm, isLoading, error } = useAIFormBuilder(mcpConfig);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) return;

    const request: AIFormGenerationRequest = {
      description: description.trim(),
      context: {
        domain: domain || undefined,
        userType: userType || undefined,
      },
    };

    try {
      const response = await generateForm(request);
      onFormGenerated(response);
    } catch (err) {
      console.error("Form generation failed:", err);
    }
  }, [description, domain, userType, generateForm, onFormGenerated]);

  return (
    <div className={`ai-form-builder ${className}`}>
      <div className="space-y-4 p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          🤖 AI Form Builder
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain (optional)
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select domain...</option>
              <option value="e-commerce">E-commerce</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
              <option value="real-estate">Real Estate</option>
              <option value="hr">Human Resources</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Type (optional)
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select user type...</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="student">Student</option>
              <option value="client">Client</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Form Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: "Create a customer registration form with name, email,
            phone, and address fields"
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">⚠️ {error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!description.trim() || isLoading}
          className={`
            w-full px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              description.trim() && !isLoading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {isLoading ? "🔄 Generating Form..." : "✨ Generate Form"}
        </button>
      </div>
    </div>
  );
}

/**
 * Smart AutoForm with AI enhancements
 * Extends the regular AutoForm with AI-powered features
 */
export function SmartAutoForm<T extends Record<string, any>>({
  schema,
  fields,
  aiDescription,
  enableAIValidation = false,
  enableSmartErrors = false,
  enableFieldSuggestions = false,
  mcpConfig,
  onAIFormGenerated,
  onAIValidation,
  ...autoFormProps
}: SmartAutoFormProps<T>) {
  const [currentSchema, setCurrentSchema] = useState(schema);
  const [currentFields, setCurrentFields] = useState(fields);
  const [generationState, setGenerationState] = useState<
    "idle" | "generating" | "generated"
  >("idle");

  const { generateForm, isLoading: isGenerating } = useAIFormBuilder(mcpConfig);

  // Generate form from AI description if no schema/fields provided
  useEffect(() => {
    if (aiDescription && !schema && !fields && generationState === "idle") {
      setGenerationState("generating");

      const request: AIFormGenerationRequest = {
        description: aiDescription,
      };

      generateForm(request)
        .then((response: AIFormGenerationResponse) => {
          setCurrentSchema(response.schema);
          setCurrentFields(response.fields);
          setGenerationState("generated");
          onAIFormGenerated?.(response);
        })
        .catch((err) => {
          console.error("AI form generation failed:", err);
          setGenerationState("idle");
        });
    }
  }, [
    aiDescription,
    schema,
    fields,
    generateForm,
    onAIFormGenerated,
    generationState,
  ]);

  // Show loading state during generation
  if (generationState === "generating" || isGenerating) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">🤖 AI is generating your form...</p>
        <p className="text-sm text-gray-500 mt-2">
          This may take a few seconds
        </p>
      </div>
    );
  }

  // Show error if generation failed and no fallback schema
  if (!currentSchema) {
    return (
      <div className="p-8 text-center border-2 border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 font-medium">⚠️ Unable to generate form</p>
        <p className="text-sm text-red-500 mt-2">
          Please provide a schema or check your AI configuration
        </p>
      </div>
    );
  }

  // Enhanced error component with AI suggestions
  const SmartErrorComponent = enableSmartErrors
    ? ({
        errors,
        touched,
      }: {
        errors: Record<string, string>;
        touched: Record<string, boolean>;
      }) => {
        const errorEntries = Object.entries(errors).filter(
          ([field]) => touched[field]
        );

        if (errorEntries.length === 0) return null;

        return (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <h3 className="text-red-800 font-medium mb-2">
              ⚠️ Please fix the following:
            </h3>
            <ul className="space-y-1">
              {errorEntries.map(([field, error]) => (
                <li key={field} className="text-red-700 text-sm">
                  <span className="font-medium capitalize">{field}:</span>{" "}
                  {error}
                </li>
              ))}
            </ul>
          </div>
        );
      }
    : undefined;

  return (
    <div className="smart-autoform">
      {generationState === "generated" && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm flex items-center gap-2">
            ✅ <span className="font-medium">Form generated by AI</span>
          </p>
          <p className="text-green-700 text-xs mt-1">
            You can customize this form or regenerate with different
            requirements
          </p>
        </div>
      )}

      <AutoForm
        schema={currentSchema as any}
        fields={currentFields}
        customErrorComponent={SmartErrorComponent}
        {...autoFormProps}
      />
    </div>
  );
}

/**
 * AI Form Preview Component
 * Shows a preview of AI-generated forms before implementation
 */
export function AIFormPreview({
  response,
  onAccept,
  onReject,
  onModify,
}: {
  response: AIFormGenerationResponse;
  onAccept: () => void;
  onReject: () => void;
  onModify: (response: AIFormGenerationResponse) => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="font-medium text-gray-900">🔍 AI Form Preview</h3>
        {response.suggestions?.title && (
          <p className="text-sm text-gray-600 mt-1">
            {response.suggestions.title}
          </p>
        )}
      </div>

      <div className="p-4">
        <AutoForm
          schema={response.schema as any}
          fields={response.fields}
          onSubmit={() => {}} // Preview only, no actual submission
          {...response.formProps}
        />
      </div>

      {response.suggestions && (
        <div className="bg-blue-50 px-4 py-3 border-t">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 AI Suggestions:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {response.suggestions.description && (
              <li>• {response.suggestions.description}</li>
            )}
            {response.suggestions.layout && (
              <li>• Recommended layout: {response.suggestions.layout}</li>
            )}
          </ul>
        </div>
      )}

      <div className="bg-gray-50 px-4 py-3 border-t flex gap-2 justify-end">
        <button
          onClick={onReject}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          ❌ Reject
        </button>
        <button
          onClick={() => onModify(response)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          ✏️ Modify
        </button>
        <button
          onClick={onAccept}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          ✅ Accept
        </button>
      </div>
    </div>
  );
}

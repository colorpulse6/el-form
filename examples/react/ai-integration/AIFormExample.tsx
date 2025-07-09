import React, { useState } from "react";
import {
  AIFormBuilder,
  SmartAutoForm,
  AIFormPreview,
  useAIFormBuilder,
  AIFormGenerationResponse,
  MCPConfig,
} from "../../../packages/el-form-ai/src";
import { z } from "zod";

// Example MCP configuration
const mcpConfig: MCPConfig = {
  endpoint: "http://localhost:3000", // MCP server endpoint
  apiKey: undefined, // Optional - set if using real AI
  model: "claude-3-sonnet",
  maxTokens: 2000,
  temperature: 0.3,
};

export function AIFormExample() {
  const [activeTab, setActiveTab] = useState<"builder" | "smart" | "preview">(
    "builder"
  );
  const [generatedForm, setGeneratedForm] =
    useState<AIFormGenerationResponse | null>(null);
  const [previewForm, setPreviewForm] =
    useState<AIFormGenerationResponse | null>(null);

  const handleFormGenerated = (response: AIFormGenerationResponse) => {
    setGeneratedForm(response);
    setPreviewForm(response);
    console.log("AI Generated Form:", response);
  };

  const handleFormSubmit = (data: any) => {
    console.log("Form submitted:", data);
    alert("Form submitted successfully! Check console for data.");
  };

  const handlePreviewAccept = () => {
    if (previewForm) {
      setGeneratedForm(previewForm);
      setPreviewForm(null);
      setActiveTab("builder");
    }
  };

  const handlePreviewReject = () => {
    setPreviewForm(null);
  };

  const handlePreviewModify = (response: AIFormGenerationResponse) => {
    console.log("Modification requested for:", response);
    // In a real app, you might open a form editor here
    alert("Modification interface would open here");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 AI Form Integration Demo
        </h1>
        <p className="text-gray-600">
          Demonstrate AI-powered form generation and enhancement using MCP
        </p>
      </div>

      {/* Configuration Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">🔧 MCP Configuration</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Endpoint:</strong> {mcpConfig.endpoint}
          </p>
          <p>
            <strong>Model:</strong> {mcpConfig.model}
          </p>
          <p>
            <strong>API Key:</strong>{" "}
            {mcpConfig.apiKey ? "✅ Configured" : "❌ Using Mock Server"}
          </p>
        </div>
        {!mcpConfig.apiKey && (
          <p className="text-xs text-blue-600 mt-2">
            💡 Currently using mock server for demo. No API key needed!
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                id: "builder",
                label: "🏗️ AI Form Builder",
                desc: "Generate forms from descriptions",
              },
              {
                id: "smart",
                label: "🧠 Smart AutoForm",
                desc: "AI-enhanced form with validation",
              },
              {
                id: "preview",
                label: "🔍 Form Preview",
                desc: "Preview and approve AI forms",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{tab.label}</span>
                  <span className="text-xs text-gray-400 mt-1">{tab.desc}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === "builder" && (
          <BuilderTab
            onFormGenerated={handleFormGenerated}
            generatedForm={generatedForm}
            onFormSubmit={handleFormSubmit}
            mcpConfig={mcpConfig}
          />
        )}

        {activeTab === "smart" && (
          <SmartFormTab onFormSubmit={handleFormSubmit} mcpConfig={mcpConfig} />
        )}

        {activeTab === "preview" && (
          <PreviewTab
            previewForm={previewForm}
            onAccept={handlePreviewAccept}
            onReject={handlePreviewReject}
            onModify={handlePreviewModify}
          />
        )}
      </div>
    </div>
  );
}

// Builder Tab Component
function BuilderTab({
  onFormGenerated,
  generatedForm,
  onFormSubmit,
  mcpConfig,
}: {
  onFormGenerated: (response: AIFormGenerationResponse) => void;
  generatedForm: AIFormGenerationResponse | null;
  onFormSubmit: (data: any) => void;
  mcpConfig: MCPConfig;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* AI Form Builder */}
      <div>
        <h2 className="text-xl font-semibold mb-4">🤖 Generate Form with AI</h2>
        <AIFormBuilder
          onFormGenerated={onFormGenerated}
          mcpConfig={mcpConfig}
          placeholder="Describe the form you need... Examples:
• Create a customer feedback form with rating and comments
• Build a job application form with personal info and experience
• Generate a product registration form with warranty details"
        />

        {/* Example Prompts */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            💡 Try these examples:
          </h4>
          <div className="space-y-2 text-sm">
            <button
              onClick={() =>
                onFormGenerated({
                  schema: z.object({
                    name: z.string().min(1, "Name is required"),
                    email: z.string().email("Invalid email"),
                    rating: z.number().min(1).max(5),
                    comments: z.string().optional(),
                  }),
                  fields: [
                    {
                      name: "name",
                      label: "Full Name",
                      type: "text",
                      colSpan: 12,
                    },
                    {
                      name: "email",
                      label: "Email Address",
                      type: "email",
                      colSpan: 12,
                    },
                    {
                      name: "rating",
                      label: "Rating (1-5)",
                      type: "number",
                      colSpan: 6,
                    },
                    {
                      name: "comments",
                      label: "Comments",
                      type: "textarea",
                      colSpan: 12,
                    },
                  ],
                  formProps: { layout: "grid", columns: 12 },
                })
              }
              className="block w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
            >
              🌟 Customer Feedback Form
            </button>
            <button
              onClick={() =>
                onFormGenerated({
                  schema: z.object({
                    firstName: z.string().min(1, "First name required"),
                    lastName: z.string().min(1, "Last name required"),
                    email: z.string().email("Invalid email"),
                    phone: z.string().min(10, "Valid phone number required"),
                    position: z.string().min(1, "Position required"),
                    experience: z.string().min(1, "Experience required"),
                  }),
                  fields: [
                    {
                      name: "firstName",
                      label: "First Name",
                      type: "text",
                      colSpan: 6,
                    },
                    {
                      name: "lastName",
                      label: "Last Name",
                      type: "text",
                      colSpan: 6,
                    },
                    {
                      name: "email",
                      label: "Email",
                      type: "email",
                      colSpan: 6,
                    },
                    { name: "phone", label: "Phone", type: "text", colSpan: 6 },
                    {
                      name: "position",
                      label: "Position Applied For",
                      type: "text",
                      colSpan: 12,
                    },
                    {
                      name: "experience",
                      label: "Work Experience",
                      type: "textarea",
                      colSpan: 12,
                    },
                  ],
                  formProps: { layout: "grid", columns: 12 },
                })
              }
              className="block w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
            >
              💼 Job Application Form
            </button>
          </div>
        </div>
      </div>

      {/* Generated Form Display */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📋 Generated Form</h2>
        {generatedForm ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-50 px-4 py-2 border-b">
              <p className="text-green-800 text-sm font-medium">
                ✅ Form generated successfully
              </p>
              {generatedForm.suggestions?.title && (
                <p className="text-green-700 text-xs mt-1">
                  {generatedForm.suggestions.title}
                </p>
              )}
            </div>

            <div className="p-4">
              <SmartAutoForm
                schema={generatedForm.schema}
                fields={generatedForm.fields}
                onSubmit={onFormSubmit}
                enableSmartErrors={true}
                {...generatedForm.formProps}
              />
            </div>

            {generatedForm.suggestions && (
              <div className="bg-blue-50 px-4 py-3 border-t">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  💡 AI Suggestions:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {generatedForm.suggestions.description && (
                    <li>• {generatedForm.suggestions.description}</li>
                  )}
                  {generatedForm.suggestions.layout && (
                    <li>• Layout: {generatedForm.suggestions.layout}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">🎯 Generated form will appear here</p>
            <p className="text-sm text-gray-400 mt-2">
              Use the AI Form Builder to create a form from your description
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Smart Form Tab Component
function SmartFormTab({
  onFormSubmit,
  mcpConfig,
}: {
  onFormSubmit: (data: any) => void;
  mcpConfig: MCPConfig;
}) {
  const [selectedDescription, setSelectedDescription] = useState("");

  const descriptions = [
    "Create a comprehensive user profile form with personal information, preferences, and settings",
    "Build a product order form with item selection, quantity, shipping, and payment details",
    "Generate a event registration form with attendee details, meal preferences, and special requirements",
    "Design a technical support ticket form with issue categorization and priority levels",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          🧠 Smart AutoForm with AI
        </h2>
        <p className="text-gray-600 mb-4">
          This component automatically generates forms from descriptions and
          includes AI-enhanced validation and error messages.
        </p>
      </div>

      {/* Description Selector */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a form description:
        </label>
        <select
          value={selectedDescription}
          onChange={(e) => setSelectedDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a description...</option>
          {descriptions.map((desc, index) => (
            <option key={index} value={desc}>
              {desc.substring(0, 60)}...
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Or provide your own description in the form below
        </p>
      </div>

      {/* Smart AutoForm */}
      <div className="border rounded-lg p-6">
        <SmartAutoForm
          aiDescription={selectedDescription || undefined}
          enableAIValidation={true}
          enableSmartErrors={true}
          enableFieldSuggestions={true}
          mcpConfig={mcpConfig}
          onSubmit={onFormSubmit}
          onAIFormGenerated={(response: AIFormGenerationResponse) => {
            console.log("Smart form generated:", response);
          }}
          onAIValidation={(request: any, response: any) => {
            console.log("AI validation:", { request, response });
          }}
        />
      </div>

      {/* Features Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🤖 Auto Generation</h4>
          <p className="text-sm text-blue-700">
            Forms are automatically generated from natural language descriptions
            using AI.
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">
            ✨ Smart Validation
          </h4>
          <p className="text-sm text-green-700">
            AI provides advanced validation beyond basic schema rules.
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">
            💬 Enhanced Errors
          </h4>
          <p className="text-sm text-purple-700">
            Error messages are enhanced with AI to be more helpful and
            user-friendly.
          </p>
        </div>
      </div>
    </div>
  );
}

// Preview Tab Component
function PreviewTab({
  previewForm,
  onAccept,
  onReject,
  onModify,
}: {
  previewForm: AIFormGenerationResponse | null;
  onAccept: () => void;
  onReject: () => void;
  onModify: (response: AIFormGenerationResponse) => void;
}) {
  if (!previewForm) {
    return (
      <div className="text-center py-12">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <p className="text-gray-500 text-lg mb-2">🔍 No form to preview</p>
          <p className="text-sm text-gray-400">
            Generate a form using the AI Form Builder to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">🔍 AI Form Preview</h2>
        <p className="text-gray-600">
          Review the AI-generated form before accepting it into your
          application.
        </p>
      </div>

      <AIFormPreview
        response={previewForm}
        onAccept={onAccept}
        onReject={onReject}
        onModify={onModify}
      />

      {/* Technical Details */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">🔧 Technical Details</h4>
        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
            View generated schema and field configuration
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <h5 className="font-medium text-gray-700">Schema:</h5>
              <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                {JSON.stringify(previewForm.schema._def, null, 2)}
              </pre>
            </div>
            <div>
              <h5 className="font-medium text-gray-700">Fields:</h5>
              <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                {JSON.stringify(previewForm.fields, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

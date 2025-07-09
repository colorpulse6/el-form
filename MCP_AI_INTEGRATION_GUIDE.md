# 🤖 MCP AI Integration Guide for El-Form

This guide explains how to integrate Model Context Protocol (MCP) AI capabilities into your el-form library, enabling AI-powered form generation, validation, and enhancement.

## 🎯 Overview

The MCP AI integration adds intelligent capabilities to el-form through:

- **🏗️ AI Form Generation**: Create forms from natural language descriptions
- **🔍 Smart Field Enhancement**: AI-powered field optimization and suggestions
- **✨ Intelligent Validation**: Advanced validation beyond schema rules
- **💬 Enhanced Error Messages**: User-friendly, contextual error messages
- **🎨 Domain-Specific Optimization**: Industry-specific form templates and rules

## 📦 Package Structure

The AI integration is implemented as a separate package `el-form-ai` that extends the core el-form functionality:

```
packages/
├── el-form-core/           # Core validation & utilities
├── el-form-react/          # React components & hooks
├── el-form-react-hooks/    # React hooks package
├── el-form-react-components/# React components package
└── el-form-ai/            # 🆕 AI integration package
    ├── src/
    │   ├── types.ts        # TypeScript type definitions
    │   ├── mcp-client.ts   # MCP communication client
    │   ├── hooks.ts        # React hooks for AI functionality
    │   ├── components.tsx  # AI-powered React components
    │   ├── utils.ts        # AI utility functions
    │   └── index.ts        # Main exports
    ├── package.json
    ├── tsup.config.ts
    └── README.md
```

## 🚀 Quick Start

### 1. Installation

```bash
# Add to your existing el-form project
pnpm add el-form-ai

# Or install all el-form packages
pnpm add el-form el-form-ai
```

### 2. Basic Setup

```tsx
import { AIFormBuilder, SmartAutoForm } from "el-form-ai";

const mcpConfig = {
  endpoint: "http://localhost:3000",
  model: "claude-3-sonnet",
};

function App() {
  return (
    <div>
      {/* AI Form Builder */}
      <AIFormBuilder
        onFormGenerated={(response) => console.log(response)}
        mcpConfig={mcpConfig}
      />

      {/* Smart AutoForm */}
      <SmartAutoForm
        aiDescription="Create a customer registration form"
        enableAIValidation={true}
        mcpConfig={mcpConfig}
        onSubmit={(data) => console.log(data)}
      />
    </div>
  );
}
```

## 🔧 Core Components

### 1. AIFormBuilder Component

Interactive form builder that generates forms from natural language:

```tsx
<AIFormBuilder
  onFormGenerated={handleFormGenerated}
  mcpConfig={mcpConfig}
  placeholder="Describe your form needs..."
  className="my-form-builder"
/>
```

### 2. SmartAutoForm Component

Enhanced AutoForm with AI capabilities:

```tsx
<SmartAutoForm
  aiDescription="Employee onboarding form with personal details"
  enableAIValidation={true}
  enableSmartErrors={true}
  enableFieldSuggestions={true}
  mcpConfig={mcpConfig}
  onSubmit={handleSubmit}
  onAIFormGenerated={handleAIGeneration}
/>
```

### 3. AIFormPreview Component

Preview and approve AI-generated forms:

```tsx
<AIFormPreview
  response={aiGeneratedForm}
  onAccept={() => setApprovedForm(aiGeneratedForm)}
  onReject={() => setAiGeneratedForm(null)}
  onModify={handleFormModification}
/>
```

## 🎣 React Hooks

### useAIFormBuilder Hook

```tsx
import { useAIFormBuilder } from "el-form-ai";

function MyComponent() {
  const { generateForm, enhanceField, isLoading, error } =
    useAIFormBuilder(mcpConfig);

  const handleGenerate = async () => {
    const response = await generateForm({
      description: "Customer feedback form with rating",
      context: { domain: "e-commerce", userType: "customer" },
    });
    console.log("Generated form:", response);
  };

  return (
    <button onClick={handleGenerate} disabled={isLoading}>
      {isLoading ? "Generating..." : "Generate Form"}
    </button>
  );
}
```

### useAIValidation Hook

```tsx
import { useAIValidation } from "el-form-ai";

function ValidationExample() {
  const { validateWithAI, enhanceError, isValidating } =
    useAIValidation(mcpConfig);

  const handleFieldValidation = async (fieldName, value) => {
    const result = await validateWithAI({
      fieldName,
      value,
      context: {
        allValues: formData,
        fieldType: "email",
        businessRules: ["Must be work email"],
      },
    });

    if (!result.isValid) {
      console.log("AI validation errors:", result.errors);
    }
  };

  return <div>/* Your form fields */</div>;
}
```

## 🌐 MCP Server Integration

### Setting Up MCP Server

You can use the provided example server or implement your own:

```bash
# Start the example MCP server
cd examples/mcp-server
npm install
npm start
```

### MCP Server Requirements

Your MCP server should implement these endpoints:

- `POST /api/mcp/generate-form` - Form generation from descriptions
- `POST /api/mcp/enhance-field` - Field enhancement suggestions
- `POST /api/mcp/validate` - AI-powered field validation
- `POST /api/mcp/enhance-error` - Error message enhancement

### Example MCP Response

```json
{
  "success": true,
  "schema": "z.object({name: z.string(), email: z.string().email()})",
  "fields": [
    {
      "name": "name",
      "label": "Full Name",
      "type": "text",
      "colSpan": 12
    },
    {
      "name": "email",
      "label": "Email Address",
      "type": "email",
      "colSpan": 12
    }
  ],
  "formProps": {
    "layout": "grid",
    "columns": 12
  },
  "suggestions": {
    "title": "Contact Form",
    "description": "Simple contact form for inquiries"
  }
}
```

## 💡 Usage Examples

### Dynamic Form Generation

```tsx
function DynamicFormExample() {
  const [formDescription, setFormDescription] = useState("");
  const [generatedForm, setGeneratedForm] = useState(null);

  return (
    <div>
      <textarea
        value={formDescription}
        onChange={(e) => setFormDescription(e.target.value)}
        placeholder="Describe your form..."
      />

      <SmartAutoForm
        aiDescription={formDescription}
        onAIFormGenerated={setGeneratedForm}
        mcpConfig={mcpConfig}
        onSubmit={(data) => console.log("Form submitted:", data)}
      />
    </div>
  );
}
```

### Progressive Enhancement

```tsx
function ProgressiveFormExample() {
  const [baseForm, setBaseForm] = useState(initialForm);
  const { enhanceField } = useAIFormBuilder(mcpConfig);

  const enhanceFormField = async (fieldName) => {
    const enhanced = await enhanceField({
      fieldName,
      currentConfig: baseForm.fields.find((f) => f.name === fieldName),
      formContext: { allFields: baseForm.fields, domain: "healthcare" },
    });

    // Apply enhancements
    setBaseForm((form) => ({
      ...form,
      fields: form.fields.map((field) =>
        field.name === fieldName
          ? { ...field, ...enhanced.enhancedConfig }
          : field
      ),
    }));
  };

  return (
    <AutoForm
      schema={baseForm.schema}
      fields={baseForm.fields}
      onSubmit={handleSubmit}
      // Add enhancement buttons
      renderFieldActions={(field) => (
        <button onClick={() => enhanceFormField(field.name)}>
          ✨ Enhance with AI
        </button>
      )}
    />
  );
}
```

## 🔒 Security & Best Practices

### Input Sanitization

```tsx
import { sanitizeAIText, validateAIFormResponse } from "el-form-ai";

// Always sanitize AI-generated content
const processAIResponse = (response) => {
  // Validate response structure
  if (!validateAIFormResponse(response)) {
    throw new Error("Invalid AI response format");
  }

  // Sanitize text content
  return {
    ...response,
    suggestions: {
      ...response.suggestions,
      description: sanitizeAIText(response.suggestions?.description),
    },
  };
};
```

### Error Handling

```tsx
function RobustAIForm() {
  return (
    <ErrorBoundary
      fallback={<FallbackForm />}
      onError={(error) => {
        console.error("AI form error:", error);
        // Report to monitoring service
      }}
    >
      <SmartAutoForm
        aiDescription="User registration form"
        mcpConfig={mcpConfig}
        onSubmit={handleSubmit}
      />
    </ErrorBoundary>
  );
}
```

## 🧪 Testing

### Mock AI Responses

```tsx
// For testing, mock the AI hooks
jest.mock("el-form-ai", () => ({
  useAIFormBuilder: () => ({
    generateForm: jest.fn().mockResolvedValue(mockFormResponse),
    isLoading: false,
    error: null,
  }),
}));

test("AI form generation works correctly", async () => {
  render(<AIFormBuilder onFormGenerated={handleGenerated} />);
  // Test form generation flow
});
```

## 🚀 Production Deployment

### Environment Configuration

```bash
# Environment variables
REACT_APP_MCP_ENDPOINT=https://your-mcp-server.com
REACT_APP_MCP_API_KEY=your-api-key
```

### Performance Optimization

```tsx
// Cache AI responses to avoid repeated calls
const memoizedAIFormBuilder = useMemo(
  () => ({
    ...aiFormBuilder,
    generateForm: memoize(aiFormBuilder.generateForm),
  }),
  [aiFormBuilder]
);

// Debounce AI validation
const debouncedValidation = useAIValidationDebounced(mcpConfig, 1000);
```

## 📚 API Reference

### Types

```typescript
interface MCPConfig {
  endpoint?: string;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface AIFormGenerationRequest {
  description: string;
  context?: {
    domain?: string;
    userType?: string;
    requirements?: string[];
  };
  constraints?: {
    maxFields?: number;
    requiredFields?: string[];
    fieldTypes?: string[];
  };
}

interface AIFormGenerationResponse {
  schema: z.ZodSchema<any>;
  fields: AutoFormFieldConfig[];
  formProps: Partial<AutoFormProps<any>>;
  suggestions?: {
    title?: string;
    description?: string;
    layout?: "grid" | "flex";
  };
}
```

### Utilities

```typescript
// Domain-specific contexts
const context = getDomainContext("e-commerce");
// Returns: { commonFields, validationRules, styling }

// Form description generation
const description = generateFormDescription(schema, fields);

// AI response validation
const isValid = validateAIFormResponse(response);

// Text sanitization
const safeText = sanitizeAIText(aiGeneratedText);
```

This MCP AI integration transforms el-form into an intelligent form builder that can understand natural language, provide contextual suggestions, and enhance user experience through AI-powered features while maintaining the library's core principles of type safety and flexibility.

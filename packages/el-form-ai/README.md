# el-form-ai

AI-powered form generation and enhancement for el-form library using Model Context Protocol (MCP).

## 🚀 Features

- **🤖 AI Form Generation**: Create forms from natural language descriptions
- **🔍 Smart Field Enhancement**: AI-powered field suggestions and improvements
- **✨ Intelligent Validation**: Advanced validation beyond schema rules
- **💬 Smart Error Messages**: AI-enhanced, user-friendly error messages
- **🎯 Context-Aware**: Domain-specific optimizations for different industries
- **🔧 Flexible Integration**: Works with existing el-form components

## 📦 Installation

```bash
npm install el-form-ai
# or
pnpm add el-form-ai
# or
yarn add el-form-ai
```

## 🛠 Setup

### 1. Configure MCP Endpoint

```typescript
import { MCPConfig } from "el-form-ai";

const mcpConfig: MCPConfig = {
  endpoint: "http://localhost:3000", // Your MCP server
  apiKey: "your-api-key", // Optional
  model: "claude-3-sonnet", // AI model to use
  maxTokens: 2000,
  temperature: 0.3,
};
```

### 2. Environment Variables (Optional)

```bash
MCP_ENDPOINT=http://localhost:3000
MCP_API_KEY=your-api-key
```

## 🎯 Usage Examples

### AI Form Builder Component

```tsx
import { AIFormBuilder, AIFormGenerationResponse } from "el-form-ai";
import { useState } from "react";

function MyFormBuilder() {
  const [generatedForm, setGeneratedForm] =
    useState<AIFormGenerationResponse | null>(null);

  const handleFormGenerated = (response: AIFormGenerationResponse) => {
    setGeneratedForm(response);
    console.log("Generated form:", response);
  };

  return (
    <div>
      <AIFormBuilder
        onFormGenerated={handleFormGenerated}
        mcpConfig={{
          endpoint: "http://localhost:3000",
          model: "claude-3-sonnet",
        }}
        placeholder="Describe your form (e.g., 'Create a customer registration form with name, email, and phone')"
      />

      {generatedForm && (
        <div className="mt-8">
          <h3>Generated Form:</h3>
          <AutoForm
            schema={generatedForm.schema}
            fields={generatedForm.fields}
            onSubmit={(data) => console.log("Form submitted:", data)}
          />
        </div>
      )}
    </div>
  );
}
```

### Smart AutoForm with AI Generation

```tsx
import { SmartAutoForm } from "el-form-ai";

function MySmartForm() {
  return (
    <SmartAutoForm
      aiDescription="Create a job application form with personal details, experience, and skills"
      enableAIValidation={true}
      enableSmartErrors={true}
      enableFieldSuggestions={true}
      mcpConfig={{
        endpoint: "http://localhost:3000",
      }}
      onSubmit={(data) => console.log("Form submitted:", data)}
      onAIFormGenerated={(response) =>
        console.log("AI generated form:", response)
      }
    />
  );
}
```

### Using AI Hooks

```tsx
import { useAIFormBuilder, useAIValidation } from "el-form-ai";

function MyComponent() {
  const { generateForm, isLoading, error } = useAIFormBuilder({
    endpoint: "http://localhost:3000",
  });

  const { validateWithAI, enhanceError } = useAIValidation();

  const handleGenerateForm = async () => {
    try {
      const response = await generateForm({
        description: "Create a contact form with name, email, and message",
        context: {
          domain: "marketing",
          userType: "customer",
        },
      });

      console.log("Generated form:", response);
    } catch (err) {
      console.error("Generation failed:", err);
    }
  };

  const handleValidateField = async (fieldName: string, value: any) => {
    const validationResponse = await validateWithAI({
      fieldName,
      value,
      context: {
        allValues: {
          /* form values */
        },
        fieldType: "email",
        businessRules: ["Must be work email", "No disposable emails"],
      },
    });

    console.log("AI validation:", validationResponse);
  };

  return (
    <div>
      <button onClick={handleGenerateForm} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Form"}
      </button>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
```

### AI Form Preview

```tsx
import { AIFormPreview, AIFormGenerationResponse } from "el-form-ai";

function MyFormPreview({ response }: { response: AIFormGenerationResponse }) {
  const handleAccept = () => {
    console.log("Form accepted");
    // Implement your form acceptance logic
  };

  const handleReject = () => {
    console.log("Form rejected");
    // Generate a new form or go back
  };

  const handleModify = (modifiedResponse: AIFormGenerationResponse) => {
    console.log("Form modification requested:", modifiedResponse);
    // Open modification interface
  };

  return (
    <AIFormPreview
      response={response}
      onAccept={handleAccept}
      onReject={handleReject}
      onModify={handleModify}
    />
  );
}
```

## 🎨 Advanced Configuration

### Domain-Specific Context

```tsx
import { getDomainContext } from "el-form-ai";

const ecommerceContext = getDomainContext("e-commerce");
console.log(ecommerceContext);
// {
//   commonFields: ['email', 'firstName', 'lastName', 'address', 'city', 'zipCode', 'phone'],
//   validationRules: { email: 'Email format validation', ... },
//   styling: { theme: 'professional', colors: 'blue' }
// }
```

### Debounced AI Validation

```tsx
import { useAIValidationDebounced } from "el-form-ai";

function MyFormWithDebouncing() {
  const { validateWithAIDebounced } = useAIValidationDebounced(
    { endpoint: "http://localhost:3000" },
    1000 // 1 second delay
  );

  const handleFieldChange = (fieldName: string, value: any) => {
    // This will debounce AI validation calls
    validateWithAIDebounced({
      fieldName,
      value,
      context: {
        allValues: {
          /* current form values */
        },
        fieldType: "text",
      },
    });
  };

  return (
    <div>
      <input
        onChange={(e) => handleFieldChange("email", e.target.value)}
        placeholder="Email"
      />
    </div>
  );
}
```

## 🔧 API Reference

### Components

- **`AIFormBuilder`**: Interactive form builder with natural language input
- **`SmartAutoForm`**: Enhanced AutoForm with AI capabilities
- **`AIFormPreview`**: Preview and approve AI-generated forms

### Hooks

- **`useAIFormBuilder`**: Generate and enhance forms with AI
- **`useAIValidation`**: AI-powered validation and error enhancement
- **`useAIValidationDebounced`**: Debounced version of AI validation

### Utilities

- **`generateFormDescription`**: Convert existing forms to natural language
- **`validateAIFormResponse`**: Validate AI-generated form configurations
- **`sanitizeAIText`**: Sanitize AI-generated text for security
- **`getDomainContext`**: Get domain-specific form context

## 🔒 Security Considerations

- All AI-generated content is sanitized before rendering
- Schema validation ensures type safety
- MCP communication is authenticated when API keys are provided
- No sensitive data is sent to AI services by default

## 🚀 MCP Server Requirements

Your MCP server should implement these endpoints:

- `POST /api/mcp/generate-form` - Form generation
- `POST /api/mcp/enhance-field` - Field enhancement
- `POST /api/mcp/validate` - AI validation
- `POST /api/mcp/enhance-error` - Error message enhancement

## 📖 Examples

See the `examples/` directory for complete implementation examples including:

- Basic AI form generation
- Advanced validation scenarios
- Custom MCP server implementation
- Integration with existing forms

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

MIT License - see LICENSE file for details.

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock AI responses for different form types
const MOCK_FORMS = {
  "customer feedback": {
    schema: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" },
        rating: { type: "number", minimum: 1, maximum: 5 },
        comments: { type: "string" },
      },
      required: ["name", "email", "rating"],
    },
    fields: [
      { name: "name", label: "Full Name", type: "text", colSpan: 12 },
      { name: "email", label: "Email Address", type: "email", colSpan: 12 },
      { name: "rating", label: "Rating (1-5)", type: "number", colSpan: 6 },
      {
        name: "comments",
        label: "Additional Comments",
        type: "textarea",
        colSpan: 12,
      },
    ],
    formProps: { layout: "grid", columns: 12 },
    suggestions: {
      title: "Customer Feedback Form",
      description:
        "A simple form to collect customer feedback with rating and comments",
      layout: "grid",
    },
  },
  "job application": {
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string", minLength: 1 },
        lastName: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" },
        phone: { type: "string", minLength: 10 },
        position: { type: "string", minLength: 1 },
        experience: { type: "string", minLength: 1 },
      },
      required: ["firstName", "lastName", "email", "phone", "position"],
    },
    fields: [
      { name: "firstName", label: "First Name", type: "text", colSpan: 6 },
      { name: "lastName", label: "Last Name", type: "text", colSpan: 6 },
      { name: "email", label: "Email Address", type: "email", colSpan: 6 },
      { name: "phone", label: "Phone Number", type: "text", colSpan: 6 },
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
    suggestions: {
      title: "Job Application Form",
      description:
        "Professional job application form with essential candidate information",
      layout: "grid",
    },
  },
  contact: {
    schema: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" },
        subject: { type: "string", minLength: 1 },
        message: { type: "string", minLength: 10 },
      },
      required: ["name", "email", "subject", "message"],
    },
    fields: [
      { name: "name", label: "Your Name", type: "text", colSpan: 6 },
      { name: "email", label: "Email Address", type: "email", colSpan: 6 },
      { name: "subject", label: "Subject", type: "text", colSpan: 12 },
      { name: "message", label: "Message", type: "textarea", colSpan: 12 },
    ],
    formProps: { layout: "grid", columns: 12 },
    suggestions: {
      title: "Contact Form",
      description: "Simple contact form for general inquiries",
      layout: "grid",
    },
  },
};

// Helper function to find matching form template
function findFormTemplate(description) {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes("feedback") || lowerDesc.includes("rating")) {
    return MOCK_FORMS["customer feedback"];
  }
  if (
    lowerDesc.includes("job") ||
    lowerDesc.includes("application") ||
    lowerDesc.includes("career")
  ) {
    return MOCK_FORMS["job application"];
  }
  if (
    lowerDesc.includes("contact") ||
    lowerDesc.includes("inquiry") ||
    lowerDesc.includes("message")
  ) {
    return MOCK_FORMS["contact"];
  }

  // Default to contact form
  return MOCK_FORMS["contact"];
}

// Helper function to simulate AI processing delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// MCP API Endpoints

// Generate form from description
app.post("/api/mcp/generate-form", async (req, res) => {
  try {
    const {
      prompt,
      model = "claude-3-sonnet",
      maxTokens = 2000,
      temperature = 0.3,
    } = req.body;

    console.log(
      `🤖 Generating form with ${model}:`,
      prompt.substring(0, 100) + "..."
    );

    // Simulate AI processing time
    await delay(1000 + Math.random() * 2000);

    // Extract description from prompt
    const descriptionMatch = prompt.match(/Description: (.*?)(?:\n|Context:)/s);
    const description = descriptionMatch
      ? descriptionMatch[1].trim()
      : "contact form";

    // Find matching template
    const template = findFormTemplate(description);

    res.json({
      success: true,
      schema: JSON.stringify(template.schema),
      fields: template.fields,
      formProps: template.formProps,
      suggestions: {
        ...template.suggestions,
        aiGenerated: true,
        model,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Form generation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate form",
      message: error.message,
    });
  }
});

// Enhance field configuration
app.post("/api/mcp/enhance-field", async (req, res) => {
  try {
    const { prompt, model = "claude-3-sonnet" } = req.body;

    console.log(
      `🔧 Enhancing field with ${model}:`,
      prompt.substring(0, 100) + "..."
    );

    // Simulate AI processing time
    await delay(500 + Math.random() * 1000);

    // Mock field enhancement response
    res.json({
      success: true,
      enhancedConfig: {
        placeholder: "AI-enhanced placeholder text",
        helpText: "AI-generated help text for better user experience",
      },
      suggestions: [
        "Consider adding input validation",
        "Improve placeholder text for clarity",
        "Add accessibility attributes",
      ],
      validationRules: null,
    });
  } catch (error) {
    console.error("Field enhancement error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to enhance field",
      message: error.message,
    });
  }
});

// AI validation
app.post("/api/mcp/validate", async (req, res) => {
  try {
    const { prompt, model = "claude-3-sonnet" } = req.body;

    console.log(
      `🔍 AI validation with ${model}:`,
      prompt.substring(0, 100) + "..."
    );

    // Simulate AI processing time
    await delay(300 + Math.random() * 700);

    // Extract field info from prompt
    const fieldMatch = prompt.match(/Field: (\w+)/);
    const valueMatch = prompt.match(/Value: (.*?)(?:\n|Field Type:)/s);

    const fieldName = fieldMatch ? fieldMatch[1] : "unknown";
    const value = valueMatch ? valueMatch[1].trim() : "";

    // Simple validation logic
    let isValid = true;
    const errors = [];
    const suggestions = [];

    if (fieldName === "email" && value && !value.includes("@")) {
      isValid = false;
      errors.push("Email format appears invalid");
      suggestions.push("Please enter a valid email address with @ symbol");
    }

    if (fieldName === "phone" && value && value.length < 10) {
      isValid = false;
      errors.push("Phone number appears too short");
      suggestions.push("Please enter a complete phone number");
    }

    res.json({
      success: true,
      isValid,
      errors,
      suggestions,
      confidence: 0.85,
    });
  } catch (error) {
    console.error("AI validation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate field",
      message: error.message,
    });
  }
});

// Enhance error messages
app.post("/api/mcp/enhance-error", async (req, res) => {
  try {
    const { prompt, model = "claude-3-sonnet" } = req.body;

    console.log(
      `💬 Enhancing error with ${model}:`,
      prompt.substring(0, 100) + "..."
    );

    // Simulate AI processing time
    await delay(200 + Math.random() * 500);

    // Extract original error from prompt
    const errorMatch = prompt.match(
      /Original Error: (.*?)(?:\n|Field Value:)/s
    );
    const originalError = errorMatch
      ? errorMatch[1].trim()
      : "Validation error";

    // Enhance error message
    const enhancedMessage = `✨ ${originalError} - Let me help you fix this!`;

    res.json({
      success: true,
      enhancedMessage,
      suggestions: [
        "Double-check your input format",
        "Try a different value",
        "Contact support if you need help",
      ],
      helpLinks: [
        {
          text: "Form Help Guide",
          url: "/help/forms",
        },
      ],
    });
  } catch (error) {
    console.error("Error enhancement error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to enhance error",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API info endpoint
app.get("/api/info", (req, res) => {
  res.json({
    name: "El-Form MCP Server",
    version: "1.0.0",
    description: "Mock MCP server for el-form AI integration testing",
    endpoints: [
      "POST /api/mcp/generate-form - Generate forms from descriptions",
      "POST /api/mcp/enhance-field - Enhance field configurations",
      "POST /api/mcp/validate - AI-powered field validation",
      "POST /api/mcp/enhance-error - Enhance error messages",
    ],
    availableTemplates: Object.keys(MOCK_FORMS),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 El-Form MCP Server running on port ${PORT}`);
  console.log(`📚 API Info: http://localhost:${PORT}/api/info`);
  console.log(`💓 Health Check: http://localhost:${PORT}/health`);
  console.log(
    `🤖 Available form templates: ${Object.keys(MOCK_FORMS).join(", ")}`
  );
});

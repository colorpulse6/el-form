# El-Form MCP Server Example

A mock Model Context Protocol (MCP) server for testing el-form AI integration features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or start with auto-reload for development
npm run dev
```

The server will start on `http://localhost:3000` by default.

## 📡 API Endpoints

### Health Check

```
GET /health
```

Returns server status and health information.

### API Information

```
GET /api/info
```

Returns information about available endpoints and form templates.

### Generate Form

```
POST /api/mcp/generate-form
```

**Request Body:**

```json
{
  "prompt": "Generate a React form configuration based on the following requirements:\n\nDescription: Create a customer feedback form with name, email, rating, and comments\n\nContext:\n- Domain: general\n- User Type: customer",
  "model": "claude-3-sonnet",
  "maxTokens": 2000,
  "temperature": 0.3
}
```

**Response:**

```json
{
  "success": true,
  "schema": "{\"type\":\"object\",\"properties\":{...}}",
  "fields": [
    {
      "name": "name",
      "label": "Full Name",
      "type": "text",
      "colSpan": 12
    }
  ],
  "formProps": {
    "layout": "grid",
    "columns": 12
  },
  "suggestions": {
    "title": "Customer Feedback Form",
    "description": "A simple form to collect customer feedback",
    "layout": "grid"
  }
}
```

### Enhance Field

```
POST /api/mcp/enhance-field
```

Provides AI-powered suggestions for improving field configurations.

### Validate Field

```
POST /api/mcp/validate
```

Performs AI-powered validation beyond basic schema rules.

### Enhance Error

```
POST /api/mcp/enhance-error
```

Converts technical error messages into user-friendly ones with suggestions.

## 🎯 Available Form Templates

The mock server includes pre-built templates for:

- **Customer Feedback** - Forms with ratings and comment fields
- **Job Application** - Professional application forms
- **Contact Form** - Basic contact and inquiry forms

## 🧪 Testing with El-Form AI

### 1. Start the MCP Server

```bash
cd examples/mcp-server
npm install
npm start
```

### 2. Configure Your React App

```typescript
import { MCPConfig } from "el-form-ai";

const mcpConfig: MCPConfig = {
  endpoint: "http://localhost:3000",
  model: "claude-3-sonnet",
  maxTokens: 2000,
  temperature: 0.3,
};
```

### 3. Use AI Components

```tsx
import { AIFormBuilder, SmartAutoForm } from "el-form-ai";

function MyApp() {
  return (
    <div>
      <AIFormBuilder
        onFormGenerated={(response) => console.log(response)}
        mcpConfig={mcpConfig}
      />

      <SmartAutoForm
        aiDescription="Create a user registration form"
        mcpConfig={mcpConfig}
        onSubmit={(data) => console.log(data)}
      />
    </div>
  );
}
```

## 🔧 Customization

### Adding New Form Templates

Edit `server.js` and add new templates to the `MOCK_FORMS` object:

```javascript
const MOCK_FORMS = {
  // ... existing templates
  "custom-form": {
    schema: {
      type: "object",
      properties: {
        // Define your schema
      },
    },
    fields: [
      // Define your fields
    ],
    formProps: {
      layout: "grid",
      columns: 12,
    },
    suggestions: {
      title: "Custom Form",
      description: "Your custom form description",
    },
  },
};
```

### Modifying AI Responses

The server uses simple keyword matching in the `findFormTemplate` function. You can enhance this logic to provide more sophisticated template selection.

### Adding Authentication

For production use, add API key authentication:

```javascript
app.use("/api/mcp", (req, res, next) => {
  const apiKey = req.headers["authorization"]?.replace("Bearer ", "");

  if (!apiKey || apiKey !== process.env.MCP_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
});
```

## 🐛 Debugging

### Enable Debug Logging

```bash
DEBUG=* npm start
```

### Check Server Logs

The server logs all AI requests with truncated prompts for debugging.

### Test Individual Endpoints

Use curl or Postman to test endpoints directly:

```bash
curl -X POST http://localhost:3000/api/mcp/generate-form \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a contact form", "model": "claude-3-sonnet"}'
```

## 🚀 Production Deployment

### Environment Variables

```bash
PORT=3000
MCP_API_KEY=your-secret-key
NODE_ENV=production
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Notes

- This is a **mock server** for development and testing
- Real AI integration would connect to actual LLM services
- Response times are artificially delayed to simulate real AI processing
- Form templates are predefined and keyword-matched
- For production, implement proper error handling, rate limiting, and authentication

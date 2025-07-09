# 🧪 Manual Testing Guide for el-form-ai

This guide will help you manually test all AI features in the el-form library.

## 🚀 Quick Start

### Step 1: Start the Mock MCP Server

```bash
# Terminal 1: Start the AI backend
cd examples/mcp-server
pnpm install
pnpm start
```

The server will start on `http://localhost:3000` and provide mock AI responses.

### Step 2: Start the React Development Server

```bash
# Terminal 2: Start the frontend
pnpm dev
```

Visit `http://localhost:5173` to see the demo interface.

## 🎯 Testing Scenarios

### 1. AI Form Builder

**Location**: Top of the demo page - "🤖 AI Form Builder" tab

**Test Cases:**

- **Basic Generation**: Type "Create a contact form with name, email, and phone"
- **Complex Generation**: Type "Create an e-commerce checkout form with billing address, payment method, and order notes"
- **Domain-Specific**: Type "Create a patient registration form for a healthcare clinic"

**Expected Results:**

- Form generates with appropriate fields
- Validation rules are applied
- Styling matches the requested domain

### 2. Smart AutoForm Enhancement

**Location**: "Smart AutoForm" tab

**Test Cases:**

- **Field Suggestions**: Enable "Field Suggestions" and interact with the form
- **AI Validation**: Fill out fields and see enhanced validation messages
- **Progressive Enhancement**: Watch form improve as you interact with it

**Expected Results:**

- Real-time suggestions appear
- Better error messages show up
- Form gets smarter over time

### 3. AI Form Preview

**Location**: "AI Form Preview" tab

**Test Cases:**

- **Form Approval**: Generate a form and approve it
- **Form Rejection**: Generate a form and reject it
- **Form Modification**: Request modifications to generated forms

**Expected Results:**

- Preview shows generated form accurately
- Actions work as expected
- Modifications are reflected

## 🔧 Advanced Testing

### Testing with Different MCP Servers

1. **Real AI Integration** (requires API keys):

   ```typescript
   const mcpConfig = {
     endpoint: "https://your-ai-api.com",
     apiKey: "your-api-key",
     model: "claude-3-sonnet",
   };
   ```

2. **Custom Mock Responses**:
   Edit `examples/mcp-server/server.js` to test specific scenarios.

### Testing Error Handling

1. **Server Offline**: Stop the MCP server and test error states
2. **Invalid Responses**: Modify server to return malformed data
3. **Network Issues**: Use browser dev tools to simulate network failures

### Performance Testing

1. **Large Forms**: Generate forms with 20+ fields
2. **Rapid Requests**: Make multiple AI requests quickly
3. **Memory Usage**: Monitor browser memory with large forms

## 🐛 Debugging

### Common Issues

1. **"Cannot connect to MCP server"**

   - Ensure MCP server is running on port 3000
   - Check browser console for CORS errors

2. **"AI generation failed"**

   - Check MCP server logs
   - Verify request format in Network tab

3. **Form not rendering**
   - Check browser console for Zod validation errors
   - Verify schema format from AI response

### Debug Tools

1. **Browser DevTools**:

   - Network tab: Check AI API calls
   - Console: View detailed error messages
   - React DevTools: Inspect component state

2. **MCP Server Logs**:
   ```bash
   cd examples/mcp-server
   pnpm dev  # Shows detailed logs
   ```

## 📊 Test Checklist

### Core AI Features

- [ ] AI form generation from natural language
- [ ] Field suggestions and enhancements
- [ ] AI-powered validation
- [ ] Enhanced error messages
- [ ] Domain-specific optimizations
- [ ] Form preview and approval

### React Integration

- [ ] Components render without errors
- [ ] Hooks work correctly
- [ ] State management is stable
- [ ] TypeScript types are correct

### Error Handling

- [ ] Graceful degradation when AI is offline
- [ ] User-friendly error messages
- [ ] Fallback to standard forms
- [ ] Recovery from network issues

### Performance

- [ ] Fast AI response times (< 2 seconds)
- [ ] No memory leaks
- [ ] Smooth user interactions
- [ ] Efficient re-renders

## 🎨 UI/UX Testing

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] ARIA labels are present
- [ ] Color contrast is adequate

### Mobile Testing

- [ ] Forms work on mobile devices
- [ ] Touch interactions are responsive
- [ ] Layout adapts to small screens
- [ ] Performance on slower devices

## 🔄 Integration Testing

### With Existing Forms

1. Add AI features to existing AutoForm components
2. Enhance existing useForm hooks with AI
3. Test backward compatibility

### With Different Schemas

1. Simple object schemas
2. Nested object schemas
3. Array schemas
4. Complex validation rules

## 📈 Monitoring

### Key Metrics to Watch

- AI response time
- Success rate of form generation
- User interaction patterns
- Error rates

### Logging

The MCP server logs all requests for debugging:

```bash
# View logs
cd examples/mcp-server
tail -f server.log
```

## 🎯 Success Criteria

A successful manual test should demonstrate:

- ✅ AI generates forms that match user intent
- ✅ Enhanced forms provide better UX than standard forms
- ✅ Error handling is robust and user-friendly
- ✅ Performance is acceptable for production use
- ✅ All features work across different browsers and devices

## 🚀 Next Steps

After manual testing:

1. **Automated Testing**: Write unit and integration tests
2. **Production Setup**: Configure real AI providers
3. **Performance Optimization**: Based on test results
4. **User Feedback**: Gather real user testing data

---

**Happy Testing!** 🎉

For issues or questions, check the [MCP AI Integration Guide](./MCP_AI_INTEGRATION_GUIDE.md).

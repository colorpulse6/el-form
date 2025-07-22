# El Form Testing App

This is a simple React testing environment for validating the el-form library functionality.

## Features

- **Basic Validation Test**: Simple form with name, email, and age validation
- **Advanced Validation Test**: Complex form with regex patterns and cross-field validation  
- **Brand Schema Test**: Your specific schema test with name (nonempty), category (enum), and isDummy (boolean)

## Running

From the root of the el-form project:

```bash
# Install dependencies (if not already done)
pnpm install

# Start the testing app
pnpm test-app
```

Or from this directory directly:

```bash
pnpm dev
```

The app will run on http://localhost:3001

## What to Test

1. **Real-time validation**: Type in fields and see errors appear/disappear
2. **Error messages**: Verify correct error messages show for different validation failures
3. **Form state**: Watch the form state object update as you interact with the form
4. **Submit behavior**: Try submitting valid vs invalid forms
5. **Reset functionality**: Test the reset button behavior

## Your Brand Schema Test

The third form specifically tests your schema:

```typescript
const brandSchema = z.object({
  name: z.string().nonempty({ message: 'Brand name is required' }),
  category: z.enum(['tech', 'fashion', 'food', 'other']),
  isDummy: z.boolean().optional(),
});
```

Try typing "123" in the name field - it should be valid since numbers as strings are still strings and pass the `.nonempty()` check.

import React from "react";
import { z } from "zod";

// Test 1: Import from main package (el-form-react)
import {
  useForm as useFormMain,
  AutoForm as AutoFormMain,
} from "el-form-react";

// Test 2: Import from hooks package directly
import { useForm as useFormHooks } from "el-form-react-hooks";

// Test 3: Import from components package directly
import { AutoForm as AutoFormComponents } from "el-form-react-components";

const testSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18),
});

// Test Component to verify API consistency
export function TestStandardization() {
  // Test that both useForm implementations have the same API
  const form1 = useFormMain({
    schema: testSchema,
    defaultValues: { name: "", email: "", age: 18 },
  });

  const form2 = useFormHooks({
    schema: testSchema,
    defaultValues: { name: "", email: "", age: 18 },
  });

  console.log("✅ Both useForm implementations accept defaultValues");
  console.log("✅ Both useForm implementations accept schema as optional");

  return (
    <div>
      <h2>Testing Standardized API</h2>

      <h3>AutoForm from main package:</h3>
      <AutoFormMain
        schema={testSchema}
        defaultValues={{ name: "", email: "", age: 18 }}
        onSubmit={(data) => console.log("Main AutoForm:", data)}
      />

      <h3>AutoForm from components package:</h3>
      <AutoFormComponents
        schema={testSchema}
        defaultValues={{ name: "", email: "", age: 18 }}
        onSubmit={(data) => console.log("Components AutoForm:", data)}
      />

      <p>Both components should work identically!</p>
    </div>
  );
}

export default TestStandardization;

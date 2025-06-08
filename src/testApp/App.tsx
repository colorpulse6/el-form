import { AutoFormDemo } from "./AutoFormDemo";
import { UseFormDemo } from "./UseFormDemo";
import { RenderPropDemo } from "./RenderPropDemo";
import { ErrorComponentDemo } from "./ErrorComponentDemo";
import { ApiComparison } from "./ApiComparison";
import { NestedArrayDemo } from "./NestedArrayDemo";
import { SimpleNestedTest } from "./SimpleNestedTest";
import { DirectArrayTest } from "./DirectArrayTest";

function App() {
  return (
    <div className="max-w-7xl mx-auto p-5 font-sans bg-gray-50 min-h-screen">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        El Form Library - Comprehensive Demo Suite
      </h1>

      <div className="space-y-12">
        {/* API #1: AutoForm Component (Declarative) */}
        <AutoFormDemo />

        {/* Direct useForm Hook Array Test */}
        <DirectArrayTest />

        {/* Simple Nested Test - Easier to Debug */}
        <SimpleNestedTest />

        {/* Complex Nested Arrays Demo */}
        <NestedArrayDemo />

        {/* API #2: useForm Hook (Manual Control) */}
        <UseFormDemo />

        {/* API #3: AutoForm with Render Props */}
        <RenderPropDemo />

        {/* Error Component Demo */}
        <ErrorComponentDemo />

        {/* API Comparison */}
        <ApiComparison />
      </div>
    </div>
  );
}

export default App;

import { AutoFormDemo } from "./autoForm/AutoFormDemo";
import { UseFormDemo } from "./useForm/UseFormDemo";
import { RenderPropDemo } from "./autoForm/RenderPropDemo";
import { ErrorComponentDemo } from "./autoForm/ErrorComponentDemo";
import { ApiComparison } from "./autoForm/ApiComparison";
import { NestedArrayDemo } from "./autoForm/NestedArrayDemo";
import { SimpleNestedTest } from "./autoForm/SimpleNestedTest";
import { DirectArrayTest } from "./useForm/DirectArrayTest";

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

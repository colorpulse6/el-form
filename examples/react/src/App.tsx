import { BasicValidationTest } from "./forms/BasicValidationTest";
import { FormHistoryTest } from "./forms/FormHistoryTest";
import FileUploadTest from "./forms/FileUploadTest";
import AdvancedFileValidationTest from "./forms/AdvancedFileValidationTest";
import ZodFileValidationTest from "./forms/ZodFileValidationTest";
import { useState } from "react";

function App() {
  const [currentTest, setCurrentTest] = useState<
    "basic" | "advanced" | "zod" | "validation" | "history"
  >("basic");

  return (
    <div className="container">
      <h1>🧪 El Form Testing Suite</h1>
      <p>Comprehensive testing of el-form features and capabilities</p>

      {/* Test selector */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setCurrentTest("basic")}
          className={`px-4 py-2 rounded text-sm ${
            currentTest === "basic"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          📁 Basic File Upload
        </button>
        <button
          onClick={() => setCurrentTest("advanced")}
          className={`px-4 py-2 rounded text-sm ${
            currentTest === "advanced"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          🔧 Advanced File Validation
        </button>
        <button
          onClick={() => setCurrentTest("zod")}
          className={`px-4 py-2 rounded text-sm ${
            currentTest === "zod"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          📋 Zod Schema Validation
        </button>
        <button
          onClick={() => setCurrentTest("validation")}
          className={`px-4 py-2 rounded text-sm ${
            currentTest === "validation"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          ✅ Basic Validation Test
        </button>
        <button
          onClick={() => setCurrentTest("history")}
          className={`px-4 py-2 rounded text-sm ${
            currentTest === "history"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          🕰️ Form History Test
        </button>
      </div>

      {currentTest === "basic" && <FileUploadTest />}
      {currentTest === "advanced" && <AdvancedFileValidationTest />}
      {currentTest === "zod" && <ZodFileValidationTest />}
      {currentTest === "validation" && <BasicValidationTest />}
      {currentTest === "history" && <FormHistoryTest />}
    </div>
  );
}

export default App;

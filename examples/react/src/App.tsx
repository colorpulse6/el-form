// import { BasicValidationTest } from "./forms/BasicValidationTest";
// import { FormHistoryTest } from "./forms/FormHistoryTest";
import FileUploadTest from "./forms/FileUploadTest";
import AdvancedFileValidationTest from "./forms/AdvancedFileValidationTest";
import { useState } from "react";

function App() {
  const [currentTest, setCurrentTest] = useState<"basic" | "advanced">("basic");

  return (
    <div className="container">
      <h1>🧪 El Form File Upload Testing</h1>
      <p>Testing file upload capabilities and validation</p>

      {/* Test selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setCurrentTest("basic")}
          className={`px-4 py-2 rounded ${
            currentTest === "basic"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Basic File Upload
        </button>
        <button
          onClick={() => setCurrentTest("advanced")}
          className={`px-4 py-2 rounded ${
            currentTest === "advanced"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Advanced File Validation
        </button>
      </div>

      {currentTest === "basic" && <FileUploadTest />}
      {currentTest === "advanced" && <AdvancedFileValidationTest />}
    </div>
  );
}

export default App;

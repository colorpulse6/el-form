import { BasicValidationTest } from "./forms/BasicValidationTest";
import { FormHistoryTest } from "./forms/FormHistoryTest";
import FileUploadTest from "./forms/FileUploadTest";
import AdvancedFileValidationTest from "./forms/AdvancedFileValidationTest";
import ZodFileValidationTest from "./forms/ZodFileValidationTest";
import { DiscriminatedUnionForm } from "./forms/DiscriminatedUnionForm";
import { AutoDiscriminatedUnionForm } from "./forms/AutoDiscriminatedUnionForm";
import { useState } from "react";
import FormSwitchFieldExample from "./tests/FormSwitch_Field_Example";
import FormSwitchSelectExample from "./tests/FormSwitch_Select_Example";
import FormSwitchBackCompatExample from "./tests/FormSwitch_BackCompat_Example";
import UseFieldRerenderTest from "./tests/UseField_Rerender_Test";

function App() {
  const [currentTest, setCurrentTest] = useState<
    | "basic"
    | "advanced"
    | "zod"
    | "validation"
    | "history"
    | "discriminated"
    | "auto-discriminated"
    | "form-switch-field"
    | "form-switch-select"
    | "form-switch-compat"
    | "use-field-rerender"
  >("basic");

  return (
    <div className="container">
      <h1>🧪 El Form Testing Suite</h1>
      <p>Comprehensive testing of el-form features and capabilities</p>

      {/* Test selector tabs */}
      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
        <nav style={{ display: "flex", gap: "32px" }}>
          <button
            onClick={() => setCurrentTest("basic")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "basic"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color: currentTest === "basic" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            📁 Basic File Upload
          </button>
          <button
            onClick={() => setCurrentTest("advanced")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "advanced"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color: currentTest === "advanced" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔧 Advanced File Validation
          </button>
          <button
            onClick={() => setCurrentTest("zod")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "zod"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color: currentTest === "zod" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            📋 Zod Schema Validation
          </button>
          <button
            onClick={() => setCurrentTest("validation")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "validation"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color: currentTest === "validation" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✅ Basic Validation Test
          </button>
          <button
            onClick={() => setCurrentTest("history")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "history"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color: currentTest === "history" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            🕰️ Form History Test
          </button>
          <button
            onClick={() => setCurrentTest("discriminated")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "discriminated"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color: currentTest === "discriminated" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔀 Discriminated Unions
          </button>
          <button
            onClick={() => setCurrentTest("auto-discriminated")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "auto-discriminated"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color:
                currentTest === "auto-discriminated" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            🤖 Auto Discriminated
          </button>
          <button
            onClick={() => setCurrentTest("form-switch-field")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "form-switch-field"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color:
                currentTest === "form-switch-field" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔀 FormSwitch (field)
          </button>
          <button
            onClick={() => setCurrentTest("form-switch-select")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "form-switch-select"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color:
                currentTest === "form-switch-select" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔍 FormSwitch (select)
          </button>
          <button
            onClick={() => setCurrentTest("form-switch-compat")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "form-switch-compat"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color:
                currentTest === "form-switch-compat" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ⚙️ FormSwitch (compat)
          </button>
          <button
            onClick={() => setCurrentTest("use-field-rerender")}
            style={{
              padding: "8px 4px",
              borderBottom:
                currentTest === "use-field-rerender"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color:
                currentTest === "use-field-rerender" ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ⚡ useField (rerender)
          </button>
        </nav>
      </div>

      {currentTest === "basic" && <FileUploadTest />}
      {currentTest === "advanced" && <AdvancedFileValidationTest />}
      {currentTest === "zod" && <ZodFileValidationTest />}
      {currentTest === "validation" && <BasicValidationTest />}
      {currentTest === "history" && <FormHistoryTest />}
      {currentTest === "discriminated" && <DiscriminatedUnionForm />}
      {currentTest === "auto-discriminated" && <AutoDiscriminatedUnionForm />}
      {currentTest === "form-switch-field" && <FormSwitchFieldExample />}
      {currentTest === "form-switch-select" && <FormSwitchSelectExample />}
      {currentTest === "form-switch-compat" && <FormSwitchBackCompatExample />}
      {currentTest === "use-field-rerender" && <UseFieldRerenderTest />}
    </div>
  );
}

export default App;

import { useState } from "react";
import { Layout, TestId } from "./components/layout";

// Form imports
import { BasicValidationTest } from "./forms/BasicValidationTest";
import { FormHistoryTest } from "./forms/FormHistoryTest";
import FileUploadTest from "./forms/FileUploadTest";
import AdvancedFileValidationTest from "./forms/AdvancedFileValidationTest";
import ZodFileValidationTest from "./forms/ZodFileValidationTest";
import { DiscriminatedUnionForm } from "./forms/DiscriminatedUnionForm";
import { AutoDiscriminatedUnionForm } from "./forms/AutoDiscriminatedUnionForm";
import { OnBlurValidationTest } from "./forms/OnBlurValidationTest";
import { GeneralAutoFormTest } from "./forms/GeneralAutoFormTest";
import { AsyncValidationTest } from "./forms/AsyncValidationTest";
import { ComplexArrayTest } from "./forms/ComplexArrayTest";
import FormSwitchFieldExample from "./tests/FormSwitch_Field_Example";
import FormSwitchSelectExample from "./tests/FormSwitch_Select_Example";
import FormSwitchBackCompatExample from "./tests/FormSwitch_BackCompat_Example";
import UseFieldRerenderTest from "./tests/UseField_Rerender_Test";

function App() {
  const [currentTest, setCurrentTest] = useState<TestId>("basic-validation");

  const renderTest = () => {
    switch (currentTest) {
      case "basic-validation":
        return <BasicValidationTest />;
      case "onblur-validation":
        return <OnBlurValidationTest />;
      case "async-validation":
        return <AsyncValidationTest />;
      case "file-upload":
        return <FileUploadTest />;
      case "advanced-file":
        return <AdvancedFileValidationTest />;
      case "zod-file":
        return <ZodFileValidationTest />;
      case "complex-arrays":
        return <ComplexArrayTest />;
      case "form-history":
        return <FormHistoryTest />;
      case "discriminated-union":
        return <DiscriminatedUnionForm />;
      case "auto-discriminated":
        return <AutoDiscriminatedUnionForm />;
      case "general-autoform":
        return <GeneralAutoFormTest />;
      case "form-switch-field":
        return <FormSwitchFieldExample />;
      case "form-switch-select":
        return <FormSwitchSelectExample />;
      case "form-switch-compat":
        return <FormSwitchBackCompatExample />;
      case "use-field-rerender":
        return <UseFieldRerenderTest />;
      default:
        return <BasicValidationTest />;
    }
  };

  return (
    <Layout currentTest={currentTest} onSelectTest={setCurrentTest}>
      {renderTest()}
    </Layout>
  );
}

export default App;

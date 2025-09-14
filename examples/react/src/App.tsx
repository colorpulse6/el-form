import { AutoDiscriminatedUnionForm } from "./forms/AutoDiscriminatedUnionForm";
import FormSwitchFieldExample from "./tests/FormSwitch_Field_Example";
import FormSwitchSelectExample from "./tests/FormSwitch_Select_Example";

function App() {
  return (
    <div className="container">
      <h1>🧪 El Form Testing Suite</h1>
      <p>Comprehensive testing of el-form features and capabilities</p>

      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
        <h2>AutoDiscriminatedUnionForm</h2>
        <AutoDiscriminatedUnionForm />
      </div>

      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
        <h2>FormSwitchFieldExample (refactored)</h2>
        <FormSwitchFieldExample />
      </div>

      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
        <h2>FormSwitchSelectExample (refactored)</h2>
        <FormSwitchSelectExample />
      </div>
    </div>
  );
}

export default App;

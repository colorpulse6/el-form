export function ApiComparison() {
  return (
    <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-lg">
      <h3 className="mb-4 text-xl font-semibold text-amber-800">
        📊 API Comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-cyan-700 font-medium mb-2">AutoForm Component</h4>
          <ul className="text-sm text-cyan-800 space-y-1 pl-4 list-disc">
            <li>Declarative - minimal code</li>
            <li>Automatic layout (grid/flex)</li>
            <li>Built-in styling</li>
            <li>Quick prototyping</li>
            <li>Less customization</li>
          </ul>

          <div className="mt-4 text-xs text-cyan-700">
            <strong>Best for:</strong>
            <ul className="mt-1 pl-4 space-y-0.5 list-disc">
              <li>Admin panels</li>
              <li>CRUD forms</li>
              <li>Rapid prototyping</li>
              <li>Consistent UI</li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-purple-700 font-medium mb-2">useForm Hook</h4>
          <ul className="text-sm text-purple-800 space-y-1 pl-4 list-disc">
            <li>Imperative - full control</li>
            <li>Custom layouts & styling</li>
            <li>Advanced field logic</li>
            <li>Maximum flexibility</li>
            <li>More code required</li>
          </ul>

          <div className="mt-4 text-xs text-purple-700">
            <strong>Best for:</strong>
            <ul className="mt-1 pl-4 space-y-0.5 list-disc">
              <li>Custom designs</li>
              <li>Complex validation</li>
              <li>Unique layouts</li>
              <li>Brand-specific UI</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

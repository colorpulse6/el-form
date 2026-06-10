import { useForm, FormProvider, useWatch } from "el-form-react-hooks";
import { Button, Card, FormSection } from "../../components/ui";

// Defaults are seeded to defined values (not undefined) so every watch panel
// renders parseable JSON for the sweep's readJsonTestId — `formatJson(undefined)`
// would render an empty <pre> and break JSON.parse.
type WatchValues = {
  first: string;
  last: string;
  nickname?: string;
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

// These read reactively via useWatch and MUST live inside a FormProvider.
function SingleWatch() {
  const first = useWatch<WatchValues, "first">("first");
  return (
    <pre data-testid="watch-single" className="text-xs">
      {formatJson(first)}
    </pre>
  );
}

function MultiWatch() {
  const pair = useWatch<WatchValues, "first" | "last">(["first", "last"]);
  return (
    <pre data-testid="watch-multi" className="text-xs">
      {formatJson(pair)}
    </pre>
  );
}

function AllWatch() {
  const all = useWatch<WatchValues>();
  return (
    <pre data-testid="watch-all" className="text-xs">
      {formatJson(all)}
    </pre>
  );
}

export function UseWatchLab() {
  const form = useForm<WatchValues>({
    defaultValues: { first: "", last: "" },
  });

  return (
    <div className="space-y-6" data-testid="use-watch-lab">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">useWatch Lab</h2>
        <p className="mt-1 text-sm text-gray-600">
          Reactive value subscriptions by path: single, multiple, and all values.
        </p>
      </div>

      <FormProvider form={form}>
        <FormSection title="Controls" variant="blue">
          <Button
            type="button"
            className="mr-2 mb-2"
            onClick={() => form.setValue("first", "Ada")}
          >
            Set First Ada
          </Button>
          <Button
            type="button"
            className="mr-2 mb-2"
            onClick={() => form.setValue("last", "Lovelace")}
          >
            Set Last Lovelace
          </Button>
          <Button
            type="button"
            className="mr-2 mb-2"
            onClick={() => form.setValue("nickname", "Countess")}
          >
            Set Nickname
          </Button>
        </FormSection>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              useWatch("first")
            </h3>
            <SingleWatch />
          </Card>
          <Card>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              useWatch(["first", "last"])
            </h3>
            <MultiWatch />
          </Card>
          <Card>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              useWatch()
            </h3>
            <AllWatch />
          </Card>
        </div>
      </FormProvider>
    </div>
  );
}

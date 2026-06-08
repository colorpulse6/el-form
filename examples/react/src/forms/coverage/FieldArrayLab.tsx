import { useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "el-form-react-hooks";
import { Button, Card, inputBaseClasses } from "../../components/ui";

type Data = {
  items: Array<{ id: string; label: string }>;
  tags: string[];
  team: Array<{ name: string; skills: Array<{ name: string }> }>;
};

type OperationLogEntry = {
  index: number;
  label: string;
};

const defaultValues: Data = {
  items: [
    { id: "domain-1", label: "alpha" },
    { id: "domain-2", label: "beta" },
  ],
  tags: ["tag-1"],
  team: [
    {
      name: "platform",
      skills: [{ name: "react" }],
    },
  ],
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

type OperationControls = {
  logOperation: (label: string) => void;
};

function ItemArrayControls({
  logOperation,
}: OperationControls) {
  const countersRef = useRef<Record<string, number>>({});
  const {
    fields,
    append,
    prepend,
    insert,
    remove,
    move,
    swap,
    update,
    replace,
  } = useFieldArray<Data, "items">({ name: "items", keyName: "_key" });
  const keyedFields = fields as ReadonlyArray<
    Data["items"][number] & { _key: string }
  >;
  const hasItems = keyedFields.length > 0;
  const canReorderItems = keyedFields.length > 1;

  const nextLabel = (prefix: string) => {
    const next = (countersRef.current[prefix] ?? 0) + 1;
    countersRef.current[prefix] = next;
    return `${prefix}-${next}`;
  };

  const appendItem = () => {
    const label = nextLabel("append");
    append({ id: `domain-${label}`, label });
    logOperation(`append item ${label}`);
  };

  const prependItem = () => {
    const label = nextLabel("prepend");
    prepend({ id: `domain-${label}`, label });
    logOperation(`prepend item ${label}`);
  };

  const insertItem = () => {
    const label = nextLabel("insert");
    const index = Math.min(1, keyedFields.length);
    insert(index, { id: `domain-${label}`, label });
    logOperation(`insert item ${label} at ${index}`);
  };

  const removeItem = () => {
    remove(0);
    logOperation("remove item at 0");
  };

  const moveItem = () => {
    const targetIndex = keyedFields.length - 1;
    move(0, targetIndex);
    logOperation(`move item 0 to ${targetIndex}`);
  };

  const swapItems = () => {
    swap(0, 1);
    logOperation("swap items 0 and 1");
  };

  const updateItem = () => {
    const label = nextLabel("update");
    update(0, { id: `domain-${label}`, label });
    logOperation(`update item 0 to ${label}`);
  };

  const replaceItems = () => {
    const label = nextLabel("replace");
    replace([
      { id: `domain-${label}-a`, label: `${label}-a` },
      { id: `domain-${label}-b`, label: `${label}-b` },
    ]);
    logOperation(`replace items with ${label}`);
  };

  const customKeyRows = keyedFields.map((field) => ({
    id: field.id,
    _key: field._key,
    label: field.label,
  }));

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Object Items</h3>
        </div>

        <div className="grid gap-3">
          {keyedFields.map((field, index) => (
            <div
              key={field._key}
              className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <label className="space-y-1 text-sm font-medium text-gray-700">
                <span>Domain id</span>
                <input
                  className={inputBaseClasses}
                  readOnly
                  value={field.id}
                  aria-label={`Item ${index} domain id`}
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                <span>Label</span>
                <input
                  className={inputBaseClasses}
                  readOnly
                  value={field.label}
                  aria-label={`Item ${index} label`}
                />
              </label>
              <div className="self-end rounded-md bg-white px-3 py-2 text-xs text-gray-600">
                field key: {field._key}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={appendItem}>
            Append Item
          </Button>
          <Button type="button" size="sm" onClick={prependItem}>
            Prepend Item
          </Button>
          <Button type="button" size="sm" onClick={insertItem}>
            Insert Item
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={removeItem}
            disabled={!hasItems}
          >
            Remove Item
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={moveItem}
            disabled={!canReorderItems}
          >
            Move Item
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={swapItems}
            disabled={!canReorderItems}
          >
            Swap Items
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={updateItem}
            disabled={!hasItems}
          >
            Update Item
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={replaceItems}>
            Replace Items
          </Button>
        </div>

        <StatePanel label="items fields" testId="items-fields-json" value={fields} />
        <CustomKeyCoverage rows={customKeyRows} />
      </div>
    </Card>
  );
}

function TagArrayControls({ logOperation }: OperationControls) {
  const countersRef = useRef<Record<string, number>>({});
  const { fields, append, remove } = useFieldArray<Data, "tags">({
    name: "tags",
  });
  const hasTags = fields.length > 0;

  const nextLabel = (prefix: string) => {
    const next = (countersRef.current[prefix] ?? 0) + 1;
    countersRef.current[prefix] = next;
    return `${prefix}-${next}`;
  };

  const appendTag = () => {
    const label = nextLabel("tag");
    append(label);
    logOperation(`append tag ${label}`);
  };

  const removeTag = () => {
    remove(0);
    logOperation("remove tag at 0");
  };

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Primitive Tags</h3>
        </div>

        <div className="grid gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <label className="space-y-1 text-sm font-medium text-gray-700">
                <span>Tag</span>
                <input
                  className={inputBaseClasses}
                  readOnly
                  value={field.value}
                  aria-label={`Tag ${index}`}
                />
              </label>
              <div className="self-end rounded-md bg-white px-3 py-2 text-xs text-gray-600">
                field id: {field.id}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={appendTag}>
            Append Tag
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={removeTag}
            disabled={!hasTags}
          >
            Remove Tag
          </Button>
        </div>
      </div>
    </Card>
  );
}

function NestedSkillArrayControls({ logOperation }: OperationControls) {
  const countersRef = useRef<Record<string, number>>({});
  const { fields, append, remove } = useFieldArray<Data, "team.0.skills">({
    name: "team.0.skills",
  });
  const hasNestedSkills = fields.length > 0;

  const nextLabel = (prefix: string) => {
    const next = (countersRef.current[prefix] ?? 0) + 1;
    countersRef.current[prefix] = next;
    return `${prefix}-${next}`;
  };

  const appendNestedSkill = () => {
    const label = nextLabel("skill");
    append({ name: label });
    logOperation(`append nested skill ${label}`);
  };

  const removeNestedSkill = () => {
    remove(0);
    logOperation("remove nested skill at 0");
  };

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nested Skills</h3>
        </div>

        <div className="grid gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <label className="space-y-1 text-sm font-medium text-gray-700">
                <span>Skill</span>
                <input
                  className={inputBaseClasses}
                  readOnly
                  value={field.name}
                  aria-label={`Nested skill ${index}`}
                />
              </label>
              <div className="self-end rounded-md bg-white px-3 py-2 text-xs text-gray-600">
                field id: {field.id}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={appendNestedSkill}>
            Append Nested Skill
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={removeNestedSkill}
            disabled={!hasNestedSkills}
          >
            Remove Nested Skill
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CustomKeyCoverage({
  rows,
}: {
  rows: Array<{ id: string; _key: string; label: string }>;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Custom Key Name</h3>
      </div>
      <StatePanel label="custom key rows" testId="custom-key-json" value={rows} />
    </div>
  );
}

function StatePanel({
  label,
  testId,
  value,
}: {
  label: string;
  testId: string;
  value: unknown;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <pre
        className="max-h-72 overflow-auto rounded-md border border-gray-200 bg-gray-950 p-3 text-xs text-gray-50"
        data-testid={testId}
      >
        {formatJson(value)}
      </pre>
    </div>
  );
}

export function FieldArrayLab() {
  const form = useForm<Data>({ defaultValues });
  const [operationLog, setOperationLog] = useState<OperationLogEntry[]>([]);
  const values = form.formState.values;
  const items = values.items ?? [];
  const tags = values.tags ?? [];
  const nestedSkills = values.team?.[0]?.skills ?? [];

  const logOperation = (label: string) => {
    setOperationLog((current) => [
      ...current,
      { index: current.length + 1, label },
    ]);
  };

  return (
    <div className="space-y-6" data-testid="field-array-lab">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Field Array Lab</h2>
      </div>

      <FormProvider form={form}>
        <div className="space-y-6">
          <ItemArrayControls logOperation={logOperation} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TagArrayControls logOperation={logOperation} />
            <NestedSkillArrayControls logOperation={logOperation} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <StatePanel label="items values" testId="items-json" value={items} />
            <StatePanel label="tags values" testId="tags-json" value={tags} />
            <StatePanel
              label="nested skills values"
              testId="nested-skills-json"
              value={nestedSkills}
            />
            <StatePanel
              label="operation log"
              testId="operation-log"
              value={operationLog}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
}

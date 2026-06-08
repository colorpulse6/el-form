import { useState } from "react";

export type TestId =
  | "basic-validation"
  | "onblur-validation"
  | "async-validation"
  | "file-upload"
  | "advanced-file"
  | "zod-file"
  | "complex-arrays"
  | "form-history"
  | "discriminated-union"
  | "auto-discriminated"
  | "general-autoform"
  | "form-switch-field"
  | "form-switch-select"
  | "form-switch-compat"
  | "use-field-rerender"
  | "form-controls-lab"
  | "field-array-lab"
  | "validation-adapters-lab"
  | "file-validators-lab"
  | "component-lab";

interface NavItem {
  id: TestId;
  label: string;
}

interface NavCategory {
  label: string;
  icon: string;
  items: NavItem[];
}

const navigation: NavCategory[] = [
  {
    label: "Validation",
    icon: "check-circle",
    items: [
      { id: "basic-validation", label: "Basic Validation" },
      { id: "onblur-validation", label: "OnBlur Validation" },
      { id: "async-validation", label: "Async Validation" },
    ],
  },
  {
    label: "File Uploads",
    icon: "upload",
    items: [
      { id: "file-upload", label: "Basic File Upload" },
      { id: "advanced-file", label: "Advanced File Validation" },
      { id: "zod-file", label: "Zod File Validation" },
    ],
  },
  {
    label: "Arrays",
    icon: "list",
    items: [
      { id: "complex-arrays", label: "Complex Arrays" },
    ],
  },
  {
    label: "History",
    icon: "clock",
    items: [
      { id: "form-history", label: "Form History" },
    ],
  },
  {
    label: "Discriminated Unions",
    icon: "git-branch",
    items: [
      { id: "discriminated-union", label: "Manual Discriminated" },
      { id: "auto-discriminated", label: "Auto Discriminated" },
    ],
  },
  {
    label: "AutoForm",
    icon: "wand",
    items: [
      { id: "general-autoform", label: "General AutoForm" },
    ],
  },
  {
    label: "FormSwitch",
    icon: "toggle",
    items: [
      { id: "form-switch-field", label: "Field Example" },
      { id: "form-switch-select", label: "Select Example" },
      { id: "form-switch-compat", label: "Back Compat" },
    ],
  },
  {
    label: "Hooks",
    icon: "code",
    items: [
      { id: "use-field-rerender", label: "useField Rerender" },
    ],
  },
  {
    label: "Coverage Labs",
    icon: "code",
    items: [
      { id: "form-controls-lab", label: "Form Controls Lab" },
      { id: "field-array-lab", label: "Field Array Lab" },
      { id: "validation-adapters-lab", label: "Validation Adapters Lab" },
      { id: "file-validators-lab", label: "File Validators Lab" },
      { id: "component-lab", label: "Component Lab" },
    ],
  },
];

interface SidebarProps {
  currentTest: TestId;
  onSelectTest: (id: TestId) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ currentTest, onSelectTest, collapsed = false, onToggleCollapse }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(navigation.map(c => c.label))
  );

  const toggleCategory = (label: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  if (collapsed) {
    return (
      <aside className="w-16 bg-gray-900 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-white mb-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {navigation.map((category) => (
          <div key={category.label} className="mb-2">
            <button
              onClick={() => {
                if (category.items.length === 1) {
                  onSelectTest(category.items[0].id);
                }
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
              title={category.label}
            >
              <CategoryIcon name={category.icon} />
            </button>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">El Form</h1>
          <p className="text-xs text-gray-400">Testing Suite</p>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((category) => (
          <div key={category.label} className="mb-2">
            <button
              onClick={() => toggleCategory(category.label)}
              className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-300 hover:bg-gray-800"
            >
              <span className="flex items-center gap-2">
                <CategoryIcon name={category.icon} />
                {category.label}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${expandedCategories.has(category.label) ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedCategories.has(category.label) && (
              <div className="mt-1">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectTest(item.id)}
                    className={`
                      w-full px-4 py-2 pl-10 text-left text-sm
                      transition-colors
                      ${currentTest === item.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }
                    `}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
        {navigation.reduce((acc, c) => acc + c.items.length, 0)} tests available
      </div>
    </aside>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const iconClass = "w-4 h-4";

  switch (name) {
    case "check-circle":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "upload":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      );
    case "list":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    case "clock":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "git-branch":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case "wand":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "toggle":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case "code":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    default:
      return <span className="w-4 h-4" />;
  }
}

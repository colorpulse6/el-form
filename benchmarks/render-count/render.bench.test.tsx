// Render-count benchmark: when you change ONE field in an N-field form, how many
// field components re-render? Lower = better subscription isolation.
//
// Honest framing: this compares CONTROLLED form models (where each field's value
// flows through React, which is what you need for controlled UI libraries,
// dynamic/derived UI, etc.). RHF's default `register` is UNCONTROLLED (the input
// is a native DOM node, so typing causes ~0 React re-renders) — a different
// tradeoff, measured separately below for context.
//
// Run: npm run bench:render   (from benchmarks/)

import { describe, it, expect } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import React from "react";
import {
  useForm as useElForm,
  FormProvider as ElProvider,
  useField as useElField,
  useFormSelector,
} from "el-form-react-hooks";
import { Formik, useField as useFormikField } from "formik";
import { useForm as useRHFForm, useController } from "react-hook-form";

const N = 20;
const names = Array.from({ length: N }, (_, i) => `f${i}`);
const defaults = Object.fromEntries(names.map((n) => [n, ""]));

// Per-run render tally, keyed by field name.
let renders = {};
const tally = (name) => {
  renders[name] = (renders[name] || 0) + 1;
};
const reset = () => {
  renders = {};
};
const rerendered = () => Object.values(renders).filter((c) => c > 0).length;

// ---------- el-form: selector isolation (useField) ----------
const ElField = React.memo(function ElField({ name }) {
  tally(name);
  const { value } = useElField(name);
  return <span data-name={name}>{String(value)}</span>;
});

// ---------- el-form: NAIVE (subscribe to all values) ----------
const ElNaiveField = React.memo(function ElNaiveField({ name }) {
  tally(name);
  const values = useFormSelector((s) => s.values); // whole-values slice
  return <span data-name={name}>{String(values[name])}</span>;
});

// ---------- Formik (controlled <Field>/useField) ----------
const FormikField = React.memo(function FormikField({ name }) {
  tally(name);
  const [field] = useFormikField(name);
  return <span data-name={name}>{String(field.value)}</span>;
});

// ---------- RHF controlled (useController) ----------
const RHFControlledField = React.memo(function RHFControlledField({ name, control }) {
  tally(name);
  const { field } = useController({ name, control, defaultValue: "" });
  return <span data-name={name}>{String(field.value)}</span>;
});

async function measure(renderUI, change) {
  cleanup(); // isolate from the previous library's render
  reset();
  render(renderUI());
  reset(); // ignore initial mount; count only re-renders caused by the change
  await act(async () => {
    await change();
  });
  const n = rerendered();
  cleanup();
  return n;
}

describe("render-count: change 1 field in a 20-field form", () => {
  it("reports re-rendered field count per library (lower = better isolation)", async () => {
    const results = {};
    const safe = async (label, fn) => {
      try {
        results[label] = await fn();
      } catch (e) {
        results[label] = `ERR: ${e.message}`;
      }
    };

    // el-form selector
    {
      let api;
      function App() {
        const form = useElForm({ defaultValues: defaults });
        api = form;
        return (
          <ElProvider form={form}>
            {names.map((n) => (
              <ElField key={n} name={n} />
            ))}
          </ElProvider>
        );
      }
      await safe("el-form (useField, controlled)", () =>
        measure(
          () => <App />,
          () => api.setValue("f0", "x")
        )
      );
    }

    // el-form naive (whole-values subscription)
    {
      let api;
      function App() {
        const form = useElForm({ defaultValues: defaults });
        api = form;
        return (
          <ElProvider form={form}>
            {names.map((n) => (
              <ElNaiveField key={n} name={n} />
            ))}
          </ElProvider>
        );
      }
      await safe("el-form NAIVE (whole-values selector)", () =>
        measure(
          () => <App />,
          () => api.setValue("f0", "x")
        )
      );
    }

    // Formik
    {
      let helpers;
      function Inner() {
        return (
          <>
            {names.map((n) => (
              <FormikField key={n} name={n} />
            ))}
          </>
        );
      }
      await safe("Formik (controlled Field)", () =>
        measure(
          () => (
            <Formik initialValues={defaults} onSubmit={() => {}}>
              {(f) => {
                helpers = f;
                return <Inner />;
              }}
            </Formik>
          ),
          () => helpers.setFieldValue("f0", "x")
        )
      );
    }

    // RHF controlled (useController)
    {
      let api;
      function App() {
        const form = useRHFForm({ defaultValues: defaults });
        api = form;
        return (
          <>
            {names.map((n) => (
              <RHFControlledField key={n} name={n} control={form.control} />
            ))}
          </>
        );
      }
      await safe("RHF (useController, controlled)", () =>
        measure(
          () => <App />,
          () => api.setValue("f0", "x")
        )
      );
    }

    // eslint-disable-next-line no-console
    console.log(
      `\nrender-count — change 1 of ${N} fields (field components re-rendered):\n` +
        Object.entries(results)
          .sort((a, b) => a[1] - b[1])
          .map(([k, v]) => `  ${String(v).padStart(3)} / ${N}   ${k}`)
          .join("\n") +
        `\n\n(RHF default register is uncontrolled → ~0 React re-renders, a different model.)\n`
    );

    // The selector model must isolate: changing one field re-renders ~1 field,
    // while the naive whole-state subscription re-renders all of them.
    expect(results["el-form (useField, controlled)"]).toBeLessThanOrEqual(2);
    expect(results["el-form NAIVE (whole-values selector)"]).toBe(N);
    expect(results["el-form (useField, controlled)"]).toBeLessThan(
      results["Formik (controlled Field)"]
    );
  });
});

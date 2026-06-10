import React from "react";
import Layout from "@theme/Layout";
import { Playground } from "../components/Playground";

export default function PlaygroundPage(): JSX.Element {
  return (
    <Layout
      title="Playground"
      description="Edit el-form examples live — useForm, AutoForm, validation, and field arrays — and see the form update."
    >
      <main className="container margin-vert--lg">
        <h1>Playground</h1>
        <p>
          Edit a real el-form example and watch the form update. Pick one from
          the list, tweak the schema or code, and use “Open in CodeSandbox” to
          fork it.
        </p>
        <Playground />
      </main>
    </Layout>
  );
}

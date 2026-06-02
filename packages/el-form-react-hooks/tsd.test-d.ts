import { expectType, expectError } from "tsd";
import { useForm, useFieldArray } from "./src";

// Compile-time assertions for Path and register typings
// Intentionally in module scope so tsd executes checks
{
  const form = useForm<{
    prefs: { notify: boolean };
    files: File[];
    user: { name: string; age?: number };
    skills: { name: string }[];
  }>({
    defaultValues: {
      prefs: { notify: false },
      files: [],
      user: { name: "" },
      skills: [],
    },
  });

  // boolean path ⇒ checked
  const chk = form.register("prefs.notify");
  expectType<boolean>(chk.checked);

  // files ⇒ files prop
  const f = form.register("files");
  expectType<FileList | File | File[] | null>(f.files);

  // string ⇒ value
  const name = form.register("user.name");
  expectType<string>(name.value);

  // dot-number array indexing supported
  const skillName = form.register("skills.0.name");
  expectType<string>(skillName.value);

  // bracket indexing supported
  const skillName2 = form.register("skills[0].name");
  expectType<string>(skillName2.value);

  // invalid path should error (which it does)
  // form.register("user.nonexistent");
}

{
  const form = useForm<{ email: string; age: number; user: { name: string } }>({
    defaultValues: { email: "", age: 0, user: { name: "" } },
  });

  // valid paths typed correctly
  expectType<string>(form.register("email").value);
  expectType<string>(form.register("user.name").value);

  // setValue rejects unknown path
  expectError(form.setValue("nope", "x"));

  // setValue rejects wrong value type for a known path
  expectError(form.setValue("age", "not-a-number"));

  // watch rejects unknown path
  expectError(form.watch("nope"));

  // handleSubmit data is exactly T
  form.handleSubmit((data) => {
    expectType<{ email: string; age: number; user: { name: string } }>(data);
  });
}

{
  // object-item array: fields rows are TItem & { id: string }
  const fa = useFieldArray<{ skills: { name: string }[]; tags: string[] }, "skills">({ name: "skills" });
  expectType<string>(fa.fields[0].id);
  expectType<string>(fa.fields[0].name);
  fa.append({ name: "x" });
  expectError(fa.append({ wrong: 1 }));

  // primitive-item array ⇒ { id, value }
  const tagFa = useFieldArray<{ skills: { name: string }[]; tags: string[] }, "tags">({ name: "tags" });
  expectType<string>(tagFa.fields[0].id);
  expectType<string>(tagFa.fields[0].value);

  // name restricted to array-valued paths: a non-array path must be a type error
  expectError(
    useFieldArray<{ a: string; list: number[] }, "a">({ name: "a" })
  );
}

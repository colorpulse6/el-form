import { expectType } from "tsd";
import { useForm } from "./src";

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

  // invalid path should error
  form.register("user.nonexistent");
}

// Example showing useField re-render optimization
import { useRef } from "react";
import { useForm, FormProvider, useField } from "el-form-react-hooks";

export default function UseFieldRerenderTest() {
  const form = useForm<{ a: string; b: string }>({
    defaultValues: { a: "A", b: "B" },
  });
  const aRenders = useRef(0);
  const bRenders = useRef(0);

  function AField() {
    aRenders.current += 1;
    const { value } = useField<any, any>("a" as any);
    const fieldPropsA = form.register("a");
    return (
      <div>
        <div aria-label="a-count">{aRenders.current}</div>
        <input
          aria-label="a"
          value={(fieldPropsA as any).value}
          onChange={(fieldPropsA as any).onChange}
        />
        <div aria-label="a-value">{String(value)}</div>
      </div>
    );
  }

  function BField() {
    bRenders.current += 1;
    const fieldPropsB = form.register("b");
    return (
      <div>
        <div aria-label="b-count">{bRenders.current}</div>
        <input
          aria-label="b"
          value={(fieldPropsB as any).value}
          onChange={(fieldPropsB as any).onChange}
        />
      </div>
    );
  }

  return (
    <FormProvider form={form}>
      <div>
        <AField />
        <BField />
      </div>
    </FormProvider>
  );
}

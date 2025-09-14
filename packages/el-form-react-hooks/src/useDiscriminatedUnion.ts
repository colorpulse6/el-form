import { useEffect, useRef } from "react";
import { z } from "zod";
import { getDiscriminatedUnionInfo, getLiteralValue } from "el-form-core";
import { useFormWatch } from "./useFormWatch";
import type { UseFormReturn, Path, PathValue } from "./types";

export function useDiscriminatedUnion<
  T extends z.ZodDiscriminatedUnion<any, any>
>(schema: T, form: UseFormReturn<z.infer<T>>) {
  const duInfo = getDiscriminatedUnionInfo(schema);

  if (!duInfo) {
    return null;
  }

  const { discriminator, options } = duInfo;
  const discriminatorValue = useFormWatch(discriminator as Path<z.infer<T>>);
  const previousDiscriminatorValue = useRef(discriminatorValue);
  const { setValue } = form;

  useEffect(() => {
    if (
      previousDiscriminatorValue.current &&
      previousDiscriminatorValue.current !== discriminatorValue
    ) {
      const previousOption = options.find(
        (o: any) =>
          getLiteralValue(o.shape[discriminator]) ===
          previousDiscriminatorValue.current
      );
      if (previousOption) {
        const fieldsToReset = Object.keys(previousOption.shape).filter(
          (f) => f !== discriminator
        );
        fieldsToReset.forEach((field) => {
          setValue(field as Path<z.infer<T>>, null as PathValue<z.infer<T>, Path<z.infer<T>>>);
        });
      }
    }
    previousDiscriminatorValue.current = discriminatorValue;
  }, [discriminator, discriminatorValue, options, setValue]);

  return discriminatorValue;
}

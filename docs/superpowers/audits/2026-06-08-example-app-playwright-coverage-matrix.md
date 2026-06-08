# Example App Playwright Coverage Matrix

| Feature | Package | Browser Route | Sweep Scenario | Unit/Type Fallback | Status |
|---------|---------|---------------|----------------|--------------------|--------|
| register text/email/number/checkbox/select/textarea/file | hooks | existing demos + form-controls-lab | type/change/submit visible values | register.runtime.test.tsx, tsd | planned |
| handleSubmit onValid/onError | hooks | basic-validation + form-controls-lab | invalid blocks, valid payload visible | submit.runtime.test.tsx | planned |
| submit/submitAsync | hooks | form-controls-lab | buttons produce visible success/error JSON | submit.runtime.test.tsx | planned |
| setValue/updateValue/setValues | hooks | form-controls-lab | buttons mutate visible JSON | setValue.runtime.test.tsx | planned |
| reset/resetValues/resetField | hooks | form-controls-lab + form-history | reset buttons restore visible values | reset.runtime.test.tsx | planned |
| watch one/all/multiple | hooks | basic-validation + form-controls-lab | watched panels and conditional fields update | unit tests | planned |
| state/touched/error queries | hooks | form-controls-lab | query panel updates after actions | state-tracking/errors tests | planned |
| trigger/setError/clearErrors | hooks | form-controls-lab | manual errors appear/clear, trigger validates | errors.runtime.test.tsx | planned |
| setFocus/shouldFocusError | hooks | form-controls-lab | active element label changes | focusError.runtime.test.tsx | planned |
| addArrayItem/removeArrayItem | hooks | complex-arrays | visible counts change | array-ops.runtime.test.tsx | planned |
| useFieldArray operations | hooks | field-array-lab | append/prepend/insert/remove/move/swap/update/replace | useFieldArray.runtime.test.tsx, tsd | planned |
| FormProvider/useFormContext/useFormState/useFormSelector/useField | hooks | component-lab + use-field-rerender | context fields and render counters update | selector.runtime.test.tsx | planned |
| snapshots/change tracking | hooks | form-history | snapshot/restore/reset visible state | snapshots.runtime.test.tsx | planned |
| file methods/previews/info | hooks/core | file-upload + file-validators-lab | upload/add/remove/clear visible state | fileMethods.runtime.test.tsx | planned |
| Zod validation | core/hooks/components | existing validation demos + adapters lab | real Zod error/success visible | adapter/core tests | planned |
| Standard Schema/custom/function validators | core/hooks | validation-adapters-lab | fixture branches visible | adapters.test.ts | planned |
| Yup/Valibot/ArkType/Effect-like branches | core/hooks | validation-adapters-lab | adapter-shape fixtures only | adapters.test.ts | planned |
| fileValidators presets/custom | core/hooks | file-validators-lab | valid/invalid fixtures visible | fileValidators.test.ts | planned |
| AutoForm generated/custom fields | components | general-autoform + component-lab | generated fields validate and submit | AutoForm.* tests | planned |
| TextField/TextareaField/SelectField/createField | components | component-lab | accessible errors and helper output visible | a11y.runtime.test.tsx | planned |
| FormSwitch APIs | components | form-switch-* + discriminated demos | branch fields switch visibly | FormSwitch.runtime.test.tsx | planned |
| Type-only Path/PathValue/useFieldArray typing | hooks/components | n/a | n/a | tsd only | unit/type only |

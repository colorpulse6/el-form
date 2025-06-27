import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const experienceSchema = z.object({
  name: z.string().min(1, "Name required"),
  experience: z
    .array(
      z.object({
        company: z.string().min(1, "Company name required"),
        position: z.string().min(1, "Position required"),
      })
    )
    .min(1, "At least one experience entry is required"),
});

type FormValues = z.infer<typeof experienceSchema>;

export function UseFormArraysExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, values },
    addArrayItem,
    removeArrayItem,
  } = useForm<FormValues>({
    validators: { onChange: experienceSchema },
    defaultValues: {
      name: "",
      experience: [{ company: "", position: "" }],
    },
  });

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2));
    console.log("Experience data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col space-y-1">
        <label>Full Name</label>
        <input {...register("name")} className="p-2 border rounded" />
        {errors.name && (
          <span className="text-sm text-red-500">{errors.name}</span>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <h3 className="font-medium">Work Experience</h3>
        {(values.experience || []).map((_item: any, index: number) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-2 border rounded"
          >
            <input
              {...register(`experience.${index}.company`)}
              placeholder="Company"
              className="p-2 border rounded flex-1"
            />
            <input
              {...register(`experience.${index}.position`)}
              placeholder="Position"
              className="p-2 border rounded flex-1"
            />
            <button
              type="button"
              onClick={() => removeArrayItem("experience", index)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        {errors.experience && typeof errors.experience === "string" && (
          <span className="text-sm text-red-500">{errors.experience}</span>
        )}
        <button
          type="button"
          onClick={() =>
            addArrayItem("experience", { company: "", position: "" })
          }
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 self-start"
        >
          Add Experience
        </button>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Submit
      </button>
    </form>
  );
}

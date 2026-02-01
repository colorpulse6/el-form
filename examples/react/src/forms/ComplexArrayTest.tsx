import { useForm } from "el-form-react-hooks";
import { useState } from "react";
import z from "zod";
import { Button, FormSection, FormGroup, Card, FormStatusBar, DebugPanel, inputBaseClasses, selectBaseClasses } from "../components/ui";

const projectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),

  team: z
    .array(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email"),
        role: z.enum(["lead", "developer", "designer", "qa"]),
        isActive: z.boolean(),
        skills: z
          .array(
            z.object({
              name: z.string().min(1, "Skill name required"),
              level: z.enum(["beginner", "intermediate", "expert"]),
              yearsExperience: z.number().min(0).max(50).optional(),
            })
          )
          .min(1, "At least one skill required"),
      })
    )
    .min(1, "At least one team member required"),

  tasks: z.array(
    z.object({
      title: z.string().min(2, "Task title required"),
      priority: z.enum(["low", "medium", "high"]),
      assignee: z.string().optional(),
      completed: z.boolean(),
    })
  ),

  tags: z.array(z.string().min(1, "Tag cannot be empty")),
});

type ProjectData = z.infer<typeof projectSchema>;

const defaultTeamMember = {
  name: "",
  email: "",
  role: "developer" as const,
  isActive: true,
  skills: [{ name: "", level: "beginner" as const, yearsExperience: 0 }],
};

const defaultTask = {
  title: "",
  priority: "medium" as const,
  assignee: "",
  completed: false,
};

const defaultSkill = {
  name: "",
  level: "beginner" as const,
  yearsExperience: 0,
};

export function ComplexArrayTest() {
  const [submitResult, setSubmitResult] = useState<ProjectData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["team-0"])
  );

  const {
    register,
    handleSubmit,
    formState,
    reset,
    watch,
    addArrayItem,
    removeArrayItem,
  } = useForm<ProjectData>({
    validators: { onBlur: projectSchema },
    defaultValues: {
      projectName: "",
      description: "",
      team: [{ ...defaultTeamMember }],
      tasks: [],
      tags: [],
    },
  });

  const watchedValues = watch();

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const onSubmit = (data: ProjectData) => {
    console.log("Form submitted:", data);
    setSubmitResult(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Complex Array Test</h2>
        <p className="mt-1 text-sm text-gray-600">
          Demonstrates nested arrays, add/remove operations, and deep validation.
        </p>
      </div>

      <FormStatusBar
        isValid={formState.isValid}
        isDirty={formState.isDirty}
        extra={{
          "Team Members": watchedValues.team?.length || 0,
          Tasks: watchedValues.tasks?.length || 0,
          Tags: watchedValues.tags?.length || 0,
        }}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Info Section */}
        <FormSection title="Project Info" variant="gray">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Project Name" htmlFor="projectName" required error={formState.errors.projectName as string}>
              <input
                id="projectName"
                {...register("projectName")}
                placeholder="Enter project name"
                className={inputBaseClasses}
              />
            </FormGroup>
            <FormGroup label="Description" htmlFor="description">
              <input
                id="description"
                {...register("description")}
                placeholder="Optional description"
                className={inputBaseClasses}
              />
            </FormGroup>
          </div>
        </FormSection>

        {/* Team Members Section */}
        <FormSection
          title={`Team Members (${watchedValues.team?.length || 0})`}
          variant="green"
          headerAction={
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => addArrayItem("team", { ...defaultTeamMember })}
            >
              + Add Member
            </Button>
          }
        >
          <div className="space-y-3">
            {watchedValues.team?.map((member, memberIndex) => (
              <Card key={memberIndex} className="border-l-4 border-l-green-500">
                {/* Member Header */}
                <div
                  className="flex items-center justify-between cursor-pointer -m-4 mb-0 p-4 bg-green-50 rounded-t-lg"
                  onClick={() => toggleSection(`team-${memberIndex}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{expandedSections.has(`team-${memberIndex}`) ? "▼" : "▶"}</span>
                    <span className="font-medium">
                      Member #{memberIndex + 1}: {member.name || "(unnamed)"}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({member.skills?.length || 0} skills)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArrayItem("team", memberIndex);
                    }}
                    disabled={(watchedValues.team?.length || 0) <= 1}
                  >
                    Remove
                  </Button>
                </div>

                {/* Member Fields */}
                {expandedSections.has(`team-${memberIndex}`) && (
                  <div className="pt-4 mt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <FormGroup label="Name" error={formState.errors[`team.${memberIndex}.name` as keyof typeof formState.errors] as string}>
                        <input
                          {...register(`team.${memberIndex}.name`)}
                          placeholder="Full name"
                          className={inputBaseClasses}
                        />
                      </FormGroup>
                      <FormGroup label="Email" error={formState.errors[`team.${memberIndex}.email` as keyof typeof formState.errors] as string}>
                        <input
                          {...register(`team.${memberIndex}.email`)}
                          placeholder="email@example.com"
                          className={inputBaseClasses}
                        />
                      </FormGroup>
                      <FormGroup label="Role">
                        <select {...register(`team.${memberIndex}.role`)} className={selectBaseClasses}>
                          <option value="lead">Lead</option>
                          <option value="developer">Developer</option>
                          <option value="designer">Designer</option>
                          <option value="qa">QA</option>
                        </select>
                      </FormGroup>
                      <FormGroup label="Status">
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input type="checkbox" {...register(`team.${memberIndex}.isActive`)} className="w-4 h-4" />
                          <span className="text-sm">Active</span>
                        </label>
                      </FormGroup>
                    </div>

                    {/* Skills (Nested Array) */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Skills ({member.skills?.length || 0})</span>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => addArrayItem(`team.${memberIndex}.skills`, { ...defaultSkill })}
                        >
                          + Skill
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {member.skills?.map((_skill, skillIndex) => (
                          <div key={skillIndex} className="flex gap-2 items-end bg-white p-2 rounded border">
                            <div className="flex-[2]">
                              <label className="text-xs text-gray-500">Skill Name</label>
                              <input
                                {...register(`team.${memberIndex}.skills.${skillIndex}.name`)}
                                placeholder="e.g., React"
                                className={`${inputBaseClasses} text-sm`}
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Level</label>
                              <select
                                {...register(`team.${memberIndex}.skills.${skillIndex}.level`)}
                                className={`${selectBaseClasses} text-sm`}
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="expert">Expert</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Years</label>
                              <input
                                type="number"
                                {...register(`team.${memberIndex}.skills.${skillIndex}.yearsExperience`)}
                                min="0"
                                max="50"
                                className={`${inputBaseClasses} text-sm`}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeArrayItem(`team.${memberIndex}.skills`, skillIndex)}
                              disabled={(member.skills?.length || 0) <= 1}
                            >
                              x
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </FormSection>

        {/* Tasks Section */}
        <FormSection
          title={`Tasks (${watchedValues.tasks?.length || 0})`}
          variant="amber"
          headerAction={
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => addArrayItem("tasks", { ...defaultTask })}
            >
              + Add Task
            </Button>
          }
        >
          {watchedValues.tasks?.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No tasks yet. Click "Add Task" to create one.</p>
          ) : (
            <div className="space-y-2">
              {watchedValues.tasks?.map((_task, taskIndex) => (
                <div key={taskIndex} className="flex gap-3 items-end bg-white p-3 rounded-lg border">
                  <div className="flex-[2]">
                    <label className="text-xs text-gray-500">Title *</label>
                    <input
                      {...register(`tasks.${taskIndex}.title`)}
                      placeholder="Task title"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Priority</label>
                    <select {...register(`tasks.${taskIndex}.priority`)} className={selectBaseClasses}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Assignee</label>
                    <input
                      {...register(`tasks.${taskIndex}.assignee`)}
                      placeholder="Name"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer text-sm">
                      <input type="checkbox" {...register(`tasks.${taskIndex}.completed`)} className="w-4 h-4" />
                      Done
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeArrayItem("tasks", taskIndex)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* Tags Section */}
        <FormSection
          title={`Tags (${watchedValues.tags?.length || 0})`}
          variant="purple"
          headerAction={
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => addArrayItem("tags", "")}
            >
              + Add Tag
            </Button>
          }
        >
          <div className="flex flex-wrap gap-2">
            {watchedValues.tags?.map((_tag, tagIndex) => (
              <div
                key={tagIndex}
                className="flex items-center gap-1 bg-white border border-purple-200 rounded-full px-3 py-1"
              >
                <input
                  {...register(`tags.${tagIndex}`)}
                  placeholder="tag"
                  className="border-none bg-transparent w-20 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("tags", tagIndex)}
                  className="text-purple-600 hover:text-purple-800 text-lg leading-none"
                >
                  x
                </button>
              </div>
            ))}
            {watchedValues.tags?.length === 0 && (
              <p className="text-gray-500 text-sm">No tags yet</p>
            )}
          </div>
        </FormSection>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Submitting..." : "Save Project"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset();
              setSubmitResult(null);
              setExpandedSections(new Set(["team-0"]));
            }}
          >
            Reset All
          </Button>
        </div>
      </form>

      {submitResult && (
        <Card variant="success">
          <h4 className="font-semibold text-green-800 mb-2">Project Saved Successfully!</h4>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(submitResult, null, 2)}
          </pre>
        </Card>
      )}

      <DebugPanel title="Validation Errors" data={formState.errors} variant="errors" />
    </div>
  );
}

export default ComplexArrayTest;

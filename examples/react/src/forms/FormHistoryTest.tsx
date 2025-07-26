import { useForm } from "el-form-react-hooks";
import { useState } from "react";
import { getNestedValue } from "el-form-core";
import z from "zod";

const historySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  preferences: z.object({
    theme: z.enum(["light", "dark"]),
    notifications: z.boolean(),
  }),
});

export function FormHistoryTest() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState,
    reset,
    watch,
    setValue,
    getSnapshot,
    restoreSnapshot,
    hasChanges,
    getChanges,
  } = useForm({
    validators: { onChange: historySchema },
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      age: 25,
      bio: "Software developer with passion for React",
      preferences: {
        theme: "light" as const,
        notifications: true,
      },
    },
  });

  const currentValues = watch();
  const changes = getChanges();
  const hasAnyChanges = hasChanges();

  const createSnapshot = () => {
    const snapshot = getSnapshot();
    setSnapshots((prev) => [...prev, { ...snapshot, id: Date.now() }]);
  };

  const restoreFromSnapshot = (snapshot: any) => {
    restoreSnapshot(snapshot);
    setSelectedSnapshot(null);
  };

  const clearSnapshots = () => {
    setSnapshots([]);
    setSelectedSnapshot(null);
  };

  const makeQuickChanges = () => {
    setValue("name", "Jane Smith");
    setValue("email", "jane@example.com");
    setValue("age", 30);
    setValue("preferences.theme", "dark");
  };

  return (
    <div className="form-section">
      <h2>📸 Form History Test</h2>
      <p>Tests: getSnapshot(), restoreSnapshot(), hasChanges(), getChanges()</p>

      {/* History Controls */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "1rem",
          borderRadius: "4px",
          marginBottom: "1rem",
        }}
      >
        <h3>History Controls</h3>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={createSnapshot}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            📸 Create Snapshot
          </button>

          <button
            type="button"
            onClick={makeQuickChanges}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ⚡ Make Quick Changes
          </button>

          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄 Reset to Default
          </button>

          <button
            type="button"
            onClick={clearSnapshots}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🗑️ Clear Snapshots
          </button>
        </div>

        {/* Change Status */}
        <div style={{ marginBottom: "1rem" }}>
          <strong>Changes Status:</strong>
          <br />
          <span style={{ color: hasAnyChanges ? "#28a745" : "#6c757d" }}>
            Has Changes: {hasAnyChanges ? "✅ Yes" : "❌ No"}
          </span>
        </div>

        {/* Current Changes */}
        {Object.keys(changes).length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <strong>Current Changes:</strong>
            <pre
              style={{
                backgroundColor: "#fff3cd",
                padding: "0.5rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                overflow: "auto",
              }}
            >
              {JSON.stringify(changes, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit((data) => {
          console.log("Form submitted:", data);
        })}
        style={{ marginBottom: "1rem" }}
      >
        <div className="form-group">
          <label>Name</label>
          <input {...register("name")} placeholder="Enter your name" />
          {formState.errors.name && (
            <span className="error">{formState.errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
          />
          {formState.errors.email && (
            <span className="error">{formState.errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            {...register("age")}
            type="number"
            placeholder="Enter your age"
          />
          {formState.errors.age && (
            <span className="error">{formState.errors.age}</span>
          )}
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            {...register("bio")}
            placeholder="Tell us about yourself..."
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
          />
          {formState.errors.bio && (
            <span className="error">{formState.errors.bio}</span>
          )}
        </div>

        <div className="form-group">
          <label>Theme</label>
          <select {...register("preferences.theme")}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          {getNestedValue(formState.errors, "preferences.theme") && (
            <span className="error">
              {getNestedValue(formState.errors, "preferences.theme")}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>
            <input
              {...register("preferences.notifications")}
              type="checkbox"
              style={{ marginRight: "0.5rem" }}
            />
            Enable Notifications
          </label>
          {getNestedValue(formState.errors, "preferences.notifications") && (
            <span className="error">
              {getNestedValue(formState.errors, "preferences.notifications")}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          {formState.isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Current Form State */}
      <div
        style={{
          backgroundColor: "#e8f4fd",
          padding: "1rem",
          borderRadius: "4px",
          marginBottom: "1rem",
        }}
      >
        <h3>Current Form State</h3>
        <pre
          style={{
            backgroundColor: "white",
            padding: "0.5rem",
            borderRadius: "4px",
            fontSize: "0.8rem",
            overflow: "auto",
          }}
        >
          {JSON.stringify(currentValues, null, 2)}
        </pre>
        <div style={{ marginTop: "0.5rem" }}>
          <strong>Form Status:</strong>
          Valid: {formState.isValid ? "✅" : "❌"} | Dirty:{" "}
          {formState.isDirty ? "✅" : "❌"}
        </div>
      </div>

      {/* Snapshots */}
      <div
        style={{
          backgroundColor: "#f0f8ff",
          padding: "1rem",
          borderRadius: "4px",
        }}
      >
        <h3>Snapshots ({snapshots.length})</h3>
        {snapshots.length === 0 ? (
          <p style={{ color: "#6c757d", fontStyle: "italic" }}>
            No snapshots created yet. Click "Create Snapshot" to save the
            current form state.
          </p>
        ) : (
          <div>
            {snapshots.map((snapshot, index) => (
              <div
                key={snapshot.id}
                style={{
                  backgroundColor:
                    selectedSnapshot === index ? "#fff3cd" : "white",
                  border:
                    selectedSnapshot === index
                      ? "2px solid #ffc107"
                      : "1px solid #dee2e6",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setSelectedSnapshot(selectedSnapshot === index ? null : index)
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>Snapshot #{index + 1}</strong>
                    <br />
                    <small style={{ color: "#6c757d" }}>
                      {new Date(snapshot.timestamp).toLocaleString()}
                    </small>
                    <br />
                    <small>
                      Name: {snapshot.values.name} | Email:{" "}
                      {snapshot.values.email} | Theme:{" "}
                      {snapshot.values.preferences.theme}
                    </small>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        restoreFromSnapshot(snapshot);
                      }}
                      style={{
                        backgroundColor: "#17a2b8",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      🔄 Restore
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSnapshots((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        if (selectedSnapshot === index)
                          setSelectedSnapshot(null);
                      }}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {selectedSnapshot === index && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    <strong>Snapshot Data:</strong>
                    <pre
                      style={{
                        fontSize: "0.7rem",
                        marginTop: "0.25rem",
                        overflow: "auto",
                      }}
                    >
                      {JSON.stringify(snapshot, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

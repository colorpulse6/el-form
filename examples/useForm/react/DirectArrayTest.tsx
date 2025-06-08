// Import the hook from the library package
import { useForm } from "el-form";
import { z } from "zod";

// Test the useForm hook directly with array operations
const testSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
    })
  ),
});

export function DirectArrayTest() {
  const {
    register,
    handleSubmit,
    formState,
    setValue,
    addArrayItem,
    removeArrayItem,
  } = useForm({
    schema: testSchema,
    initialValues: { title: "", items: [] },
  });

  const handleAddItem = () => {
    addArrayItem("items", { name: "", price: 0 });
  };

  const handleRemoveItem = (index: number) => {
    removeArrayItem("items", index);
  };

  const handleSubmitForm = (data: any) => {
    console.log("Direct useForm test submitted:", data);
    alert("Direct useForm test successful!");
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #4CAF50",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ color: "#4CAF50", marginBottom: "16px" }}>
        🔧 Direct useForm Hook Test
      </h3>

      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <div style={{ marginBottom: "16px" }}>
          <label>Title:</label>
          <input
            {...register("title")}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "4px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label>Items:</label>
            <button
              type="button"
              onClick={handleAddItem}
              style={{
                padding: "4px 8px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add Item
            </button>
          </div>

          {formState.values.items?.map((item: any, index: number) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginTop: "8px",
                borderRadius: "4px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <strong>Item #{index + 1}</strong>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Remove
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <input
                  value={item.name || ""}
                  onChange={(e) =>
                    setValue(`items[${index}].name`, e.target.value)
                  }
                  placeholder="Item name"
                  style={{
                    padding: "6px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="number"
                  value={item.price || 0}
                  onChange={(e) =>
                    setValue(`items[${index}].price`, Number(e.target.value))
                  }
                  placeholder="Price"
                  style={{
                    padding: "6px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          ))}

          {(!formState.values.items || formState.values.items.length === 0) && (
            <p
              style={{
                fontStyle: "italic",
                color: "#666",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              No items added yet. Click "Add Item" to create one.
            </p>
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "8px",
          }}
        >
          Submit
        </button>

        <button
          type="button"
          onClick={() => console.log("Current form state:", formState.values)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Log State
        </button>
      </form>
    </div>
  );
}

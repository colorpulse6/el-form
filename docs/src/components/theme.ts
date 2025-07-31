export const lightTheme = {
  fieldConfig: {
    inputClassName:
      "w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400",
    labelClassName: "text-gray-900 text-sm font-medium mb-1 block",
    errorClassName: "text-red-500 text-sm mt-1",
  },
  submitButton: {
    className:
      "bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-semibold",
  },
  resetButton: {
    className:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md font-semibold",
  },
};

export const darkTheme = {
  fieldConfig: {
    inputClassName:
      "w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500",
    labelClassName: "text-white text-sm font-medium mb-1 block",
    errorClassName: "text-red-400 text-sm mt-1",
  },
  submitButton: {
    className:
      "bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-semibold",
  },
  resetButton: {
    className:
      "bg-gray-600 text-gray-200 hover:bg-gray-700 px-4 py-2 rounded-md font-semibold",
  },
};

// Helper function to get theme based on mode
export function getTheme(mode: "light" | "dark") {
  return mode === "dark" ? darkTheme : lightTheme;
}

// For backward compatibility, export darkTheme as default
export default darkTheme;

import { useForm } from "../useForm";
import { useFieldQuery } from "../validation/useFieldQuery";

// Example: Username availability checker
interface UsernameCheckResponse {
  available: boolean;
  suggestions?: string[];
  message: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
}

// Mock API function for username validation
const checkUsernameAvailability = async (
  username: string
): Promise<UsernameCheckResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock some unavailable usernames
  const unavailableUsernames = ["admin", "user", "test", "demo", "api"];
  const isAvailable =
    !unavailableUsernames.includes(username.toLowerCase()) &&
    username.length >= 3;

  if (!isAvailable) {
    return {
      available: false,
      message:
        username.length < 3
          ? "Username must be at least 3 characters"
          : "Username is not available",
      suggestions: [`${username}123`, `${username}_user`, `new_${username}`],
    };
  }

  return {
    available: true,
    message: "Username is available!",
  };
};

export function FieldQueryExample() {
  const form = useForm<UserFormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Get current username value
  const usernameValue = form.watch("username");

  // Use React Query for real-time username validation
  const usernameValidation = useFieldQuery<UsernameCheckResponse>({
    value: usernameValue,
    queryKey: (value) => ["username-check", value],
    queryFn: async (value) => {
      const result = await checkUsernameAvailability(value);
      // Transform to FieldQueryValidationResult format
      return {
        isValid: result.available,
        error: result.available ? null : result.message,
        data: result,
      } as any; // Cast since we're returning our custom data
    },

    // Only check if username has some content
    enabled: (value) => typeof value === "string" && value.length > 0,

    // Validation timing options
    debounceMs: 300, // Wait 300ms after typing stops

    // Callbacks
    onSuccess: (data) => {
      console.log("Username check successful:", data);
    },

    onError: (error) => {
      console.error("Username check failed:", error);
    },

    // React Query options
    queryOptions: {
      staleTime: 5 * 60 * 1000, // Consider username checks fresh for 5 minutes
      retry: 1, // Only retry once on failure
    },
  });

  const handleSubmit = async (values: UserFormData) => {
    // Make sure username is valid before submitting
    if (!usernameValidation.isValid) {
      alert("Please choose a valid username");
      return;
    }

    console.log("Submitting form:", values);
    // Submit to your API...
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Registration Form</h2>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Username field with real-time validation */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username
          </label>
          <div className="relative">
            <input
              {...form.register("username")}
              id="username"
              type="text"
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  usernameValidation.queryState.isPending
                    ? "border-yellow-300"
                    : ""
                }
                ${
                  usernameValidation.isValid &&
                  !usernameValidation.queryState.isPending
                    ? "border-green-500"
                    : ""
                }
                ${
                  usernameValidation.error &&
                  !usernameValidation.queryState.isPending
                    ? "border-red-500"
                    : ""
                }
              `}
              placeholder="Enter username"
            />

            {/* Loading indicator */}
            {usernameValidation.queryState.isPending && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}

            {/* Success indicator */}
            {usernameValidation.isValid &&
              !usernameValidation.queryState.isPending && (
                <div className="absolute right-3 top-2.5 text-green-500">✓</div>
              )}

            {/* Error indicator */}
            {usernameValidation.error &&
              !usernameValidation.queryState.isPending && (
                <div className="absolute right-3 top-2.5 text-red-500">✗</div>
              )}
          </div>

          {/* Validation feedback */}
          {usernameValidation.queryState.isPending && (
            <p className="text-sm text-yellow-600 mt-1">
              Checking availability...
            </p>
          )}

          {usernameValidation.isValid &&
            !usernameValidation.queryState.isPending && (
              <p className="text-sm text-green-600 mt-1">
                {(usernameValidation.queryState.data as any)?.data?.message}
              </p>
            )}

          {usernameValidation.error &&
            !usernameValidation.queryState.isPending && (
              <div className="mt-1">
                <p className="text-sm text-red-600">
                  {usernameValidation.error}
                </p>

                {/* Show suggestions if available */}
                {(usernameValidation.queryState.data as any)?.data
                  ?.suggestions && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Suggestions:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(
                        usernameValidation.queryState.data as any
                      ).data.suggestions.map((suggestion: string) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => form.setValue("username", suggestion)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            {...form.register("email")}
            id="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email"
          />
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            {...form.register("password")}
            id="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={
            !usernameValidation.isValid ||
            usernameValidation.queryState.isPending
          }
          className={`
            w-full py-2 px-4 rounded-md text-white font-medium
            ${
              !usernameValidation.isValid ||
              usernameValidation.queryState.isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          `}
        >
          {usernameValidation.queryState.isPending
            ? "Validating..."
            : "Register"}
        </button>
      </form>

      {/* Debug info */}
      <div className="mt-6 p-4 bg-gray-100 rounded text-xs">
        <h3 className="font-medium mb-2">Validation State:</h3>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(
            {
              isValid: usernameValidation.isValid,
              error: usernameValidation.error,
              isPending: usernameValidation.queryState.isPending,
              isError: usernameValidation.queryState.isError,
              data: usernameValidation.queryState.data,
            },
            null,
            2
          )}
        </pre>

        <button
          type="button"
          onClick={() => usernameValidation.revalidate()}
          className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Revalidate
        </button>
      </div>
    </div>
  );
}

export default FieldQueryExample;

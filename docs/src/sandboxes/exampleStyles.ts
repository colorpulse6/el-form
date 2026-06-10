// Temporary shared styling for the live Playground example forms so they look
// polished in the deployed docs. This is a stopgap until the design-presets
// phase ships real AutoForm themes — it styles native form elements generically
// (each Sandpack preview is an isolated document, so global selectors are safe).
export const EXAMPLE_STYLES = `* {
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f1f5f9;
  color: #0f172a;
  margin: 0;
  padding: 28px;
}
form {
  display: grid;
  gap: 18px;
  max-width: 440px;
  background: #ffffff;
  padding: 28px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06);
}
label {
  display: grid;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}
input,
textarea,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
input::placeholder,
textarea::placeholder {
  color: #94a3b8;
}
input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}
button {
  padding: 10px 18px;
  border: none;
  border-radius: 9px;
  background: #6366f1;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.05s ease;
}
button:hover {
  background: #4f46e5;
}
button:active {
  transform: translateY(1px);
}
button[type="button"] {
  background: #eef2ff;
  color: #4338ca;
}
button[type="button"]:hover {
  background: #e0e7ff;
}
.error {
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  margin-top: -8px;
}
.row {
  display: flex;
  gap: 10px;
  align-items: center;
}
`;

// Single source of truth for every destination the landing page points to.
// Internal docs links are root-relative so they resolve on localhost, preview,
// and production (https://elform.dev/docs/intro) without hardcoding the host.
export const LINKS = {
  docs: "/docs/intro",
  apis: "#apis",
  validation: "#validation",
  features: "#features",
  getStarted: "#get-started",
  github: "https://github.com/colorpulse6/el-form",
  npm: "https://www.npmjs.com/package/el-form-react",
  issues: "https://github.com/colorpulse6/el-form/issues",
  coffee: "https://buymeacoffee.com/nicbarnes",
  portfolio: "https://nichalasbarnes.com",
} as const;

export const INSTALL_CMD = "npm install el-form-react";

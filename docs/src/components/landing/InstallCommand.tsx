import React from "react";
import clsx from "clsx";
import { CopyIcon } from "./Icons";
import { INSTALL_CMD } from "./links";

// Copyable install command. Clicking writes `npm install el-form-react` to the
// clipboard, swaps the label to COPIED and tints the button mint for ~1.6s.
export function InstallCommand() {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = React.useCallback(() => {
    const done = () => {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    };
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(INSTALL_CMD).then(done).catch(done);
    } else if (typeof document !== "undefined") {
      const t = document.createElement("textarea");
      t.value = INSTALL_CMD;
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy");
      } catch {
        /* no-op */
      }
      document.body.removeChild(t);
      done();
    }
  }, []);

  return (
    <div className="install">
      <span className="cmd">
        <span className="dollar">$</span>
        <span className="pkg">{INSTALL_CMD}</span>
      </span>
      <button
        className={clsx("copy", copied && "done")}
        type="button"
        onClick={copy}
        aria-label="Copy install command"
      >
        <CopyIcon />
        <span className="lbl">{copied ? "COPIED" : "COPY"}</span>
      </button>
    </div>
  );
}

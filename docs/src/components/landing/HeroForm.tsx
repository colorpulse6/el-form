import React from "react";
import clsx from "clsx";
import { useForm } from "el-form-react";
import { z } from "zod";
import { ArrowIcon } from "./Icons";

// The exact schema shown in the code card next to this form.
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message too short"),
});

type ContactValues = z.infer<typeof contactSchema>;

// A real, submittable form — the "rendered output" of the schema above, driven
// by El Form's own useForm hook (the library running on its own homepage),
// styled to match the dark design. No backend: a valid submit shows a success
// state. It starts pre-filled with a short message so the "Message too short"
// rule from the code card is demonstrated live.
export function HeroForm() {
  const { register, handleSubmit, formState, trigger, reset } = useForm({
    validators: { onChange: contactSchema },
    validateOn: "onChange",
    defaultValues: {
      name: "Ada Lovelace",
      email: "ada@analytical.dev",
      message: "Hi there",
    },
  });

  const [sent, setSent] = React.useState(false);
  const [sentName, setSentName] = React.useState("");

  // Surface the initial validation state (mirrors the design's error on Message)
  // exactly once on mount. `trigger` is a fresh function every render, so it
  // must NOT be an effect dependency — depending on it re-runs the effect every
  // render and loops forever (each trigger() sets state -> re-render -> ...).
  const didInit = React.useRef(false);
  React.useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    trigger?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errors = formState.errors as Partial<Record<keyof ContactValues, string>>;
  const fieldClass = (name: keyof ContactValues) =>
    clsx("field", errors[name] ? "err" : "ok");

  const onValid = (data: ContactValues) => {
    setSentName(data.name);
    setSent(true);
  };

  return (
    <div className="card form-card">
      <div className="fc-head">
        <span className="fc-title">Contact</span>
        <span className="fc-tag">{sent ? "sent" : "live demo"}</span>
      </div>

      {sent ? (
        <div className="fc-success">
          <span className="fc-check" aria-hidden="true">
            <svg
              className="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="fc-success-title">Message sent</div>
          <p className="fc-success-sub">
            Thanks{sentName ? `, ${sentName}` : ""}. Validated and submitted with El Form's useForm
            hook — no backend required.
          </p>
          <button
            className="fc-reset"
            type="button"
            onClick={() => {
              reset?.();
              setSent(false);
            }}
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onValid)} noValidate>
          <div className={fieldClass("name")}>
            <label htmlFor="hf-name">Name</label>
            <input id="hf-name" className="inp" autoComplete="name" {...register("name")} />
            {errors.name && <div className="msg">{errors.name}</div>}
          </div>
          <div className={fieldClass("email")}>
            <label htmlFor="hf-email">Email</label>
            <input id="hf-email" className="inp" autoComplete="email" {...register("email")} />
            {errors.email && <div className="msg">{errors.email}</div>}
          </div>
          <div className={fieldClass("message")}>
            <label htmlFor="hf-message">Message</label>
            <textarea id="hf-message" className="inp area" rows={2} {...register("message")} />
            {errors.message && <div className="msg">{errors.message}</div>}
          </div>
          <button className="fc-submit" type="submit">
            Submit
            <ArrowIcon />
          </button>
        </form>
      )}
    </div>
  );
}

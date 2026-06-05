import React from "react";
import clsx from "clsx";

/**
 * Pre-highlighted code blocks. The token markup is static and authored here
 * (no user input), reproduced verbatim from the design reference so the
 * syntax coloring matches exactly. Token classes (`tok-*`) are styled by
 * landing.css with the handoff's exact code-token colors.
 */
function Code({ html, sm }: { html: string; sm?: boolean }) {
  return (
    <pre
      className={clsx("code", sm && "sm")}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Hero card: condensed last line (onSubmit={handle}) to fit the narrower card.
const HERO_HTML = `<span class="tok-kw">import</span> <span class="tok-punc">{</span> <span class="tok-type">AutoForm</span> <span class="tok-punc">}</span> <span class="tok-kw">from</span> <span class="tok-str">"el-form-react-components"</span><span class="tok-punc">;</span>
<span class="tok-kw">import</span> <span class="tok-str">"el-form-react-components/styles.css"</span><span class="tok-punc">;</span>
<span class="tok-kw">import</span> <span class="tok-punc">{</span> <span class="tok-prop">z</span> <span class="tok-punc">}</span> <span class="tok-kw">from</span> <span class="tok-str">"zod"</span><span class="tok-punc">;</span>

<span class="tok-kw">const</span> <span class="tok-prop">contactSchema</span> <span class="tok-punc">=</span> <span class="tok-prop">z</span><span class="tok-punc">.</span><span class="tok-fn">object</span><span class="tok-punc">({</span>
  <span class="tok-prop">name</span><span class="tok-punc">:</span> <span class="tok-prop">z</span><span class="tok-punc">.</span><span class="tok-fn">string</span><span class="tok-punc">().</span><span class="tok-fn">min</span><span class="tok-punc">(</span><span class="tok-num">1</span><span class="tok-punc">,</span> <span class="tok-str">"Name is required"</span><span class="tok-punc">),</span>
  <span class="tok-prop">email</span><span class="tok-punc">:</span> <span class="tok-prop">z</span><span class="tok-punc">.</span><span class="tok-fn">string</span><span class="tok-punc">().</span><span class="tok-fn">email</span><span class="tok-punc">(</span><span class="tok-str">"Invalid email"</span><span class="tok-punc">),</span>
  <span class="tok-prop">message</span><span class="tok-punc">:</span> <span class="tok-prop">z</span><span class="tok-punc">.</span><span class="tok-fn">string</span><span class="tok-punc">().</span><span class="tok-fn">min</span><span class="tok-punc">(</span><span class="tok-num">10</span><span class="tok-punc">,</span> <span class="tok-str">"Message too short"</span><span class="tok-punc">),</span>
<span class="tok-punc">});</span>

<span class="tok-kw">function</span> <span class="tok-fn">ContactForm</span><span class="tok-punc">() {</span>
  <span class="tok-kw">return</span> <span class="tok-punc">&lt;</span><span class="tok-type">AutoForm</span> <span class="tok-prop">schema</span><span class="tok-punc">=</span><span class="tok-punc">{</span><span class="tok-prop">contactSchema</span><span class="tok-punc">}</span> <span class="tok-prop">onSubmit</span><span class="tok-punc">=</span><span class="tok-punc">{</span><span class="tok-prop">handle</span><span class="tok-punc">}</span> <span class="tok-punc">/&gt;;</span>
<span class="tok-punc">}</span>`;

// AutoForm card: full version with the complete onSubmit handler.
const AUTOFORM_HTML = `<span class="tok-kw">import</span> <span class="tok-punc">{</span> <span class="tok-type">AutoForm</span> <span class="tok-punc">}</span> <span class="tok-kw">from</span> <span class="tok-str">"el-form-react-components"</span><span class="tok-punc">;</span>
<span class="tok-kw">import</span> <span class="tok-str">"el-form-react-components/styles.css"</span><span class="tok-punc">;</span>
<span class="tok-kw">import</span> <span class="tok-punc">{</span> <span class="tok-prop">z</span> <span class="tok-punc">}</span> <span class="tok-kw">from</span> <span class="tok-str">"zod"</span><span class="tok-punc">;</span>

<span class="tok-kw">const</span> <span class="tok-prop">contactSchema</span> <span class="tok-punc">=</span> <span class="tok-prop">z</span><span class="tok-punc">.</span><span class="tok-fn">object</span><span class="tok-punc">({</span>
  <span class="tok-prop">name</span><span class="tok-punc">:</span> <span class="tok-prop">z</span><span class="tok-punc">.</span><span class="tok-fn">string</span><span class="tok-punc">().</span><span class="tok-fn">min</span><span class="tok-punc">(</span><span class="tok-num">1</span><span class="tok-punc">,</span> <span class="tok-str">"Name is required"</span><span class="tok-punc">),</span>
  <span class="tok-prop">email</span><span class="tok-punc">:</span> <span class="tok-prop">z</span><span class="tok-punc">.</span><span class="tok-fn">string</span><span class="tok-punc">().</span><span class="tok-fn">email</span><span class="tok-punc">(</span><span class="tok-str">"Invalid email"</span><span class="tok-punc">),</span>
  <span class="tok-prop">message</span><span class="tok-punc">:</span> <span class="tok-prop">z</span><span class="tok-punc">.</span><span class="tok-fn">string</span><span class="tok-punc">().</span><span class="tok-fn">min</span><span class="tok-punc">(</span><span class="tok-num">10</span><span class="tok-punc">,</span> <span class="tok-str">"Message too short"</span><span class="tok-punc">),</span>
<span class="tok-punc">});</span>

<span class="tok-kw">function</span> <span class="tok-fn">ContactForm</span><span class="tok-punc">() {</span>
  <span class="tok-kw">return</span> <span class="tok-punc">(</span>
    <span class="tok-punc">&lt;</span><span class="tok-type">AutoForm</span> <span class="tok-prop">schema</span><span class="tok-punc">=</span><span class="tok-punc">{</span><span class="tok-prop">contactSchema</span><span class="tok-punc">}</span> <span class="tok-prop">onSubmit</span><span class="tok-punc">=</span><span class="tok-punc">{(</span><span class="tok-prop">data</span><span class="tok-punc">)</span> <span class="tok-punc">=&gt;</span> <span class="tok-fn">console</span><span class="tok-punc">.</span><span class="tok-fn">log</span><span class="tok-punc">(</span><span class="tok-prop">data</span><span class="tok-punc">)}</span> <span class="tok-punc">/&gt;</span>
  <span class="tok-punc">);</span>
<span class="tok-punc">}</span>`;

// useForm card.
const USEFORM_HTML = `<span class="tok-kw">import</span> <span class="tok-punc">{</span> <span class="tok-fn">useForm</span> <span class="tok-punc">}</span> <span class="tok-kw">from</span> <span class="tok-str">"el-form-react-hooks"</span><span class="tok-punc">;</span>

<span class="tok-kw">function</span> <span class="tok-fn">CustomForm</span><span class="tok-punc">() {</span>
  <span class="tok-kw">const</span> <span class="tok-punc">{</span> <span class="tok-prop">register</span><span class="tok-punc">,</span> <span class="tok-prop">handleSubmit</span><span class="tok-punc">,</span> <span class="tok-prop">formState</span> <span class="tok-punc">}</span> <span class="tok-punc">=</span> <span class="tok-fn">useForm</span><span class="tok-punc">({</span>
    <span class="tok-prop">defaultValues</span><span class="tok-punc">:</span> <span class="tok-punc">{</span> <span class="tok-prop">email</span><span class="tok-punc">:</span> <span class="tok-str">""</span><span class="tok-punc">,</span> <span class="tok-prop">message</span><span class="tok-punc">:</span> <span class="tok-str">""</span> <span class="tok-punc">},</span>
  <span class="tok-punc">});</span>

  <span class="tok-kw">return</span> <span class="tok-punc">(</span>
    <span class="tok-punc">&lt;</span><span class="tok-tag">form</span> <span class="tok-prop">onSubmit</span><span class="tok-punc">=</span><span class="tok-punc">{</span><span class="tok-fn">handleSubmit</span><span class="tok-punc">((</span><span class="tok-prop">data</span><span class="tok-punc">)</span> <span class="tok-punc">=&gt;</span> <span class="tok-fn">console</span><span class="tok-punc">.</span><span class="tok-fn">log</span><span class="tok-punc">(</span><span class="tok-prop">data</span><span class="tok-punc">))}&gt;</span>
      <span class="tok-punc">&lt;</span><span class="tok-tag">input</span> <span class="tok-punc">{...</span><span class="tok-fn">register</span><span class="tok-punc">(</span><span class="tok-str">"email"</span><span class="tok-punc">)}</span> <span class="tok-prop">placeholder</span><span class="tok-punc">=</span><span class="tok-str">"Email"</span> <span class="tok-punc">/&gt;</span>
      <span class="tok-punc">&lt;</span><span class="tok-tag">textarea</span> <span class="tok-punc">{...</span><span class="tok-fn">register</span><span class="tok-punc">(</span><span class="tok-str">"message"</span><span class="tok-punc">)}</span> <span class="tok-prop">placeholder</span><span class="tok-punc">=</span><span class="tok-str">"Message"</span> <span class="tok-punc">/&gt;</span>
      <span class="tok-punc">&lt;</span><span class="tok-tag">button</span> <span class="tok-prop">type</span><span class="tok-punc">=</span><span class="tok-str">"submit"</span><span class="tok-punc">&gt;</span>Submit<span class="tok-punc">&lt;/</span><span class="tok-tag">button</span><span class="tok-punc">&gt;</span>
    <span class="tok-punc">&lt;/</span><span class="tok-tag">form</span><span class="tok-punc">&gt;</span>
  <span class="tok-punc">);</span>
<span class="tok-punc">}</span>`;

export function HeroCode() {
  return <Code html={HERO_HTML} />;
}
export function AutoFormCode() {
  return <Code html={AUTOFORM_HTML} sm />;
}
export function UseFormCode() {
  return <Code html={USEFORM_HTML} sm />;
}

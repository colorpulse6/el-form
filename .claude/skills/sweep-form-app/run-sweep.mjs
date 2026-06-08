// .claude/skills/sweep-form-app/run-sweep.mjs
// Pre-launch sweep of the el-form example app. Run AFTER the dev server is up on :3001.
import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const BASE = "http://localhost:3001";
const OUT = ".sweep-results";
const FIXTURE_DIR = join(OUT, "fixtures");

mkdirSync(OUT, { recursive: true });

// id -> { label (sidebar button text), check(page) -> { pass, note, coverage } }
const DEMOS = [
  { id: "basic-validation", label: "Basic Validation", check: assertBasicValidation },
  { id: "onblur-validation", label: "OnBlur Validation", check: assertOnBlurValidation },
  { id: "async-validation", label: "Async Validation", check: assertAsyncValidation },
  { id: "file-upload", label: "Basic File Upload", check: assertFileUpload },
  { id: "advanced-file", label: "Advanced File Validation", check: assertAdvancedFileValidation },
  { id: "zod-file", label: "Zod File Validation", check: assertZodFileValidation },
  { id: "complex-arrays", label: "Complex Arrays", check: assertComplexArrays },
  { id: "form-history", label: "Form History", check: assertFormHistory },
  { id: "discriminated-union", label: "Manual Discriminated", check: assertDiscriminatedUnion },
  { id: "auto-discriminated", label: "Auto Discriminated", check: assertAutoDiscriminatedUnion },
  { id: "general-autoform", label: "General AutoForm", check: assertGeneralAutoForm },
  { id: "form-switch-field", label: "Field Example", check: assertFormSwitchField },
  { id: "form-switch-select", label: "Select Example", check: assertFormSwitchSelect },
  { id: "form-switch-compat", label: "Back Compat", check: assertFormSwitchCompat },
  { id: "use-field-rerender", label: "useField Rerender", check: assertUseFieldRerender },
  { id: "form-controls-lab", label: "Form Controls Lab", check: assertFormControlsLab },
  { id: "field-array-lab", label: "Field Array Lab", check: assertFieldArrayLab },
  { id: "validation-adapters-lab", label: "Validation Adapters Lab", check: assertValidationAdaptersLab },
  { id: "file-validators-lab", label: "File Validators Lab", check: assertFileValidatorsLab },
  { id: "component-lab", label: "Component Lab", check: assertComponentLab },
];

const ADAPTER_BRANCHES = [
  "zod",
  "standard-schema-shape",
  "custom-function",
  "yup-like",
  "valibot-like",
  "arktype-like",
  "effect-like",
];

const ADAPTER_SHAPE_FIXTURES = [
  "zod",
  "standard-schema-shape",
  "yup-like",
  "valibot-like",
  "arktype-like",
  "effect-like",
];

const main = (page) => page.locator("main");

// --- shared helpers ---

async function clickDemo(page, label) {
  const button = page.getByRole("button", { name: label, exact: true }).first();
  await expectVisible(button, `sidebar button "${label}"`);
  await button.click();
  await waitFor(async () => {
    const classes = (await button.getAttribute("class")) ?? "";
    return classes.includes("bg-blue-600") ? true : null;
  }, `sidebar selected "${label}"`);
  await expectVisible(main(page), "main content");
}

async function expectVisible(locator, note) {
  const target = locator.first();
  try {
    await target.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    throw new Error(`${note} was not visible`);
  }
  return target;
}

async function fillByLabel(page, label, value) {
  const control = await controlByLabel(page, label, "input, textarea");
  await expectVisible(control, `field "${label}"`);
  await control.fill(String(value));
}

async function selectByLabel(page, label, value) {
  const control = await controlByLabel(page, label, "select");
  await expectVisible(control, `select "${label}"`);
  await control.selectOption(value);
}

async function setInputFilesByLabel(page, label, files) {
  const control = await controlByLabel(page, label, 'input[type="file"]');
  await expectVisible(control, `file input "${label}"`);
  await control.setInputFiles(files);
}

async function readJsonTestId(page, testId) {
  const locator = await expectVisible(main(page).getByTestId(testId), `${testId} JSON panel`);
  const result = await waitFor(async () => {
    const text = (await locator.textContent()) ?? "";
    try {
      return { value: JSON.parse(text) };
    } catch {
      return null;
    }
  }, `parse JSON from ${testId}`);
  return result.value;
}

function createFixtureFiles() {
  mkdirSync(FIXTURE_DIR, { recursive: true });

  const files = {
    avatarPng: join(FIXTURE_DIR, "avatar.png"),
    portfolioPng: join(FIXTURE_DIR, "portfolio-one.png"),
    portfolioJpg: join(FIXTURE_DIR, "portfolio-two.jpg"),
    noteTxt: join(FIXTURE_DIR, "notes.txt"),
    extraTxt: join(FIXTURE_DIR, "extra.txt"),
    resumePdf: join(FIXTURE_DIR, "resume.pdf"),
  };

  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64"
  );
  writeFileSync(files.avatarPng, tinyPng);
  writeFileSync(files.portfolioPng, tinyPng);
  writeFileSync(files.portfolioJpg, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  writeFileSync(files.noteTxt, "tiny text fixture\n");
  writeFileSync(files.extraTxt, "second tiny text fixture\n");
  writeFileSync(files.resumePdf, "%PDF-1.1\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");

  return files;
}

async function controlByLabel(page, label, selector) {
  const scope = main(page);
  const looseLabel = new RegExp(`^\\s*${escapeRegex(label)}(?:\\s|\\*|\\(|$)`, "i");

  const direct = scope.getByLabel(label, { exact: true }).first();
  if (await direct.count()) return direct;

  const loose = scope.getByLabel(looseLabel).first();
  if (await loose.count()) return loose;

  const labelNode = scope.locator("label").filter({ hasText: looseLabel }).first();
  if (await labelNode.count()) {
    const htmlFor = await labelNode.getAttribute("for");
    if (htmlFor) {
      const byId = scope.locator(`[id=${cssString(htmlFor)}]`).first();
      if (await byId.count()) return byId;
    }

    const nested = labelNode.locator(selector).first();
    if (await nested.count()) return nested;

    const parentControl = labelNode.locator("xpath=..").locator(selector).first();
    if (await parentControl.count()) return parentControl;

    const following = labelNode.locator(`xpath=following::*[${xpathCondition(selector)}][1]`).first();
    if (await following.count()) return following;
  }

  throw new Error(`could not find ${selector} for label "${label}"`);
}

function createPass(note, coverage = "behavior") {
  return { pass: true, note, coverage };
}

function createFail(note, coverage = "behavior") {
  return { pass: false, note, coverage };
}

async function scenario(coverage, action) {
  try {
    return createPass(await action(), coverage);
  } catch (error) {
    return createFail(compactError(error), coverage);
  }
}

async function waitFor(action, note, options = {}) {
  const timeout = options.timeout ?? 5000;
  const interval = options.interval ?? 75;
  const deadline = Date.now() + timeout;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const result = await action();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await delay(interval);
  }

  const suffix = lastError ? `: ${compactError(lastError)}` : "";
  throw new Error(`${note} did not happen within ${timeout}ms${suffix}`);
}

async function waitForJsonTestId(page, testId, predicate, note, options) {
  const result = await waitFor(async () => {
    const json = await readJsonTestId(page, testId);
    return predicate(json) ? { value: json } : null;
  }, note, options);
  return result.value;
}

async function expectMainText(page, text, note) {
  return expectVisible(main(page).getByText(text).first(), note);
}

async function clickMainButton(page, name, options = {}) {
  const exact = options.exact ?? typeof name === "string";
  const button = main(page).getByRole("button", { name, exact }).first();
  await expectVisible(button, `button "${String(name)}"`);
  if (options.enabled) {
    await waitFor(async () => ((await button.isEnabled()) ? true : null), `button "${String(name)}" enabled`);
  }
  await button.click();
  return button;
}

async function waitForInputValue(locator, value, note) {
  await waitFor(async () => ((await locator.inputValue()) === value ? true : null), note);
}

async function expectBranchVisible(page, visibleLabel, hiddenLabel) {
  await expectVisible(main(page).getByLabel(visibleLabel), `${visibleLabel} branch input`);
  await waitFor(async () => {
    const hiddenCount = await main(page).getByLabel(hiddenLabel).count();
    return hiddenCount === 0 ? true : null;
  }, `${hiddenLabel} branch hidden`);
}

function ensure(condition, note) {
  if (!condition) throw new Error(note);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cssString(value) {
  return JSON.stringify(String(value));
}

function xpathCondition(selector) {
  switch (selector) {
    case "input, textarea":
      return "self::input or self::textarea";
    case "select":
      return "self::select";
    case 'input[type="file"]':
      return 'self::input[@type="file"]';
    default:
      return "self::input or self::textarea or self::select";
  }
}

function compactError(error) {
  return String(error?.message ?? error).split("\n")[0];
}

// --- route assertions ---

async function assertBasicValidation(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /Basic Validation Test/, "basic validation heading");
    await fillByLabel(page, "Name", "A");
    await expectMainText(page, /Name must be at least 2 characters/, "name validation error");
    await selectByLabel(page, "Role", "admin");
    await expectMainText(page, /role is set to admin/, "admin conditional field copy");
    return "onChange validation error and role-driven conditional field are visible";
  });
}

async function assertOnBlurValidation(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /OnBlur Validation Test/, "onBlur heading");
    await fillByLabel(page, "Username", "ab");
    await fillByLabel(page, "Email", "test@example.com");
    await expectMainText(page, /Username must be at least 3 characters/, "username blur error");
    await fillByLabel(page, "Password", "Password1");
    await expectMainText(page, /This email is already taken/, "async email blur error");
    return "blur validation and async email uniqueness error are visible";
  });
}

async function assertAsyncValidation(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /Async Validation Test/, "async validation heading");
    await fillByLabel(page, "Username", "admin");
    await expectMainText(page, /This username is already taken/, "async username availability error");
    return "debounced async username validation reports a taken username";
  });
}

async function assertFileUpload(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /File Upload Test/, "basic file heading");
    await fillByLabel(page, "Name", "Ada Lovelace");
    await setInputFilesByLabel(page, "Avatar (Single Image)", fixtures.avatarPng);
    await expectMainText(page, /avatar\.png/, "avatar file name");
    await setInputFilesByLabel(page, "Documents (Multiple Files)", [fixtures.noteTxt]);
    await expectMainText(page, /Selected Files \(1\)/, "document selection count");
    await clickMainButton(page, "Submit");

    const result = await waitForJsonTestId(
      page,
      "submit-result",
      (json) =>
        json.name === "Ada Lovelace" &&
        json.avatar?.name === "avatar.png" &&
        json.documents?.count === 1,
      "basic file submit result"
    );

    return `submitted ${result.avatar.name} and ${result.documents.count} document`;
  });
}

async function assertAdvancedFileValidation(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /Advanced File Validation Test/, "advanced file heading");
    await fillByLabel(page, "Name", "Grace Hopper");
    await fillByLabel(page, "Email", "grace@example.com");
    await setInputFilesByLabel(page, "Profile Picture", fixtures.avatarPng);
    await setInputFilesByLabel(page, "Portfolio Images", [fixtures.portfolioPng, fixtures.portfolioJpg]);
    await setInputFilesByLabel(page, "Resume", fixtures.resumePdf);
    await expectMainText(page, /Portfolio Images \(2\/8\)/, "portfolio count");
    await clickMainButton(page, "Submit Application", { enabled: true });

    const result = await waitForJsonTestId(
      page,
      "submit-result",
      (json) =>
        json.profilePicture?.name === "avatar.png" &&
        json.resume?.name === "resume.pdf" &&
        json.portfolio?.count === 2,
      "advanced file submit result"
    );

    return `submitted profile picture, resume, and ${result.portfolio.count} portfolio files`;
  });
}

async function assertZodFileValidation(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /Zod \+ File Validation Test/, "zod file heading");
    await fillByLabel(page, "First Name", "Katherine");
    await fillByLabel(page, "Last Name", "Johnson");
    await fillByLabel(page, "Email", "katherine@example.com");
    await setInputFilesByLabel(page, "Resume", fixtures.resumePdf);
    await setInputFilesByLabel(page, "Portfolio", [fixtures.portfolioPng]);
    await clickMainButton(page, "Submit Application", { enabled: true });

    const result = await waitForJsonTestId(
      page,
      "submit-result",
      (json) =>
        json.firstName === "Katherine" &&
        json.resume?.name === "resume.pdf" &&
        json.portfolio?.count === 1,
      "zod file submit result"
    );

    return `Zod file schema accepted ${result.resume.name} and ${result.portfolio.count} portfolio item`;
  });
}

async function assertComplexArrays(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /Complex Array Test/, "complex array heading");
    await expectMainText(page, /Team Members \(1\)/, "initial team count");
    await clickMainButton(page, "+ Add Member");
    await expectMainText(page, /Team Members \(2\)/, "team count after add");
    await clickMainButton(page, "+ Skill");
    await expectMainText(page, /Skills \(2\)/, "nested skill count after add");
    await clickMainButton(page, "+ Add Task");
    await expectMainText(page, /Tasks \(1\)/, "task count after add");
    await clickMainButton(page, "+ Add Tag");
    await expectMainText(page, /Tags \(1\)/, "tag count after add");
    return "team, nested skill, task, and tag array counts update visibly";
  });
}

async function assertFormHistory(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /Form History Test/, "form history heading");
    const name = await controlByLabel(page, "Name", "input, textarea");
    await waitForInputValue(name, "John Doe", "initial history name");
    await clickMainButton(page, /Create Snapshot/);
    await expectMainText(page, /Snapshots \(1\)/, "snapshot count");
    await clickMainButton(page, /Make Quick Changes/);
    await waitForInputValue(name, "Jane Smith", "quick changes name");
    await clickMainButton(page, /Restore/);
    await waitForInputValue(name, "John Doe", "restored snapshot name");
    return "snapshot create, quick change, and restore update the visible form value";
  });
}

async function assertDiscriminatedUnion(page) {
  return scenario("behavior", async () => {
    await main(page).locator("select").first().selectOption("dog");
    await fillByLabel(page, "Bark", "woof");
    await clickMainButton(page, "Submit");

    const result = await waitForJsonTestId(
      page,
      "submit-result",
      (json) => json.type === "dog" && json.bark === "woof",
      "manual discriminated submit result"
    );

    return `manual union submitted ${result.type} branch`;
  });
}

async function assertAutoDiscriminatedUnion(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /AutoForm with Discriminated Union/, "auto discriminated heading");
    await selectByLabel(page, "type", "dog");
    await fillByLabel(page, "Bark", "woof");
    await fillByLabel(page, "Breed", "corgi");
    await clickMainButton(page, "Submit");

    const result = await waitForJsonTestId(
      page,
      "submit-result",
      (json) => json.type === "dog" && json.bark === "woof" && json.breed === "corgi",
      "auto discriminated submit result"
    );

    return `AutoForm union submitted ${result.type} branch`;
  });
}

async function assertGeneralAutoForm(page) {
  return scenario("behavior", async () => {
    await expectMainText(page, /General AutoForm Test/, "general autoform heading");
    await clickMainButton(page, "Save Profile");
    await expectMainText(page, /Validation Errors/, "general autoform validation errors");
    await expectMainText(page, /Username must be at least 3 characters/, "general autoform username error");
    return "blank submit renders AutoForm validation error summary";
  });
}

async function assertFormSwitchField(page) {
  return scenario("behavior", async () => {
    await selectByLabel(page, "kind", "b");
    await expectBranchVisible(page, "bValue", "aValue");
    await fillByLabel(page, "bValue", "branch b");
    return "field-driven FormSwitch swaps from aValue to bValue";
  });
}

async function assertFormSwitchSelect(page) {
  return scenario("behavior", async () => {
    await selectByLabel(page, "type", "member");
    await expectBranchVisible(page, "memberId", "guestCode");
    await fillByLabel(page, "memberId", "member-42");
    return "selector-driven FormSwitch swaps from guestCode to memberId";
  });
}

async function assertFormSwitchCompat(page) {
  return scenario("behavior", async () => {
    await selectByLabel(page, "kind", "right");
    await expectBranchVisible(page, "right", "left");
    await fillByLabel(page, "right", "compat right");
    return "back-compat FormSwitch props swap from left to right";
  });
}

async function assertUseFieldRerender(page) {
  return scenario("behavior", async () => {
    const aValue = await expectVisible(main(page).locator('[aria-label="a-value"]'), "a-value readout");
    const bCount = await expectVisible(main(page).locator('[aria-label="b-count"]'), "b-count readout");
    const beforeB = Number((await bCount.textContent()) ?? "0");

    await fillByLabel(page, "a", "Alpha");
    await waitFor(async () => ((await aValue.textContent()) === "Alpha" ? true : null), "a-value updates after edit");

    const afterB = Number((await bCount.textContent()) ?? "0");
    ensure(afterB === beforeB, `b-count changed while editing a (${beforeB} -> ${afterB})`);
    return `useField value updated while b-count stayed at ${beforeB}`;
  });
}

async function assertFormControlsLab(page) {
  return scenario("behavior", async () => {
    await expectVisible(main(page).getByTestId("form-controls-lab"), "form controls lab root");
    await clickMainButton(page, "Set Name Ada");
    await waitForJsonTestId(page, "values-json", (json) => json.name === "Ada", "name set via setValue");
    await clickMainButton(page, "Set Many");
    await waitForJsonTestId(
      page,
      "values-json",
      (json) => json.email === "ada@example.com" && json.profile?.city === "Paris",
      "setValues updates email and city"
    );
    await clickMainButton(page, "Set Email Error");
    await waitForJsonTestId(page, "errors-json", (json) => json.email === "Email already taken", "setError updates errors");
    await clickMainButton(page, "Clear Email Error");
    await waitForJsonTestId(page, "errors-json", (json) => !json.email, "clearErrors removes email error");
    await clickMainButton(page, "Focus Email");
    await waitFor(
      async () => ((await main(page).getByTestId("active-field").textContent())?.includes("Email") ? true : null),
      "setFocus moves focus to email"
    );
    await clickMainButton(page, "Submit Form");
    await waitForJsonTestId(
      page,
      "submit-result",
      (json) => json.source === "handleSubmit onValid" && json.success === true,
      "handleSubmit submit result"
    );
    return "value, error, focus, and handleSubmit APIs update JSON panels";
  });
}

async function assertFieldArrayLab(page) {
  return scenario("behavior", async () => {
    await expectVisible(main(page).getByTestId("field-array-lab"), "field array lab root");
    const initialItems = await readJsonTestId(page, "items-json");
    ensure(Array.isArray(initialItems) && initialItems.length === 2, "expected two initial object items");

    await clickMainButton(page, "Append Item");
    await waitForJsonTestId(
      page,
      "items-json",
      (json) => Array.isArray(json) && json.length === 3 && json.some((item) => item.label === "append-1"),
      "append item updates items values"
    );
    await clickMainButton(page, "Update Item");
    await waitForJsonTestId(
      page,
      "items-json",
      (json) => Array.isArray(json) && json[0]?.label === "update-1",
      "update item changes first item"
    );
    await clickMainButton(page, "Append Tag");
    await waitForJsonTestId(
      page,
      "tags-json",
      (json) => Array.isArray(json) && json.length === 2 && json.filter((tag) => tag === "tag-1").length === 2,
      "append tag updates primitive array"
    );
    await clickMainButton(page, "Append Nested Skill");
    await waitForJsonTestId(
      page,
      "nested-skills-json",
      (json) => Array.isArray(json) && json.some((skill) => skill.name === "skill-1"),
      "append nested skill updates nested array"
    );

    const customKeys = await readJsonTestId(page, "custom-key-json");
    ensure(customKeys.every((row) => row._key), "custom key rows did not include _key");
    await waitForJsonTestId(page, "operation-log", (json) => Array.isArray(json) && json.length >= 4, "operation log updates");
    return "object, primitive, nested, and custom-key array panels update";
  });
}

async function assertValidationAdaptersLab(page) {
  return scenario("adapter-shape", async () => {
    await expectVisible(main(page).getByTestId("validation-adapters-lab"), "validation adapters lab root");

    for (const id of ADAPTER_SHAPE_FIXTURES) {
      await expectVisible(
        main(page).getByTestId(`${id}-row`).getByText(/adapter shape fixture/),
        `${id} adapter shape fixture label`
      );
    }

    for (const id of ADAPTER_BRANCHES) {
      const row = main(page).getByTestId(`${id}-row`);
      await expectVisible(row, `${id} adapter row`);
      await row.getByRole("button", { name: `Submit ${id}`, exact: true }).click();
      await waitForJsonTestId(
        page,
        `${id}-result`,
        (json) =>
          json.branch === id &&
          json.success === false &&
          !JSON.stringify(json.errors ?? {}).includes("Submit to validate"),
        `${id} invalid adapter result`
      );
      await row.getByRole("button", { name: `Set ${id} ok`, exact: true }).click();
      await row.getByRole("button", { name: `Submit ${id}`, exact: true }).click();
      await waitForJsonTestId(
        page,
        `${id}-result`,
        (json) => json.branch === id && json.success === true && json.data?.value === "ok",
        `${id} valid adapter result`
      );
    }

    return "adapter-shape labels and invalid/valid branch results are visible";
  });
}

async function assertFileValidatorsLab(page) {
  return scenario("behavior", async () => {
    await expectVisible(main(page).getByTestId("file-validators-lab"), "file validators lab root");
    for (const id of ["image", "avatar", "document", "gallery", "video", "audio", "custom-extension", "custom-count"]) {
      await expectVisible(main(page).getByTestId(`${id}-validator`), `${id} validator label`);
    }

    await setInputFilesByLabel(page, "Image preset", fixtures.portfolioPng);
    await waitFor(
      async () => ((await main(page).getByTestId("image-name-0").textContent()) === "portfolio-one.png" ? true : null),
      "image selected file"
    );
    await waitForJsonTestId(
      page,
      "file-validators-summary-json",
      (json) => json.image?.fileNames?.includes("portfolio-one.png") && json.image?.error === null,
      "image summary is valid"
    );

    await setInputFilesByLabel(page, "Custom count", [fixtures.noteTxt]);
    await expectMainText(page, /Minimum 2 files required/, "custom count minFiles error");
    await waitForJsonTestId(
      page,
      "file-validators-summary-json",
      (json) => json.customCount?.error === "Minimum 2 files required",
      "custom count invalid summary"
    );

    await setInputFilesByLabel(page, "Custom count", [fixtures.noteTxt, fixtures.extraTxt]);
    await waitForJsonTestId(
      page,
      "file-validators-summary-json",
      (json) => json.customCount?.fileNames?.length === 2 && json.customCount?.error === null,
      "custom count valid summary"
    );
    await clickMainButton(page, "Submit file validators");
    await waitForJsonTestId(page, "file-validators-submit-result", (json) => json.status === "valid", "file validators submit result");

    return "file preset labels, minFiles error, recovery, and submit summary are visible";
  });
}

async function assertComponentLab(page) {
  return scenario("behavior", async () => {
    await expectVisible(main(page).getByTestId("component-lab"), "component lab root");
    await expectVisible(main(page).getByTestId("autoform-custom-text-badge"), "custom text component badge");

    await clickMainButton(page, "Show Invalid Field Errors");
    await waitForJsonTestId(page, "field-components-result", (json) => json.status === "error", "field components error result");
    await clickMainButton(page, "Fill Valid Field Values");
    await waitFor(
      async () => ((await main(page).getByTestId("create-field-value").textContent()) === "Component exports" ? true : null),
      "createField value reflects filled field"
    );
    await clickMainButton(page, "Submit Exported Fields");
    await waitForJsonTestId(page, "field-components-result", (json) => json.status === "valid", "field components valid result");

    await clickMainButton(page, "Submit AutoForm");
    await waitForJsonTestId(page, "autoform-error-result", (json) => json.status === "error", "AutoForm error result");
    await clickMainButton(page, "Fill Valid AutoForm Values");
    await waitForJsonTestId(page, "autoform-submit-result", (json) => json.status === "prefilled", "AutoForm prefilled result");
    await clickMainButton(page, "Submit AutoForm");
    await waitForJsonTestId(page, "autoform-submit-result", (json) => json.status === "valid", "AutoForm valid submit result");

    return "exported fields, createField helper, componentMap, and AutoForm results update";
  });
}

// --- driver ---

const fixtures = createFixtureFiles();

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("dialog", (dialog) => dialog.dismiss().catch(() => {}));

  await page.goto(BASE, { waitUntil: "networkidle" });
  const results = [];

  for (const demo of DEMOS) {
    const before = consoleErrors.length;
    const row = {
      id: demo.id,
      label: demo.label,
      pass: false,
      coverage: "unknown",
      note: "",
      shot: `${demo.id}.png`,
    };

    try {
      await clickDemo(page, demo.label);
      const result = await demo.check(page);
      row.pass = result.pass;
      row.note = result.note;
      row.coverage = result.coverage ?? "unknown";
    } catch (error) {
      row.note = `threw: ${compactError(error)}`;
    }

    await page.screenshot({ path: join(OUT, row.shot) }).catch(() => {});
    row.consoleErrors = consoleErrors.length - before;
    results.push(row);
    console.log(`${row.pass ? "PASS" : "FAIL"}  ${demo.label}  [${row.coverage}] - ${row.note}`);
  }

  await browser.close();
  writeReport(results, consoleErrors);
  const failed = results.filter((result) => !result.pass).length;
  process.exit(failed > 0 ? 1 : 0);
}

// Make a string safe for a single markdown table cell: no newlines, no raw
// pipes, and bounded length.
function cell(value) {
  return String(value).replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|").slice(0, 180);
}

function writeReport(results, consoleErrors) {
  const pass = results.filter((result) => result.pass).length;
  const fail = results.length - pass;
  const warn = consoleErrors.length;
  const lines = [
    "# El Form Sweep",
    "",
    `Pass ${pass} / ${results.length}   Fail ${fail}   Console errors ${warn}`,
    "",
    "| Feature | Route | Result | Coverage | Notes | Console | Screenshot |",
    "|---------|-------|--------|----------|-------|---------|------------|",
    ...results.map(
      (result) =>
        `| ${cell(result.label)} | ${cell(result.id)} | ${result.pass ? "PASS" : "FAIL"} | ${cell(result.coverage)} | ${cell(result.note)} | ${result.consoleErrors || 0} | ![](${result.shot}) |`
    ),
  ];

  if (consoleErrors.length) {
    lines.push("", "## Console errors", "", ...consoleErrors.slice(0, 50).map((error) => `- ${error}`));
  }

  writeFileSync(join(OUT, "REPORT.md"), lines.join("\n") + "\n");
  console.log(`\nReport: ${join(OUT, "REPORT.md")}  (${pass}/${results.length} passed)`);
}

run().catch((error) => {
  console.error("Sweep crashed:", error);
  process.exit(2);
});

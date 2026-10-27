#!/usr/bin/env node
// The Crisis Plan exists so its answers can be keyed into CFCR. That only
// holds while the form stays field for field identical to the CFCR Crisis
// Plan (rev. 10/23), so the form itself is the fixture here: add a field,
// drop one, reorder them, change a character limit or rewrite a dropdown,
// and this fails.
const { chromium } = require("playwright");
const { serve, PORT } = require("./serve");

// Every field on the CFCR Crisis Plan (rev. 10/23), page by page, in order.
const EXPECTED = {
  p1: [
    "p1_initial_date", "p1_revision_date",
    "p1_street1", "p1_street2", "p1_apt", "p1_city", "p1_state", "p1_zip", "p1_zip4",
    "p1_emergency_phone", "p1_alt_phone", "p1_clinical_home", "p1_lme", "p1_lme_phone",
    "p1_living_stability", "p1_assist_areas", "p1_assist_other",
    "p1_employer_assist",
    "p1_comm_method", "p1_comm_comments",
    "p1_language",
    "p1_guardian", "p1_lrp_name", "p1_lrp_phone",
    "p1_ins_type", "p1_ins_policy",
    "p1_dx1_code", "p1_dx1", "p1_dx1_date",
    "p1_dx2_code", "p1_dx2", "p1_dx2_date",
    "p1_dx3_code", "p1_dx3", "p1_dx3_date",
    "p1_medical", "p1_dental",
    "p1_meds", "p1_meds_poor",
    "p1_allergies",
    "p1_other_providers",
    "p1_updated",
  ],
  p2: [
    "s1_order", "s1_who", "s1_name", "s1_address", "s1_phone", "s1_consent",
    "s2_order", "s2_who", "s2_name", "s2_address", "s2_phone", "s2_consent",
    "s3_order", "s3_who", "s3_name", "s3_address", "s3_phone", "s3_consent",
    "s4_order", "s4_who", "s4_name", "s4_address", "s4_phone", "s4_consent",
    "s5_order", "s5_who", "s5_name", "s5_address", "s5_phone", "s5_consent",
    "p2_coordinator", "p2_visit", "p2_debrief",
    "p2_doc_behavior", "p2_doc_behavior_notes",
    "p2_doc_suicide", "p2_doc_suicide_notes",
    "p2_doc_wrap", "p2_doc_wrap_notes",
    "p2_doc_futures", "p2_doc_futures_notes",
    "p2_doc_pad", "p2_doc_pad_notes",
    "p2_doc_advance", "p2_doc_advance_notes",
    "p2_updated",
  ],
  p3: [
    "p3_well", "p3_early", "p3_crisis",
    "p3_prevention", "p3_stabilization", "p3_worked",
    "p3_updated",
  ],
};

// CFCR's character limits. It truncates silently at these.
const LIMITS = {
  p1_assist_other: 1000, p1_comm_comments: 1000, p1_medical: 1000, p1_dental: 1000,
  p1_meds: 1000, p1_meds_poor: 1000, p1_allergies: 1000, p1_other_providers: 1000,
  p2_coordinator: 1000, p2_visit: 1000, p2_debrief: 1000,
  p2_doc_behavior_notes: 1000, p2_doc_suicide_notes: 1000, p2_doc_wrap_notes: 1000,
  p2_doc_futures_notes: 1000, p2_doc_pad_notes: 1000, p2_doc_advance_notes: 1000,
  p3_well: 4000, p3_early: 4000, p3_crisis: 1000,
  p3_prevention: 1000, p3_stabilization: 1000, p3_worked: 1000,
};

// CFCR's own option lists. These must not be replaced with invented ones.
const OPTIONS = {
  p1_living_stability: ["Stable", "Unstable"],
  p1_comm_method: ["Verbal", "Nonverbal", "Picture System", "Gestures", "Sound/Gestures", "Other"],
  p1_employer_assist: ["Yes", "No"],
  p1_guardian: ["Yes", "No"],
  p1_updated: ["Yes", "No"],
  p2_updated: ["Yes", "No"],
  p3_updated: ["Yes", "No"],
  p2_doc_behavior: ["Yes", "No"],
  p2_doc_suicide: ["Yes", "No"],
  p2_doc_wrap: ["Yes", "No"],
  p2_doc_futures: ["Yes", "No"],
  p2_doc_pad: ["Yes", "No"],
  p2_doc_advance: ["Yes", "No"],
};

// The fields CFCR renders as dropdowns, which the app marks rather than
// guessing their contents.
const DROPDOWNS = [
  "p1_clinical_home", "p1_ins_type", "p1_language", "p1_lme", "p1_lme_phone",
  "s1_who", "s2_who", "s3_who", "s4_who", "s5_who",
];

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) fails++;
  console.log((cond ? "PASS  " : "FAIL  ") + msg);
};

(async () => {
  const server = serve();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("pageerror", (e) => { fails++; console.log("FAIL  page error: " + e.message); });

  const base = process.env.BASE_URL || "http://127.0.0.1:" + PORT;
  await page.goto(base + "/crisis-plan.html", { waitUntil: "load" });
  await page.waitForSelector("#root h1", { timeout: 20000 });

  const model = await page.evaluate(() => {
    const sections = [];
    const all = [];
    CRISIS_SECTIONS.forEach((s) => {
      sections.push({
        id: s.id,
        page: s.cfcrPage || null,
        fieldIds: s.fields.filter((f) => f.type !== "note").map((f) => f.id),
      });
      s.fields.forEach((f) =>
        all.push({
          id: f.id,
          type: f.type,
          label: f.label || null,
          cfcr: f.cfcr || null,
          max: f.max || null,
          hint: f.hint || null,
          body: f.body || null,
          dropdown: !!f.dropdown,
          req: !!f.req,
          options: (f.options || []).map((o) => (typeof o === "string" ? o : o.label)),
        })
      );
    });
    return { sections, all };
  });

  const byId = Object.fromEntries(model.all.map((f) => [f.id, f]));

  for (const id of ["p1", "p2", "p3"]) {
    const got = model.sections.find((s) => s.id === id).fieldIds;
    const want = EXPECTED[id];
    const missing = want.filter((x) => !got.includes(x));
    const extra = got.filter((x) => !want.includes(x));
    ok(missing.length === 0, id + ": no CFCR field missing" + (missing.length ? " (" + missing.join(", ") + ")" : ""));
    ok(extra.length === 0, id + ": nothing added beyond CFCR" + (extra.length ? " (" + extra.join(", ") + ")" : ""));
    ok(JSON.stringify(got) === JSON.stringify(want), id + ": fields in CFCR order");
  }

  const outside = model.sections.filter((s) => !s.page).flatMap((s) => s.fieldIds);
  ok(
    JSON.stringify(outside) === JSON.stringify(["child_name", "child_age"]),
    "only child_name and child_age sit outside CFCR (" + outside.join(", ") + ")"
  );

  const badMax = Object.keys(LIMITS).filter((id) => !byId[id] || byId[id].max !== LIMITS[id]);
  ok(badMax.length === 0, "CFCR character limits carried" + (badMax.length ? " (wrong: " + badMax.join(", ") + ")" : ""));

  const badOpts = Object.keys(OPTIONS).filter(
    (id) => !byId[id] || JSON.stringify(byId[id].options) !== JSON.stringify(OPTIONS[id])
  );
  ok(badOpts.length === 0, "CFCR option lists unchanged" + (badOpts.length ? " (differs: " + badOpts.join(", ") + ")" : ""));

  const marked = model.all.filter((f) => f.dropdown).map((f) => f.id).sort();
  ok(
    JSON.stringify(marked) === JSON.stringify(DROPDOWNS.slice().sort()),
    "exactly CFCR's dropdown fields are tagged (" + marked.join(", ") + ")"
  );

  // Reworded prompts must keep CFCR's own wording alongside, or the record
  // copy stops matching the screen a clinician is typing into.
  const reworded = model.all.filter((f) => f.label && /\{child/.test(f.label) && f.type === "area");
  const noCfcr = reworded.filter((f) => !f.cfcr);
  ok(noCfcr.length === 0, "every reworded narrative prompt carries CFCR's wording" + (noCfcr.length ? " (" + noCfcr.map((f) => f.id).join(", ") + ")" : ""));

  // The form is for use during a visit, not for reading.
  const longHints = model.all.filter((f) => f.hint && f.hint.split(/\s+/).length > 20);
  ok(longHints.length === 0, "no hint over 20 words" + (longHints.length ? " (" + longHints.map((f) => f.id).join(", ") + ")" : ""));
  const notes = model.all.filter((f) => f.type === "note");
  ok(notes.length <= 3, "at most 3 explanatory notes in the form (" + notes.length + ")");
  const longNotes = notes.filter((f) => (f.body || "").split(/\s+/).length > 45);
  ok(longNotes.length === 0, "no note over 45 words" + (longNotes.length ? " (" + longNotes.map((f) => f.id).join(", ") + ")" : ""));

  console.log(
    "      " + model.all.filter((f) => f.type !== "note").length + " fields, " +
    notes.length + " notes, " + model.all.filter((f) => f.req).length + " required"
  );

  await browser.close();
  server.close();
  console.log(fails ? "\n" + fails + " failed" : "\nField set matches CFCR");
  process.exit(fails ? 1 : 0);
})();

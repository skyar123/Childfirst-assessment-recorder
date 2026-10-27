#!/usr/bin/env node
// Behaviour of the Crisis Plan page: the two outputs, and the six defects
// found reviewing the branch before it merged. Each defect check is written
// so it fails against the code as it stood before the fix.
const { chromium } = require("playwright");
const { serve, PORT } = require("./serve");

const KEY = "crisisplan:responses:v1";

// A complete CFCR form, so the readiness check can reach all green.
const FILLED = {
  child_name: "Doe, Jamie", child_age: "3 years 2 months",
  p1_initial_date: "2026-01-05",
  p1_street1: "12 Example Rd", p1_city: "Anytown", p1_state: "NC", p1_zip: "00000",
  p1_emergency_phone: "000-555-0101", p1_clinical_home: "Example Behavioral Health",
  p1_lme: "Vaya Health", p1_lme_phone: "000-555-0102",
  p1_living_stability: "Stable", p1_assist_areas: ["Children"], p1_employer_assist: "Yes",
  p1_comm_method: ["Verbal"], p1_comm_comments: "Goes quiet and hides behind a parent.",
  p1_language: "English", p1_guardian: "No",
  p1_lrp_name: "Doe, Alex", p1_lrp_phone: "000-555-0103",
  p1_ins_type: "NC Medicaid", p1_ins_policy: "000000000",
  p1_dx1_code: "F94.1", p1_dx1: "Reactive attachment disorder", p1_dx1_date: "2026-01-02",
  p1_medical: "Born at 34 weeks.", p1_dental: "No dental concerns reported.",
  p1_meds: "No current medications.", p1_meds_poor: "No poorly tolerated medications reported.",
  p1_allergies: "Amoxicillin, full-body rash.", p1_other_providers: "Early Intervention (CDSA).",
  p1_updated: "Yes",
  s1_order: "1", s1_who: "Grandmother", s1_name: "Doe, Marie", s1_phone: "000-555-0104", s1_consent: "Yes",
  s2_order: "2", s2_who: "Neighbour", s2_name: "Roe, Dana", s2_phone: "000-555-0105", s2_consent: "No",
  p2_coordinator: "Example FRP, 000-555-0106.", p2_visit: "A parent stays overnight.",
  p2_debrief: "Example FRP within 3 business days.",
  p2_doc_behavior: "No", p2_doc_suicide: "No", p2_doc_wrap: "No",
  p2_doc_futures: "No", p2_doc_pad: "No", p2_doc_advance: "No",
  p2_updated: "Yes",
  p3_well: "Narrates everything. Sleeps through.",
  p3_early: "Clingier, wakes at night.",
  p3_crisis: "Screams and cannot be reached.",
  p3_prevention: "A warning before every transition.",
  p3_stabilization: "Pick her up, quiet room, the grey blanket.",
  p3_worked: "Do not raise your voice. Do not hold her down.",
  p3_updated: "Yes",
};

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) fails++;
  console.log((cond ? "PASS  " : "FAIL  ") + msg);
};

(async () => {
  const server = serve();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));

  const base = process.env.BASE_URL || "http://127.0.0.1:" + PORT;
  const load = async (answers) => {
    await page.goto(base + "/crisis-plan.html", { waitUntil: "load" });
    await page.waitForSelector("#root h1", { timeout: 20000 });
    if (answers) {
      await page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, answers]);
      await page.reload({ waitUntil: "load" });
      await page.waitForSelector("#root h1", { timeout: 20000 });
      await page.waitForTimeout(400);
    }
  };

  // ── The record copy is the point of the tool ──────────────────────────
  await load(FILLED);
  const record = await page.evaluate(() => summaryText(JSON.parse(localStorage.getItem("crisisplan:responses:v1"))));
  ok(/CRISIS PLAN, PAGE 1/.test(record) && /CRISIS PLAN, PAGE 3/.test(record),
    "record copy is grouped by CFCR page");
  ok(/What I am like when I am feeling well/.test(record),
    "record copy uses CFCR's label, not the reworded prompt");
  ok(/\[DIAGNOSES\]/.test(record) && /\[ALLERGIES\]/.test(record),
    "record copy keeps CFCR's group headings");

  // ── Readiness check ───────────────────────────────────────────────────
  const checks = await page.evaluate(() =>
    readinessChecks(JSON.parse(localStorage.getItem("crisisplan:responses:v1")))
      .map((c) => ({ label: c.label, ok: c.ok })));
  ok(checks.every((c) => c.ok),
    "a complete CFCR form passes all " + checks.length + " readiness checks" +
    (checks.every((c) => c.ok) ? "" : " (red: " + checks.filter((c) => !c.ok).map((c) => c.label).join("; ") + ")"));

  // Defect: the blank-areas check counted the optional page 2 Notes, which
  // CFCR is content to leave blank, so it could never go green.
  const blank = checks.find((c) => /No blank text areas/.test(c.label));
  ok(blank && blank.ok, "optional page 2 Notes left blank do not hold the readiness check red");

  // Defect: the group sat only on the optional Calling order field, so leaving
  // it blank dropped the support headers and ran the supports together.
  const noOrder = await page.evaluate(() => {
    const a = JSON.parse(localStorage.getItem("crisisplan:responses:v1"));
    a.s1_order = ""; a.s2_order = "";
    return summaryText(a);
  });
  ok(/\[SUPPORT 1\]/.test(noOrder) && /\[SUPPORT 2\]/.test(noOrder),
    "support headers survive a blank Calling order");

  // Defect: the live counter measured the raw string while the readiness check
  // measured the trimmed one, so they could disagree about the CFCR limit.
  const padded = { ...FILLED, p3_crisis: "  " + "x".repeat(1000) + "  " };
  await load(padded);
  const overCheck = await page.evaluate(() =>
    overLimit(JSON.parse(localStorage.getItem("crisisplan:responses:v1"))).some((o) => o.f.id === "p3_crisis"));
  await page.getByRole("button", { name: /Crisis Plan, page 3/ }).click();
  await page.waitForTimeout(600);
  const counter = await page.locator("div.mb-8")
    .filter({ hasText: "What one may observe when" })
    .filter({ has: page.locator("textarea") })
    .first().locator("div.text-right").first().textContent();
  ok(overCheck === false && /^\s*1000 \/ 1000\s*$/.test(counter),
    "counter and readiness check agree on the CFCR limit (counter read " + JSON.stringify(counter.trim()) + ")");

  // Defect: a support hidden by the progressive disclosure still appeared on
  // the family copy and in the readiness counts.
  await load({ ...FILLED, s1_name: "" });
  const hidden = await page.evaluate(() => {
    const a = JSON.parse(localStorage.getItem("crisisplan:responses:v1"));
    let f2 = null;
    CRISIS_SECTIONS.forEach((s) => s.fields.forEach((f) => { if (f.id === "s2_name") f2 = f; }));
    return { visible: isVisible(f2, a), listed: supportList(a).map((x) => x.name) };
  });
  ok(hidden.visible === false, "clearing support 1's name hides support 2 in the form");
  ok(hidden.listed.length === 0, "and drops it from the family copy too (" + JSON.stringify(hidden.listed) + ")");

  // Defect: the family copy's empty state was unreachable, because the fixed
  // 988 and 911 rows always populated the first block.
  const emptyState = await page.evaluate(() => {
    const blocks = familyCardBlocks({});
    return blocks.reduce((n, b) => n + b.items.filter((i) => !i.static).length, 0);
  });
  ok(emptyState === 0, "an empty plan yields no real family-copy rows, so the empty state can show");

  // ── The family copy, and printing it ──────────────────────────────────
  await load(FILLED);
  await page.getByRole("button", { name: /Family copy/ }).click();
  await page.waitForTimeout(600);
  const card = await page.locator("#familycard").innerText();
  ok(/Jamie/.test(card), "family copy is titled for the child");
  ok(/Doe, Marie/.test(card) && /000-555-0104/.test(card), "supports carry over in calling order");
  ok(/Amoxicillin/.test(card), "allergies carry over");
  ok(/grey blanket/.test(card), "what to do carries over in the caregiver's words");
  ok(!/\{child/.test(card), "no unresolved name tokens");

  // Defect: the print rule hid the card's own ancestor, so Print produced a
  // blank page. Checked in print media, where the rule actually applies.
  await page.emulateMedia({ media: "print" });
  const printed = await page.evaluate(() => {
    document.body.classList.add("printing-card");
    const el = document.getElementById("familycard");
    const hiddenBy = [];
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      if (getComputedStyle(n).display === "none") hiddenBy.push(n.id || n.className || n.tagName);
    }
    const out = { hiddenBy, length: el ? el.innerText.length : 0 };
    document.body.classList.remove("printing-card");
    return out;
  });
  await page.emulateMedia({ media: null });
  ok(printed.hiddenBy.length === 0 && printed.length > 100,
    "printing keeps the family card displayed" + (printed.hiddenBy.length ? " (hidden by " + printed.hiddenBy.join(", ") + ")" : ""));

  // ── Autosave ──────────────────────────────────────────────────────────
  await page.goto(base + "/crisis-plan.html", { waitUntil: "load" });
  await page.waitForSelector("#root h1", { timeout: 20000 });
  await page.waitForTimeout(500);
  ok(/Resume crisis plan/.test(await page.locator("body").innerText()),
    "answers survive a reload");

  await browser.close();
  server.close();
  if (errs.length) { fails += errs.length; console.log("\nconsole/page errors:\n" + errs.join("\n")); }
  console.log(fails ? "\n" + fails + " failed" : "\nAll behaviour checks passed");
  process.exit(fails ? 1 : 0);
})();

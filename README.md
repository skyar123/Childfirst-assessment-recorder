# Child First Assessment Recorder

Phone-first assessment tools for the Child First program, built to be **handed to a
caregiver**. One question at a time, large tap targets, plain language, and a warm
close — with scores kept behind a provider code so a caregiver never sees a number
attached to their family.

The tools **record responses and total them**. They do not interpret. Standard
scores, percentiles, cut-points, and every clinical decision remain the
responsibility of the clinician, working from the official manual for each
instrument.

## What's included

| Instrument | Items | Completed by | What it captures |
| --- | --- | --- | --- |
| **PQ** — Parent Questionnaire | 33 | Caregiver | Family risk and protective factors across 14 domains |
| **SNIFF** — Service Needs Inventory for Families | 78 | Caregiver | Service needs across eight domains, and which the family wants help getting. **English and Spanish** |
| **M-CHAT-R** — Modified Checklist for Autism in Toddlers, Revised | 20 | Caregiver | Autism spectrum risk, ages 16–30 months |
| **BITSEA** — Brief Infant-Toddler Social and Emotional Assessment | 42 + 2 | Caregiver | Problem behaviours and social-emotional competence, ages 12–35 months. **English and Spanish** |
| **PSI-4-SF** — Parenting Stress Index, Short Form | 36 | Caregiver | Parent Distress, Parent-Child Dysfunctional Interaction, Difficult Child |
| **PKBS-2** — Preschool and Kindergarten Behavior Scales | 76 | Caregiver | Social Skills and Problem Behavior |
| **CESD-R** — CES Depression Scale, Revised | 20 | Caregiver | Caregiver depression across nine symptom domains |
| **CCA** — Comprehensive Child First Assessment | 11 sections | Clinician | Risk and protective factors, mental status, developmental and health history, formulation, treatment recommendations |
| **Crisis Plan** — CFCR Crisis Plan (rev. 10/23) | 3 CFCR pages | Clinician, with the caregiver | The CFCR fields, in CFCR's order, worded for a young child. Copies out for data entry, and prints a plain-language page for the family |

## The handoff

Everything about the caregiver-facing flow is built around one moment: giving
someone your phone and asking them to answer questions about the hardest parts of
their life.

**Setup → Title card → Questions → Thank you → 🔒 Provider snapshot**

- **The Start button is the first thing on the setup screen.** Big, dark, unmissable,
  above every other control. No scrolling past a question editor to find it.
- **The question editor is collapsed by default.** A caregiver must never land in a
  screen full of move-up arrows and delete buttons. It's behind a disclosure at the
  bottom, for when you actually need it.
- **A title card opens every instrument** — one sentence on what it covers and why it
  matters, plus item count, response scale, and how long it takes. Nobody should be
  handed a phone without knowing what they're about to be asked.
- **One tap per question.** Auto-advance is on by default: tapping an answer moves to
  the next question, so a caregiver taps once instead of twice. Turn it off in Handoff
  if you'd rather they confirm each one.
- **"I'd rather not answer this"** appears on the PQ. The instrument is explicitly
  about risks *the family feels comfortable sharing*, so a real skip option is truer
  to it than an implied refusal. Skips are recorded as skips and never scored as No.
  The M-CHAT-R has no skip — its terms require it be used in its entirety.
- **Spanish, end to end.** The BITSEA and the SNIFF ship with their published Spanish
  parent forms, and every caregiver-facing screen — title card, questions, response
  options, examples, write-in prompts, navigation, the thank-you — follows the language
  you pick in Handoff. Clinician screens stay in English. Other instruments show no
  toggle, because inventing a translation of a validated instrument would not be safe.
- **Progress is honest and encouraging** — "Question 12 of 33" with a bar, and a quiet
  "Halfway there" / "Last one" at the milestones.
- **Back always works**, so a caregiver can fix an answer without starting over.
- **The question is all a caregiver sees.** No subscale or section heading sits above
  it. "Externalizing Problems" printed over a question about their child hands them a
  judgment they never asked for, and it can shade the answer that follows. Sections
  still drive the scoring, and they still appear on the provider snapshot.
- **Nothing is lost by leaving.** Answers save as they are tapped. A reload, a locked
  screen, or a switched app comes back to the same question.
- **The thank-you screen is the terminus.** Confetti, a drawn checkmark, 🎉, and real
  gratitude — no score, no interpretation, nothing that reads as a verdict on their
  parenting. It thanks them, says their answers are saved, and asks them to hand the
  device back — it makes no promise about what happens next, because that is the
  clinician's conversation to have, not a screen's. Motion is skipped entirely for
  anyone whose system requests reduced motion.

## The provider code

Results sit behind a 4-digit code (**`1234`** by default). From the thank-you screen,
"Provider access" opens a keypad; the wrong code refuses and clears.

**This is a courtesy lock, not a security boundary.** The code lives in the page's
JavaScript, so anyone who views source can read it. It exists to stop a caregiver
holding the phone from tapping into the scores — which is exactly the threat it needs
to handle — and nothing more. Do not treat it as protecting anything from a
determined reader.

To change it, edit `CLINICIAN_CODE` near the top of the script block in `index.html`.

## Copy for the record

"Copy for the record" on the provider snapshot copies plain text: the header, the
totals and any alerts, then **every item with its coded value** — the number that goes
in the box, in that instrument's own coding (PSI-4-SF 1–5 with Strongly Agree high,
PKBS-2 0–3, CESD-R 0–3, BITSEA 0–2, PQ 1/0, M-CHAT-R 1 for a risk response, SNIFF 1–4
for the paper form's four columns left to right, so `3` is a requested new service).
Codes read straight down a column, and a final **Codes in item order** line lists them
as `1=3  2=0  …` for entry into CFCR without scrolling the list. Unanswered items are
`-`, skips are `skip`, and the BITSEA "no contact with other children" is `N`. Items
carrying a write-in show it after the answer.

## How scoring works

Each instrument computes **raw totals only**.

- **PQ** — 14 lettered sections, each worth at most 1 point, for a maximum of 14.
  Most score 1 for *any* Yes. Two are reverse-scored: **C** (Employment and Education)
  scores 1 only when all three are No, and **G** (Caregiver Support) scores 1 for a No.
  A **positive screen** is 3 or more points, *or* any point in one of the five starred
  auto-positive sections — B (Behavior and Feelings), D (Caregiver Feelings),
  H (Household Safety), J (Substance Use), L (Child Welfare) — *or* any clinical
  concern regardless of score. The snapshot surfaces condensed **follow-up prompts**
  from the Child First Brief Guide for every section that scored: conversation
  openers, never a script to read aloud.
- **SNIFF** — not a screen and not scored. 78 services across eight domains, each
  answered with one of the paper form's four columns: had it in the past, have it now,
  **want help getting it**, or do not want it. Only the third response counts, so the
  total is the count of **new services requested**, broken down by domain. The
  snapshot lists every requested service by its form number (`I.2`, `VIII.14`) for
  entry into CFCR, alongside the service-need statuses (Met, Not met, In-progress)
  and the fixed not-met reasons those needs have to carry. Requests under
  *Help because I do not feel safe in my home*, *Domestic violence shelter*,
  *Housing assistance*, and *Family shelter* are raised on their own. Items that
  ask for a write-in on the paper form — area of concern, who in the family, which
  *Other* service — get a text field under the options, and auto-advance is
  suppressed on those so nobody is moved on mid-sentence. The two CFCR-only
  responses (*does not want service BUT team recommends*, *Do not know*) and the
  service-need status are clinician entries in CFCR, not answers a caregiver gives,
  so the app names them rather than collecting them.
- **BITSEA** — 42 items scored 0/1/2, split into a **Problem Total** (31 items, max 62)
  and a **Competence Total** (11 items, max 22); they are judged separately and in
  opposite directions. Problem **at or above** its cut score is a Possible Problem
  (75th percentile); Competence **at or below** its cut is a Possible Deficit/Delay
  (15th percentile). Cut scores vary by sex and by 6-month age band, so the setup
  screen asks for the child's **adjusted age in months** (adjust for prematurity first)
  and sex — without them the totals still compute but no cut is applied. Items 19 and
  27 offer **"No contact with other children"**, recorded as missing rather than zero.
  Following the manual, a total is **not computed** when more than 5 Problem or more
  than 2 Competence items are missing. The 17 items flagged on the score summary are
  tracked, and three or more raise an autism-related note — presence on Problem items,
  *absence* on Competence items. The two caregiver-worry ratings sit outside both
  totals. Published norms stop at 35 months; Child First's author-supplied norms to 48
  months are not built in, and the app says so rather than guessing.
- **M-CHAT-R** — a response of **No** indicates risk on every item except 2, 5 and 12,
  where **Yes** does. 0–2 low risk; 3–7 medium, administer the M-CHAT-R/F Follow-Up
  interview on the failed items only, and refer if it stays at 2 or higher; 8–20 high,
  where it is acceptable to bypass the Follow-Up and refer immediately. The snapshot
  lists exactly which items to carry into the Follow-Up.
- **PSI-4-SF** — five-point scale, Strongly Agree 5 down to Strongly Disagree 1, with
  three custom-choice items carrying their own scores. Subscale totals plus Total Stress.
- **PKBS-2** — four-point scale, Never 0 up to Often 3. Subscale totals plus Social
  Skills and Problem Behavior composites.
- **CESD-R** — five options mapped to **0/1/2/3/3**; the top two both score 3, per the
  Child First score sheet rather than the 0–4 headers printed on the form. Nine domains
  and a total out of 60, against both cutoffs (further investigation above 10, clinical
  threshold above 16). **Any endorsement of item 14 or 15 raises a suicidal-ideation
  alert regardless of the total.**
- **CCA** — not scored. Tracks required fields, per-section completion, and conditional
  follow-ups, and produces a summary for the record.
- **Crisis Plan** — not scored. Tracks required fields, counts each field against CFCR's
  character limit, and runs a ten-item readiness check: the plan date, all three page
  attestations, clinical home and LME-MCO, the legally responsible person, a support with a
  phone, consent answered for every support named, allergies and medications, page 3
  complete, nothing over a character limit, and no blank text areas.

## The Crisis Plan

CFCR's Crisis Plan (rev. 10/23) is written in the first person, for an adult planning
their own crisis: *what I am like when I am feeling well*, *who will visit me while I am
hospitalized*. A Child First client is three years old, so filling it in means
translating every prompt on the fly, and a form translated on the fly ends up describing
the caregiver instead of the child.

`crisis-plan.html` is the same form, not a bigger one. Same fields, same order, same
option lists, same character limits, grouped into CFCR's three pages, so the record copy
reads straight down each page as you key it in. What changes:

- **The prompts name the child.** Type the name once and it resolves into every prompt
  after it: *What `<child>` is like when doing well*. Where a prompt is reworded,
  CFCR's exact wording shows underneath, and the record copy uses CFCR's label, not the
  reworded one.
- **Six prompts move from first to third person**, since the caregiver and clinician are
  answering on the child's behalf. A short note on page 3 says so.
- **The hints are CFCR's own instruction text**, trimmed, with one child-specific line
  where it helps: *"Children" means the siblings at home*, *answer for this child's
  current ability, not their age*, *a minor cannot execute a PAD*.
- **Character limits are counted as you type**, and flagged on review, because CFCR
  truncates at 1000 or 4000 and nobody notices until the text is gone.
- **CFCR's six dropdown fields are marked as dropdowns.** The printed form does not show
  their option lists, so rather than invent them those fields stay open here and the tag
  says to pick the closest match at entry. Give me the real lists and they become
  dropdowns in the app too.
- **Narrative fields carry a one-tap "nothing to report"**, so a reviewer never meets a
  blank.
- **The family copy** reorders the same answers into a plain-language page for the
  caregiver: who to call, a good day, the early signs, what a crisis looks like, what
  helps, what a responder needs to know. It asks no extra questions. It prints on its own
  and copies as text for a phone.

Two outputs: **Copy for the record** for CFCR, and the **family copy** for the fridge.

## Where the answers live

Nothing is transmitted anywhere. No server, no analytics, no network request carrying
a response.

- **The caregiver instruments** — answers autosave to `localStorage` and stay there
  until someone deletes them by hand. Reloading, closing the tab, or backgrounding the
  browser mid-questionnaire costs nothing: a reload lands the caregiver back on the
  question they were on. Deleting takes two taps, in one of two places — the **Saved on
  this device** panel on the start page, or **Delete saved answers** on that
  instrument's setup screen. "Start a new session" also clears the saved answers, and
  asks twice before it does. Your *edits to a question bank* persist separately.
- **CCA** and the **Crisis Plan** — answers autosave to `localStorage` so a long document can
  be paused and resumed. They stay on that device, in that browser. "Clear all answers"
  erases them.

Saved answers are unencrypted and readable by anyone with the unlocked device. One
device holds one session per instrument, so start a new session before handing the
phone to the next family.

Treat these as a recording convenience, not as a record. The clinical record is the
record.

## Instrument licensing — read before deploying publicly

**M-CHAT-R/F.** © 2009 Diana Robins, Deborah Fein, & Marianne Barton. Free for
clinical, research, and educational use. The terms require written permission to
reproduce it electronically for use by others — **permission has been obtained.** Items
and item order are reproduced unmodified and the copyright notice travels with the
instrument, as the terms also require.

**BITSEA.** © 2006, 2002 Yale University and the University of Massachusetts, published
by Pearson (PsychCorp); authors Briggs-Gowan & Carter. The printed form carries a
notice that no part may be reproduced or transmitted electronically without written
permission from the copyright owner, and the cut scores encoded here come from the
Parent Score Summary. Confirm your permission covers **electronic** reproduction
specifically, not only photocopying, before this reaches a public URL.

**PSI-4-SF** is published by Psychological Assessment Resources, Inc.; **PKBS-2** by
PRO-ED, Inc. Both are copyrighted. These pages record responses and do not reproduce
their manuals, norms, or conversion tables — convert raw scores using the official
materials.

**PQ** and the **SNIFF** are Child First's own instruments; the SNIFF form is
© Child First 2017, and the Spanish parent form here is the 2017 CFCR revision.
**CESD-R** is public domain:

> Eaton, W. W., Smith, C., Ybarra, M., Muntaner, C., & Tien, A. (2004). Center for
> Epidemiologic Studies Depression Scale: review and revision (CESD and CESD-R). In
> M. E. Maruish (Ed.), *The Use of Psychological Testing for Treatment Planning and
> Outcomes Assessment* (3rd ed.), Volume 3: Instruments for Adults, pp. 363–377.
> Mahwah, NJ: Lawrence Erlbaum.

### Never commit completed forms

A filled-in assessment is PHI: a child's name, date of birth, and clinical responses.
Nothing in this repository should ever contain real client data — not as a test
fixture, not as an example, not in a screenshot. The instruments here are blank forms
and scoring logic only.

## Running it

Static HTML. No build step, no install, no server code.

```sh
git clone https://github.com/skyar123/Childfirst-assessment-recorder.git
cd Childfirst-assessment-recorder
python3 -m http.server 8000
```

Then open <http://localhost:8000>. React, ReactDOM, Babel Standalone, and Tailwind
load from CDNs, so a first load needs a network connection.

## Files

```
index.html           All seven caregiver instruments, plus the dashboard
cca-assessment.html  Comprehensive Child First Assessment (clinician)
crisis-plan.html     Crisis Plan for a young child (clinician, with the caregiver)
404.html             Not-found page
images/logo.svg      Favicon
netlify.toml         Publish config, security headers, redirects
```

`index.html` is one React app. Everything that differs between instruments — question
bank, scoring function, colour, copy — lives in the `INSTRUMENTS` registry, and a
single `Recorder` component drives all of them. **Adding an instrument means adding a
question bank, a scorer that returns `{ headline, rows, alerts, followUps }`, and a
registry entry.** Nothing else changes.

Each instrument is addressable directly: `#pq`, `#sniff`, `#mchat`, `#bitsea`, `#psi`, `#pkbs`, `#cesdr`.
The CCA and the Crisis Plan are separate pages because they are a different kind of
instrument: sections and conditional fields rather than a flat item list, and completed by
the clinician. They share a section engine of their own, a `SECTIONS` array of typed
fields, `showIf` conditions, and a summary builder.

## Deploying

Netlify serves the repository root as-is. `netlify.toml` sets security headers,
redirects the legacy `/assessments.html` path to the root, and defines a Content
Security Policy scoped to the CDNs these pages use. The policy allows `'unsafe-eval'`
because Babel Standalone compiles the JSX in the browser.

The pages are marked `noindex, nofollow`. Given the licensing note above and the fact
that a public URL is all anyone needs, put the deployment behind Netlify password
protection or an access control list rather than leaving it open.

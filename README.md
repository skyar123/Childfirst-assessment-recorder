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
| **M-CHAT-R** — Modified Checklist for Autism in Toddlers, Revised | 20 | Caregiver | Autism spectrum risk, ages 16–30 months |
| **BITSEA** — Brief Infant-Toddler Social and Emotional Assessment | 42 + 2 | Caregiver | Problem behaviours and social-emotional competence, ages 12–35 months. **English and Spanish** |
| **PSI-4-SF** — Parenting Stress Index, Short Form | 36 | Caregiver | Parent Distress, Parent-Child Dysfunctional Interaction, Difficult Child |
| **PKBS-2** — Preschool and Kindergarten Behavior Scales | 76 | Caregiver | Social Skills and Problem Behavior |
| **CESD-R** — CES Depression Scale, Revised | 20 | Caregiver | Caregiver depression across nine symptom domains |
| **CCA** — Comprehensive Child First Assessment | 11 sections | Clinician | Risk and protective factors, mental status, developmental and health history, formulation, treatment recommendations |

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
- **Spanish, end to end.** The BITSEA ships with the published Spanish parent form, and
  every caregiver-facing screen — title card, questions, response options, navigation,
  the thank-you — follows the language you pick in Handoff. Clinician screens stay in
  English. Other instruments show no toggle, because inventing a translation of a
  validated instrument would not be safe.
- **Progress is honest and encouraging** — "Question 12 of 33" with a bar, and a quiet
  "Halfway there" / "Last one" at the milestones.
- **Back always works**, so a caregiver can fix an answer without starting over.
- **The thank-you screen is the terminus.** Confetti, a drawn checkmark, 🎉, and real
  gratitude — no score, no interpretation, nothing that reads as a verdict on their
  parenting. It asks them to hand the device back. Motion is skipped entirely for
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

## Where the answers live

Nothing is transmitted anywhere. No server, no analytics, no network request carrying
a response.

- **The five caregiver instruments** — answers exist only in the open tab. Closing or
  reloading discards them. Copy the snapshot before leaving the results screen. Only
  your *edits to a question bank* persist, in `localStorage`.
- **CCA** — answers autosave to `localStorage` so a long assessment can be paused and
  resumed. They stay on that device, in that browser. "Clear all answers" erases them.

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

**PQ** is Child First's own instrument. **CESD-R** is public domain:

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
index.html           All six caregiver instruments, plus the dashboard
cca-assessment.html  Comprehensive Child First Assessment (clinician)
404.html             Not-found page
images/logo.svg      Favicon
netlify.toml         Publish config, security headers, redirects
```

`index.html` is one React app. Everything that differs between instruments — question
bank, scoring function, colour, copy — lives in the `INSTRUMENTS` registry, and a
single `Recorder` component drives all of them. **Adding an instrument means adding a
question bank, a scorer that returns `{ headline, rows, alerts, followUps }`, and a
registry entry.** Nothing else changes.

Each instrument is addressable directly: `#pq`, `#mchat`, `#bitsea`, `#psi`, `#pkbs`, `#cesdr`.
The CCA is a separate page because it is a different kind of instrument — sections and
conditional fields rather than a flat item list, and completed by the clinician.

## Deploying

Netlify serves the repository root as-is. `netlify.toml` sets security headers,
redirects the legacy `/assessments.html` path to the root, and defines a Content
Security Policy scoped to the CDNs these pages use. The policy allows `'unsafe-eval'`
because Babel Standalone compiles the JSX in the browser.

The pages are marked `noindex, nofollow`. Given the licensing note above and the fact
that a public URL is all anyone needs, put the deployment behind Netlify password
protection or an access control list rather than leaving it open.

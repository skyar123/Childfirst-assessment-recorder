# Child First Assessment Recorder

Phone-first digital response recorders and raw score calculators for the clinical
instruments used in the Child First program. Built to be handed to a caregiver on
a phone: one question at a time, large tap targets, no scrolling through a grid of
tiny radio buttons on a paper form.

The tools **record responses and total them**. They do not interpret. Standard
scores, percentiles, and every clinical decision remain the responsibility of the
assessing clinician, working from the official manual for each instrument.

## What's included

| Instrument | Items | What it captures |
| --- | --- | --- |
| **PSI-4-SF** — Parenting Stress Index, 4th Ed., Short Form | 36 | Parent Distress, Parent-Child Dysfunctional Interaction, Difficult Child |
| **PKBS-2** — Preschool and Kindergarten Behavior Scales, 2nd Ed. | 76 | Social Skills (Cooperation, Interaction, Independence) and Problem Behavior (Externalizing, Internalizing) |
| **CESD-R** — Center for Epidemiologic Studies Depression Scale, Revised | 20 | Caregiver depression across nine symptom domains |
| **CCA** — Comprehensive Child First Assessment | 11 sections | Risk and protective factors, mental status, developmental and health history, formulation, treatment recommendations |

## How scoring works

Each recorder computes **raw totals only**, following the scoring sheet for that
instrument.

- **PSI-4-SF** — five-point scale, Strongly Agree scores 5 down to Strongly Disagree
  scores 1. Two items use their own custom answer sets with fixed scores. Subscale
  totals plus an overall Total Stress figure.
- **PKBS-2** — four-point scale, Never scores 0 up to Often scores 3. Subscale totals
  plus Social Skills and Problem Behavior composites. Items can be filtered to one
  scale or the other before handing the phone over.
- **CESD-R** — five response options mapped to **0 / 1 / 2 / 3 / 3**. The top two
  options ("5–7 days" and "nearly every day for 2 weeks") both score 3, matching the
  official score sheet rather than the 0–4 column headers printed on the form. Nine
  domain subtotals and a total out of 60, scored against both cutoffs: further
  investigation above 10, clinical threshold above 16. **Any endorsement of item 14 or
  15 raises a suicidal-ideation flag regardless of the total** — that flag calls for
  further assessment on its own.
- **CCA** — not scored. Tracks required fields, shows per-section completion, reveals
  conditional follow-ups as they become relevant, and produces a summary to paste into
  the clinical record.

Every instrument opens on a title card: one sentence on what it covers and why, plus
item count, response scale, and timeframe, so whoever is administering it knows what
they are about to hand over.

## Where the answers live

Nothing is transmitted anywhere. There is no server, no analytics, and no network
request carrying response data.

- **PSI-4-SF, PKBS-2, CESD-R** — answers exist only in the open browser tab. Closing
  or reloading the page discards them. Copy the summary before you leave the results
  screen. Only your *edits to the question bank* persist, in `localStorage`.
- **CCA** — answers autosave to `localStorage` on the device, so a long assessment can
  be paused and resumed. They stay on that device and in that browser. "Clear all
  answers" on the home screen erases them.

Because storage is per-device and per-browser, treat these tools as a recording
convenience, not as a record of anything. The clinical record is the record.

## Running it

Static HTML. No build step, no package install, no server code.

```sh
git clone https://github.com/skyar123/Childfirst-assessment-recorder.git
cd Childfirst-assessment-recorder
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Opening `index.html` straight from the filesystem mostly works, but serving over HTTP
is more faithful to production. React, ReactDOM, Babel Standalone, and Tailwind load
from CDNs, so a first load needs a network connection.

## Files

```
index.html           PSI-4-SF, PKBS-2 and CESD-R recorders, plus the dashboard
cca-assessment.html  Comprehensive Child First Assessment questionnaire
404.html             Not-found page
images/logo.svg      Favicon
netlify.toml         Publish config, security headers, redirects
```

`index.html` is a single-page React app; the three recorders it hosts are addressable
directly at `#psi`, `#pkbs`, and `#cesdr`. The CCA is a separate page because it is a
different kind of instrument — sections and conditional fields rather than a flat item
list.

Each page is self-contained: its markup, styles, question bank, and scoring all live in
that one file, compiled in the browser by Babel. That is deliberate. A clinician can
open a single file and read the whole instrument, and the tool keeps working with no
toolchain to maintain.

## Deploying

Netlify serves the repository root as-is. `netlify.toml` sets the security headers,
redirects the old `/assessments.html` path to the root, and defines a Content Security
Policy scoped to the CDNs these pages actually use — `unpkg.com` for React and Babel,
`cdn.tailwindcss.com` for Tailwind, and Google Fonts. The policy allows `'unsafe-eval'`
because Babel Standalone compiles the JSX at runtime in the browser.

Any static host works just as well.

## About the instruments

The PSI-4-SF is published by Psychological Assessment Resources, Inc. The PKBS-2 is
published by PRO-ED, Inc. Both are copyrighted; these pages record responses to them
and do not reproduce their manuals, norms, or scoring tables. Convert raw scores using
the official materials.

The CESD-R is in the public domain:

> Eaton, W. W., Smith, C., Ybarra, M., Muntaner, C., & Tien, A. (2004). Center for
> Epidemiologic Studies Depression Scale: review and revision (CESD and CESD-R). In
> M. E. Maruish (Ed.), *The Use of Psychological Testing for Treatment Planning and
> Outcomes Assessment* (3rd ed.), Volume 3: Instruments for Adults, pp. 363–377.
> Mahwah, NJ: Lawrence Erlbaum.

The CESD-R is required at baseline, 6 months, and discharge.

# Tests

Two suites, run against the real pages in headless Chromium. The app itself
still has no build step; these are a development aid, not part of the site.

```sh
npm install -D playwright && npx playwright install chromium
node tests/cfcr-fields.js
node tests/behaviour.js
```

Both start their own static server on port 8125 and exit non-zero on failure.

**`cfcr-fields.js`** holds the CFCR Crisis Plan (rev. 10/23) field list as a
fixture and asserts `crisis-plan.html` still matches it: every field, in CFCR's
order, per page, with CFCR's character limits and option lists, only
`child_name` and `child_age` outside the form, and exactly CFCR's dropdown
fields tagged as dropdowns. The answers from this page get keyed into CFCR by
hand, so a field that drifts from the real form is the one defect that matters
most. Adding a field, dropping one, reordering them, changing a limit or
rewriting a dropdown all fail here.

**`behaviour.js`** covers the two outputs (the record copy keyed by CFCR page,
the family copy), the readiness check, autosave, and the six defects found
reviewing the branch before it merged. Each defect check is written to fail
against the code as it stood before its fix.

### Without network

The pages load React, Babel and Tailwind from CDNs. On a machine or CI runner
without outbound access, put local copies of `react.js`, `react-dom.js`,
`babel.js` and `tailwind.js` in a directory and point the server at it:

```sh
VENDOR_DIR=/path/to/vendor node tests/cfcr-fields.js
```

### Against a deploy

```sh
BASE_URL=https://example.netlify.app node tests/behaviour.js
```

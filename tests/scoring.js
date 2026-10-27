const { chromium } = require('playwright');
// Scoring is the highest-stakes logic in the app: a clinician reads these
// numbers and acts on them. This drives each instrument's own scorer with
// known inputs and checks the rules the README documents.
// Answers are stored as option indices, which is what the scorers read.
const { serve, PORT } = require('./serve');

let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS  ' : 'FAIL  ') + m); };

(async () => {
  const server = serve();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { fails++; console.log('FAIL  page error: ' + e.message); });
  await page.goto('http://127.0.0.1:' + PORT + '/index.html', { waitUntil: 'load' });
  await page.waitForSelector('#root h1', { timeout: 20000 });

  // Answers are stored as option indices, which is what the scorers read.
  const r = await page.evaluate(() => {
    const get = (id) => INSTRUMENTS.find((i) => i.id === id);
    const out = {};

    // ── M-CHAT-R. "No" indicates risk on every item except 2, 5 and 12. ──
    {
      const inst = get('mchat'), form = inst.build(), qs = form.questions;
      const YES = 0, NO = 1;
      const nonRisk = {}, allRisk = {};
      qs.forEach((q) => {
        nonRisk[q.id] = q.risk === 'Yes' ? NO : YES;
        allRisk[q.id] = q.risk === 'Yes' ? YES : NO;
      });
      out.mchat = {
        reversedItems: qs.map((q, i) => (q.risk === 'Yes' ? i + 1 : null)).filter(Boolean),
        low: inst.score(form, nonRisk).headline.value,
        lowVerdict: inst.score(form, nonRisk).headline.verdict.label,
        high: inst.score(form, allRisk).headline.value,
        highVerdict: inst.score(form, allRisk).headline.verdict.label,
      };
      // band boundaries
      const atN = (n) => {
        const a = { ...nonRisk };
        let k = 0;
        for (const q of qs) { if (k >= n) break; a[q.id] = allRisk[q.id]; k++; }
        return inst.score(form, a).headline.verdict.label;
      };
      out.mchat.bands = { at2: atN(2), at3: atN(3), at7: atN(7), at8: atN(8) };
    }

    // ── CESD-R. Top two options both score 3; items 14/15 alert. ────────
    {
      const inst = get('cesdr'), form = inst.build(), qs = form.questions;
      const scale = form.scaleScores;
      const zeros = {}; qs.forEach((q) => { zeros[q.id] = 0; });
      const one14 = { ...zeros }; one14[qs[13].id] = scale.length - 1;
      const one15 = { ...zeros }; one15[qs[14].id] = scale.length - 1;
      const alertsOf = (a) => (inst.score(form, a).alerts || []).map((x) => x.title + ' ' + (x.body || ''));
      const allTop = {}; qs.forEach((q) => { allTop[q.id] = scale.length - 1; });
      out.cesdr = {
        scaleScores: scale,
        alert14: alertsOf(one14),
        alert15: alertsOf(one15),
        noAlert: alertsOf(zeros),
        total: inst.score(form, allTop).headline.value,
        max: inst.score(form, allTop).headline.max,
      };
    }

    // ── PQ. 14 sections, reverse-scored C and G, auto-positive sections. ─
    {
      const inst = get('pq'), form = inst.build(), qs = form.questions;
      const labels = form.scale;
      const YES = labels.indexOf('Yes'), NO = labels.indexOf('No');
      const allNo = {}; qs.forEach((q) => { allNo[q.id] = NO; });
      const allYes = {}; qs.forEach((q) => { allYes[q.id] = YES; });
      out.pq = {
        scale: labels,
        allNo: inst.score(form, allNo).headline.value,
        allNoVerdict: inst.score(form, allNo).headline.verdict.label,
        allYes: inst.score(form, allYes).headline.value,
        allYesVerdict: inst.score(form, allYes).headline.verdict.label,
        max: inst.score(form, allYes).headline.max,
        sections: [...new Set(qs.map((q) => q.category))].length,
      };
    }

    // ── Every scorer handles indices, blanks and skips ───────────────────
    out.robust = [];
    INSTRUMENTS.forEach((inst) => {
      if (!inst.build || !inst.score) return;
      const form = inst.build(), qs = form.questions;
      try {
        inst.score(form, {});
        const zeros = {}; qs.forEach((q) => { zeros[q.id] = 0; });
        inst.score(form, zeros);
        const skipped = {}; qs.forEach((q) => { skipped[q.id] = 'skip'; });
        inst.score(form, skipped);
        const partial = {}; qs.forEach((q, i) => { if (i % 3 === 0) partial[q.id] = 0; });
        inst.score(form, partial);
        out.robust.push({ id: inst.id, ok: true });
      } catch (e) {
        out.robust.push({ id: inst.id, ok: false, err: String(e.message).slice(0, 90) });
      }
    });
    return out;
  });

  console.log('M-CHAT-R reversed items: ' + JSON.stringify(r.mchat.reversedItems) + '   (README: 2, 5, 12)');
  ok(JSON.stringify(r.mchat.reversedItems) === '[2,5,12]', 'M-CHAT-R: items 2, 5 and 12 are the reversed ones');
  ok(r.mchat.low === 0 && r.mchat.lowVerdict === 'Low risk', 'M-CHAT-R: no risk answers scores 0, Low risk (' + r.mchat.low + ')');
  ok(r.mchat.high === 20 && r.mchat.highVerdict === 'High risk', 'M-CHAT-R: all risk answers scores 20, High risk (' + r.mchat.high + ')');
  ok(r.mchat.bands.at2 === 'Low risk' && r.mchat.bands.at3 === 'Medium risk', 'M-CHAT-R: band breaks between 2 and 3 (' + r.mchat.bands.at2 + ' / ' + r.mchat.bands.at3 + ')');
  ok(r.mchat.bands.at7 === 'Medium risk' && r.mchat.bands.at8 === 'High risk', 'M-CHAT-R: band breaks between 7 and 8 (' + r.mchat.bands.at7 + ' / ' + r.mchat.bands.at8 + ')');

  console.log('CESD-R scaleScores: ' + JSON.stringify(r.cesdr.scaleScores) + '   (README: 0/1/2/3/3)');
  ok(JSON.stringify(r.cesdr.scaleScores) === '[0,1,2,3,3]', 'CESD-R: the top two options both score 3');
  ok(r.cesdr.total === 60 && r.cesdr.max === 60, 'CESD-R: maximum total is 60 (' + r.cesdr.total + '/' + r.cesdr.max + ')');
  ok(r.cesdr.alert14.some((t) => /suicid/i.test(t)), 'CESD-R: item 14 alone raises a suicidal-ideation alert');
  ok(r.cesdr.alert15.some((t) => /suicid/i.test(t)), 'CESD-R: item 15 alone raises a suicidal-ideation alert');
  ok(!r.cesdr.noAlert.some((t) => /suicid/i.test(t)), 'CESD-R: no such alert when neither is endorsed');

  console.log('PQ sections: ' + r.pq.sections + '   max ' + r.pq.max + '   (README: 14 sections, max 14)');
  ok(r.pq.sections === 14 && r.pq.max === 14, 'PQ: 14 lettered sections, one point each');
  ok(r.pq.allNo > 0, 'PQ: all-No still scores, because C and G are reverse-scored (' + r.pq.allNo + ')');
  ok(r.pq.allYesVerdict !== r.pq.allNoVerdict || r.pq.allYes !== r.pq.allNo, 'PQ: all-Yes and all-No differ (' + r.pq.allNo + ' vs ' + r.pq.allYes + ')');

  r.robust.forEach((x) => ok(x.ok, 'handles blank, zeroed, skipped and partial input: ' + x.id + (x.ok ? '' : ' -> ' + x.err)));

  await browser.close();
  server.close();
  console.log(fails ? '\n' + fails + ' failed' : '\nScoring matches the documented rules');
})();

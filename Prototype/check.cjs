const assert = require('node:assert/strict');
const {writeFileSync} = require('node:fs');
const api = require('./engine.js');

assert.equal(api.categories.length, 15);
assert.equal(new Set(api.categories.map(item => item.id)).size, 15);
for (const category of api.categories) {
  assert.ok(api.sources[category.source], category.id);
  assert.ok(api.suggest(category.samples[0]).includes(category.id), category.id);
}
const classifications = [
  {story: 'Scanned a QR code for a refund and my UPI app debited me', expected: 'qr'},
  {story: 'Telegram job asked for a deposit to unlock paid rating tasks', expected: 'tasks'},
  {story: 'SIM band ho gaya aur bank se paise kat gaye', expected: 'sim'},
  {story: 'The trading app showed stock profits and refused my withdrawal', expected: 'invest'}
].map(item => {
  const suggested = api.suggest(item.story);
  assert.ok(suggested.includes(item.expected), `${item.expected}: ${suggested}`);
  return {...item, suggested};
});
assert.deepEqual(api.suggest('hello'), []);

const scenarios = api.demos.map(demo => {
  const file = api.caseFile(demo);
  assert.ok(file.drafts.bank.includes(demo.story));
  assert.equal(Boolean(file.drafts.cyber), demo.route !== 'failed');
  assert.equal(Boolean(file.drafts.escalation), demo.id === 'trading');
  return {input: demo, output: file};
});

for (const route of ['failed', 'wrong', 'refund']) {
  const file = api.caseFile({route, story: 'I recognize this payment.'});
  assert.equal(file.drafts.cyber, null, route);
}
const attempt = api.caseFile({route: 'attempt', story: 'Someone asked for a fee over the phone.'});
assert.equal(attempt.timeline.length, 1);
assert.doesNotMatch(attempt.drafts.cyber, /Amount:/);
const debit = api.caseFile({route: 'debit', story: 'I saw a debit. My OTP: 123456 and password: demo-secret. Card 4111 1111 1111 1111.', report: {status: 'pending'}});
assert.doesNotMatch(debit.drafts.bank, /123456|demo-secret|4111/);
assert.match(debit.drafts.bank, /I do not recognize making or approving/);
assert.equal(debit.drafts.escalation, null);
assert.ok(api.caseFile({route: 'debit', story: 'I saw a debit.', report: {status: 'no-reply'}}).drafts.escalation);
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify({fictional: true, classifications, scenarios}, null, 2) + '\n');
console.log('Passed 15 catalog checks, 4 text classification cases, 5 sample files, and dispute, escalation, and redaction checks.');

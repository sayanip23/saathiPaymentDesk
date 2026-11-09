const {resolve} = require('node:path');
const {suggest} = require(resolve(process.argv[2] || '../Prototype/engine.js'));

const cases = [
  {
    id: 'implicit-qr',
    story: 'The person asked me to point the camera at a square box to get my money back. The balance went down.',
    reviewerExpectation: 'Include qr as a possible mechanism.'
  },
  {
    id: 'ambiguous-alert',
    story: 'I cannot tell whether this notification is real.',
    reviewerExpectation: 'Abstain and ask what the notification says.'
  }
];

const results = cases.map(input => ({input, output: {suggested: suggest(input.story)}}));
process.stdout.write(JSON.stringify({fictional: true, results}, null, 2) + '\n');

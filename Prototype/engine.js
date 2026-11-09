(function (scope) {
  'use strict';

  const sources = {
    report: ['National Cyber Crime Reporting Portal', 'https://cybercrime.gov.in/'],
    checklist: ['Cybercrime portal evidence checklist', 'https://www.cybercrime.gov.in/webform/Crime_AuthoLogin.aspx'],
    rbiFraud: ['RBI consumer fraud advisory', 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185'],
    kyc: ['RBI KYC fraud advisory and reporting guidance', 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=57244'],
    booklet: ['RBI BE(A)WARE booklet', 'https://systemhealth.rbi.org.in/cms.rbi.org.in/cms/assets/Documents/BEAWARE07032022.pdf'],
    npci: ['NPCI fraud awareness', 'https://www.npci.org.in/fraud-awareness'],
    upi: ['NPCI UPI help and disputes', 'https://www.npci.org.in/uploads/UPI_Help_Brand_Guidelines_86c8c28922.pdf'],
    aeps: ['RBI AePS fraud risk guidance', 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12877&Mode=0'],
    cert: ['CERT-In online scam advisory', 'https://www.cert-in.org.in/s2cMainServlet?VLCODE=CIAD-2024-0050&pageid=PUBVLNOTES02'],
    arrest: ['I4C digital arrest advisory', 'https://cybercrime.gov.in/pdf/Advisories/ADVISORYTAU-ADV-003DigitalArrest06.03.2025.pdf'],
    boss: ['I4C executive impersonation advisory', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2295889&lang=1&reg=3'],
    job: ['I4C task and part-time job fraud advisory', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1982936&lang=2&reg=48'],
    trading: ['SEBI fake trading app advisory', 'https://investor.sebi.gov.in/pdf/Fake%20trading%20app%20scam%20Landscape.pdf'],
    i4c: ['I4C fraud advisories', 'https://cybercrime.gov.in/Webform/Advisory.aspx'],
    cms: ['RBI Complaint Management System', 'https://cms.rbi.org.in/'],
    ombudsman: ['RBI Integrated Ombudsman Scheme, 2026 FAQ', 'https://www.rbi.org.in/commonperson/english/scripts/FAQs.aspx?Id=3407']
  };

  const categories = [
    {id: 'qr', title: 'UPI QR or payment approval', group: 'payment', source: 'npci',
      description: 'A QR code or approval is presented as a way to receive money, but it prompts a payment.',
      samples: ['I scanned a QR code to receive a refund and entered my UPI PIN', 'The buyer sent a QR and said approve to receive money', 'paise lene ke liye QR scan karaya aur paise kat gaye'],
      evidence: 'Original QR or payment request and the message that told you to approve it.'},
    {id: 'kyc', title: 'Phishing or fake KYC', group: 'account', source: 'kyc',
      description: 'A message links to a fake bank or service page, often threatening account suspension.',
      samples: ['SMS said update KYC or my account will be blocked and I opened a link', 'a fake bank login page asked for my credentials', 'KYC update ka fake link aaya bank account block karne ki dhamki'],
      evidence: 'Original message, sender, and URL as plain text. Avoid reopening the link.'},
    {id: 'support', title: 'Fake customer support or OTP scam', group: 'account', source: 'rbiFraud',
      description: 'An impersonator offers customer support and asks for a code or payment.',
      samples: ['fake customer care number from Google asked me to share an OTP', 'bank helpline agent called and asked for verification code', 'customer care ne OTP manga'],
      evidence: 'Support number or profile and call time. Leave out the actual OTP or PIN.'},
    {id: 'remote', title: 'Remote access or malicious app', group: 'account', source: 'booklet',
      description: 'A link or caller persuades the person to install an app or share their screen.',
      samples: ['they made me install AnyDesk and share my screen', 'I installed an APK from WhatsApp and someone controlled my phone', 'screen sharing app install karwaya remote access le liya'],
      evidence: 'App name, original install message, and approximate install time.'},
    {id: 'sim', title: 'SIM swap or account takeover', group: 'account', source: 'booklet',
      description: 'Someone takes over access to a mobile number or payment account.',
      samples: ['my SIM suddenly lost signal then I received debit alerts', 'a replacement SIM was issued without me asking', 'SIM band ho gaya aur bank se paise kat gaye'],
      evidence: 'Time mobile service stopped, carrier alerts, and bank alerts.'},
    {id: 'card', title: 'Card or ATM fraud', group: 'account', source: 'booklet',
      description: 'Unrecognized card purchases or withdrawals appear after loss, theft, or misuse.',
      samples: ['an online purchase appeared on my credit card and I did not buy it', 'an ATM withdrawal appeared after my debit card was skimmed', 'card par anjaan purchase hua ATM withdrawal nahi kiya'],
      evidence: 'Card statement, merchant descriptor or ATM location, and card issuer complaint reference.'},
    {id: 'aeps', title: 'Aadhaar-enabled payment fraud', group: 'account', source: 'aeps',
      description: 'An unfamiliar transaction appears through the Aadhaar Enabled Payment System.',
      samples: ['there was an AePS cash withdrawal using my Aadhaar without permission', 'biometric micro ATM withdrawal I did not recognize', 'Aadhaar fingerprint se paise nikle AePS debit'],
      evidence: 'AePS entry from your statement and any information about the assisted payment outlet.'},
    {id: 'shopping', title: 'Fake buyer, seller, or store', group: 'payment', source: 'booklet',
      description: 'Someone takes an advance for goods or tricks a seller during an online sale.',
      samples: ['online seller took an advance for a phone and disappeared', 'I paid a fake online shopping store and my order never arrived', 'seller ko advance diya phir block kar diya'],
      evidence: 'Listing, chat, order confirmation, seller profile, and payment receipt.'},
    {id: 'refund', title: 'Fake refund or mistaken-transfer claim', group: 'payment', source: 'cert',
      description: 'Someone claims money was sent by mistake or asks for a payment to release a refund.',
      samples: ['a stranger claimed they sent money by mistake and asked me to send it back', 'I was asked to pay a fee for a refund that never came', 'galti se paise bhejne ka message aaya wapas maange'],
      evidence: 'The refund or mistaken-credit claim and the matching statement entries, if any.'},
    {id: 'arrest', title: 'Digital arrest or fake courier', group: 'impersonation', source: 'arrest',
      description: 'Someone posing as an authority uses a fake criminal case or parcel to demand money.',
      samples: ['fake police on a video call said my parcel contained drugs and made me transfer money', 'digital arrest caller told me to move money to a safe account', 'police CBI bol kar parcel case mein video call pe paisa maanga'],
      evidence: 'Call time, claimed agency, messages, and transfer entries.'},
    {id: 'impersonation', title: 'Family, friend, or boss impersonation', group: 'impersonation', source: 'boss',
      description: 'An urgent transfer request appears to come from a trusted person or business contact.',
      samples: ['my boss on WhatsApp asked me to urgently pay a supplier to a new bank account', 'someone used my brother voice to ask for emergency money', 'dost ban kar WhatsApp pe urgent paise maange'],
      evidence: 'Original request, account or phone identifier, and any independent confirmation from the person.'},
    {id: 'tasks', title: 'Fake jobs or paid tasks', group: 'payment', source: 'job',
      description: 'A job or rating task promises earnings, then requires a deposit or fee.',
      samples: ['Telegram part time job paid me to like videos then asked for a deposit to unlock tasks', 'I paid a registration fee for a fake job offer', 'rating review task job ke liye deposit maanga'],
      evidence: 'Job listing, task messages, deposit instructions, and payment records.'},
    {id: 'invest', title: 'Fake investment, trading, or crypto', group: 'payment', source: 'trading',
      description: 'A platform shows supposed gains, then blocks withdrawals or demands further payments.',
      samples: ['a fake trading app showed stock profits but blocked my withdrawal', 'Telegram investment group asked for a tax to withdraw crypto profits', 'trading app profit dikhata hai withdrawal ke liye tax maanga'],
      evidence: 'Platform name and URL, deposit records, and messages about withdrawal or additional fees.'},
    {id: 'loan', title: 'Fake loan or advance fee', group: 'payment', source: 'booklet',
      description: 'A supposed lender takes a fee for a loan that never arrives.',
      samples: ['I paid a processing fee for a loan that never arrived', 'the lender demanded an advance insurance payment to approve my loan', 'loan ke liye processing fees diya loan nahi mila'],
      evidence: 'Loan offer, claimed lender, fee request, and payment receipt.'},
    {id: 'prize', title: 'Lottery, prize, or cashback', group: 'payment', source: 'npci',
      description: 'A supposed reward requires a fee, payment approval, or disclosure of credentials.',
      samples: ['they said I won a lottery and had to pay tax to receive the prize', 'I got a cashback offer asking for a verification fee', 'lottery prize jeetne ka message tax paise maange'],
      evidence: 'Original prize message, sender, and any fee demand or transaction.'}
  ];

  const routes = {
    tricked: {title: 'I was tricked into paying', short: 'You made or approved a payment after a misleading request.', mode: 'fraud', subject: 'Suspected scam-induced payment', account: 'I made or approved the payment and believe I was misled.'},
    debit: {title: 'I don’t recognize a debit', short: 'A debit or withdrawal appeared that you did not make or approve.', mode: 'fraud', subject: 'Unrecognized debit', account: 'I do not recognize making or approving the debit.'},
    unsure: {title: 'I’m not sure what happened', short: 'You want help checking whether the payment may be fraud.', mode: 'uncertain', subject: 'Request to review a payment', account: 'I am unsure how this transaction occurred or whether it was approved.'},
    attempt: {title: 'Suspicious request, no money sent', short: 'You received a suspicious message, link, call, or request.', mode: 'attempt', subject: 'Suspected payment fraud attempt', account: 'I received a suspicious request. I did not send money in response to it.'},
    failed: {title: 'Failed or pending payment', short: 'Money was debited but the payment failed or is pending.', mode: 'dispute', subject: 'Failed or pending payment', account: 'The payment appears failed or pending. Please confirm its status.'},
    wrong: {title: 'Accidental transfer', short: 'You entered or selected the wrong recipient by mistake.', mode: 'dispute', subject: 'Accidental transfer to the wrong recipient', account: 'I made the transfer but selected the wrong recipient by mistake.'},
    refund: {title: 'Merchant or refund dispute', short: 'You recognize the payment but have a problem with the order or refund.', mode: 'dispute', subject: 'Merchant or refund dispute', account: 'I recognize the payment and am disputing the order, service, or refund.'}
  };

  function trigrams(value) {
    const words = value.normalize('NFKC').toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
    const result = new Set();
    for (const word of words) {
      const framed = `^${word}$`;
      for (let i = 0; i + 3 <= framed.length; i++) result.add(framed.slice(i, i + 3));
    }
    return result;
  }

  const examples = categories.map(category => ({id: category.id, vectors: category.samples.map(trigrams)}));

  function suggest(text) {
    const input = trigrams(text);
    if (input.size < 8) return [];
    const scores = examples.map(example => ({id: example.id, score: Math.max(...example.vectors.map(vector => {
      let overlap = 0;
      for (const gram of vector) if (input.has(gram)) overlap++;
      return overlap / Math.sqrt(input.size * vector.size);
    }))})).sort((a, b) => b.score - a.score);
    return scores.filter(item => item.score >= .30 && item.score >= scores[0].score - .10).slice(0, 3).map(item => item.id);
  }

  function redact(value = '') {
    return value.trim()
      .replace(/\b(OTP|UPI\s+PIN|PIN|CVV|password)\s*(?:is\s+|[:=]\s*)([^\s,;.]+)/gi, '$1 [redacted]')
      .replace(/\b(?:\d[ -]?){9,18}\d\b/g, '[number redacted]');
  }

  const channelNames = {upi: 'UPI', card: 'Card / ATM', transfer: 'Bank transfer', wallet: 'Wallet', aeps: 'AePS', other: 'Other / unknown'};
  const providerStatuses = {none: 'No written complaint recorded', pending: 'Written complaint made, awaiting a reply', rejected: 'Reply received, issue unresolved', 'no-reply': 'No reply by the applicable deadline', resolved: 'Resolved'};

  function caseFile(state) {
    const route = routes[state.route];
    const category = categories.find(item => item.id === state.category);
    const info = state.facts ?? {};
    const report = state.report ?? {};
    const description = redact(state.story);
    const amount = info.amount ? `₹${info.amount}` : 'Unknown';
    const when = value => value ? value.replace('T', ' ') : 'Unknown';
    const timeline = [];
    if (route.mode !== 'attempt') timeline.push({label: 'Payment or debit', when: when(info.paidAt), detail: `${amount} via ${channelNames[info.channel] ?? 'unknown method'}`});
    timeline.push({label: route.mode === 'attempt' ? 'Suspicious request noticed' : 'Issue noticed', when: when(info.noticedAt), detail: description || 'Add a description.'});
    if (report.status && report.status !== 'none') timeline.push({label: 'Provider complaint', when: when(report.date), detail: providerStatuses[report.status]});
    const evidence = [
      {id: 'record', text: route.mode === 'attempt' ? 'Time, sender, and original suspicious message or call details.' : 'Payment receipt or statement entry with amount, date, and transaction reference.'},
      {id: 'messages', text: 'Relevant messages, call times, screenshots, or merchant correspondence.'},
      ...(category ? [{id: 'specific', text: category.evidence}] : []),
      {id: 'complaint', text: 'Bank or payment provider acknowledgement and any written response.'}
    ];
    const facts = [route.account, `What happened: ${description || '[Describe what happened]'}`];
    if (route.mode !== 'attempt') facts.push(`Amount: ${amount}`, `Payment method: ${channelNames[info.channel] ?? 'Unknown'}`, `Transaction date and time: ${when(info.paidAt)}`, 'Transaction reference: [Add it directly in the official channel]');
    facts.push(`Noticed on: ${when(info.noticedAt)}`);
    if (info.provider) facts.push(`Bank, app, or provider: ${redact(info.provider)}`);
    if (report.status && report.status !== 'none') facts.push(`Prior provider complaint: ${providerStatuses[report.status]}. Date: ${when(report.date)}.`);
    const request = route.mode === 'dispute' ? 'Please check the transaction and explain the applicable dispute or reversal process. Please provide a complaint reference and a written response.'
      : 'Please investigate, advise what steps I should take to secure my account, and tell me which dispute or recovery options apply. Please provide a complaint reference and a written response.';
    const bank = `Subject: ${route.subject}\n\n${facts.join('\n')}\n\n${request}`;
    const cyber = route.mode === 'dispute' ? null : `Subject: ${route.subject}\n\n${facts.join('\n')}\n\nI can supply the records I have through the official reporting channel. Please advise the next steps and provide an acknowledgement.`;
    const mayEscalate = ['rejected', 'no-reply'].includes(report.status);
    const escalation = mayEscalate ? `Subject: Complaint about handling of ${route.subject.toLowerCase()}\n\n${facts.join('\n')}\n\nProvider complaint reference: [Add reference]\nWhat remains unresolved: [Describe the service issue and the reply, if any]\nRelief requested: [State what you are asking the provider to do]\n\nI can provide my prior written complaint and the provider’s response, if any.` : null;
    return {timeline, evidence, drafts: {bank, cyber, escalation}, mayEscalate};
  }

  const demos = [
    {id: 'qr-refund', title: 'Fake refund QR', route: 'tricked', category: 'qr', story: 'A caller pretending to offer a refund sent a QR code. I scanned it, entered my UPI PIN to receive the refund, and my account was debited.', facts: {amount: '4800', channel: 'upi', paidAt: '2026-11-05T10:20', noticedAt: '2026-11-05T10:21', provider: 'Demo payment app'}},
    {id: 'card-debit', title: 'Unrecognized card charge', route: 'debit', category: 'card', story: 'An online purchase appeared on my credit card statement. I did not make or approve it.', facts: {amount: '3200', channel: 'card', paidAt: '2026-11-05T08:20', noticedAt: '2026-11-05T09:00', provider: 'Demo card issuer'}},
    {id: 'trading', title: 'Fake trading app', route: 'tricked', category: 'invest', story: 'A trading group asked me to deposit money into a platform. It displayed profits but refused my withdrawal and demanded a further fee.', facts: {amount: '25000', channel: 'transfer', paidAt: '2026-10-21T15:40', noticedAt: '2026-10-29T11:15', provider: 'Demo Bank'}, report: {status: 'rejected', date: '2026-10-30'}},
    {id: 'unclear', title: 'An alert I can’t explain', route: 'unsure', story: 'I got a debit notification, but I have not confirmed the entry in my bank app. I am unsure if the alert is genuine.', facts: {channel: 'other', noticedAt: '2026-11-06T12:00'}},
    {id: 'failed', title: 'Failed UPI payment', route: 'failed', story: 'I tried to pay a store through UPI. My account was debited but the app shows failed and the store says it was not credited.', facts: {amount: '850', channel: 'upi', paidAt: '2026-11-06T12:45'}}
  ];

  const api = {sources, categories, routes, channelNames, providerStatuses, suggest, redact, caseFile, demos};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else scope.PaymentDesk = api;
})(globalThis);

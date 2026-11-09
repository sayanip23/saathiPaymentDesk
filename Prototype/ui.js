(function () {
  'use strict';
  const api = globalThis.PaymentDesk;
  const find = selector => document.querySelector(selector);
  const view = find('#view');
  const searchForm = find('#service-search');
  const searchResults = find('#search-results');
  let state = null;
  let activeDraft = 'bank';
  let edits = {};
  let available = new Set();

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function button(text, action, className = 'choice') {
    const node = el('button', text, className);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }

  function link(text, url) {
    const node = el('a', text);
    node.href = url;
    if (url.startsWith('https:')) {
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
    }
    return node;
  }

  function source(key) { return link(...api.sources[key]); }

  function heading(step, title, text) {
    const card = el('div', '', 'bubble');
    if (step) card.append(el('span', step, 'step-label'));
    const titleNode = el('h3', title);
    titleNode.tabIndex = -1;
    card.append(titleNode, el('p', text));
    view.append(card);
  }

  function focusDesk() {
    view.querySelector('h3')?.focus({preventScroll: true});
    find('#desk').scrollIntoView({block: 'start'});
  }

  function resetDrafts() {
    activeDraft = 'bank';
    edits = {};
    available = new Set();
  }

  function start(route, category) {
    resetDrafts();
    state = {route, category, step: 'story', story: '', facts: {}, report: {status: 'none'}};
    render(true);
  }

  function demo(example) {
    resetDrafts();
    state = {...example, demo: true, step: 'review', facts: {...example.facts}, report: {...example.report}};
    render(true);
  }

  function select(options, value) {
    const input = el('select');
    for (const [key, text] of Object.entries(options)) {
      const option = el('option', text);
      option.value = key;
      input.append(option);
    }
    input.value = value ?? '';
    return input;
  }

  function field(label, input) {
    const wrapper = el('label', label, 'case-field');
    wrapper.append(input);
    return wrapper;
  }

  function textInput(type, value, maxLength) {
    const input = el('input');
    input.type = type;
    input.value = value ?? '';
    input.autocomplete = 'off';
    input.spellcheck = false;
    if (maxLength) input.maxLength = maxLength;
    return input;
  }

  function actionRow(...children) {
    const actions = el('div', '', 'choices');
    actions.append(...children);
    return actions;
  }

  function showFirstSteps() {
    const {mode} = api.routes[state.route];
    const panel = el('section', '', mode === 'fraud' ? 'referral alert case-first' : 'referral case-first');
    if (mode === 'fraud') {
      panel.append(el('h4', 'Report promptly'), el('p', 'Contact your bank or payment provider through its official app, website, or branch. Report suspected financial cyber fraud through 1930 or the National Cyber Crime Reporting Portal. You can report before preparing a draft.'), link('Call 1930', 'tel:1930'), source('report'), source('kyc'));
    } else if (mode === 'uncertain') {
      panel.append(el('h4', 'Verify the debit through an official channel'), el('p', 'Check your statement using your bank or payment app directly. If the entry is unfamiliar or you suspect fraud, contact your bank promptly and report through 1930 or the cybercrime portal.'), link('Call 1930', 'tel:1930'), source('report'));
    } else if (mode === 'attempt') {
      panel.append(el('h4', 'Check whether anything was exposed'), el('p', 'If you shared credentials or installed a suspicious app, contact your provider through an official channel. You can preserve and report suspicious messages or identifiers through the cybercrime portal.'), source('report'));
    } else {
      const issue = state.route === 'failed' ? 'Open the payment in your app and check its status before raising a dispute with the app or bank.'
        : state.route === 'wrong' ? 'Tell your bank or app the transfer went to the wrong recipient and ask what options are available.'
          : 'Keep your receipt and refund correspondence. Start with the merchant or platform and use your payment provider’s dispute channel where applicable.';
      panel.append(el('h4', 'Start with the payment dispute'), el('p', issue), source('upi'));
    }
    view.append(panel);
  }

  function showStory() {
    heading('STEP 1 OF 3', 'Describe what happened', 'Use your own words, such as “I scanned a QR code for a refund, then money left my account.”');
    showFirstSteps();
    const story = el('textarea', '', 'case-story');
    story.value = state.story;
    story.setAttribute('aria-label', 'What happened');
    story.maxLength = 1500;
    story.autocomplete = 'off';
    story.spellcheck = false;
    story.placeholder = 'Use fictional details. Leave out PINs, OTPs, passwords, and full account or card numbers.';
    view.append(field('What happened?', story));
    const next = button('Continue to payment details', () => {
      state.story = api.redact(story.value);
      state.step = 'facts';
      render(true);
    }, 'primary');
    next.disabled = !story.value.trim();
    story.addEventListener('input', () => { next.disabled = !story.value.trim(); });
    view.append(actionRow(next));
  }

  function showFacts() {
    heading('STEP 2 OF 3', 'Confirm the details you know', 'You can leave unknown details blank and add the full transaction reference directly in the official complaint channel.');
    const isDispute = api.routes[state.route].mode === 'dispute';
    const isAttempt = api.routes[state.route].mode === 'attempt';
    const fields = el('div', '', 'case-grid');
    let category;
    if (!isDispute) {
      const suggested = api.suggest(state.story);
      category = select({'': 'Not sure', ...Object.fromEntries(api.categories.map(item => [item.id, item.title]))}, state.category ?? suggested[0] ?? '');
      const choices = el('div', '', 'pattern-choice');
      const descriptions = suggested.map(id => api.categories.find(item => item.id === id).title);
      choices.append(el('p', descriptions.length ? `Possible matches: ${descriptions.join(' · ')}. Review the selection before continuing.` : 'Choose a pattern if you recognize one. You can also leave it as “Not sure”.'), field('Fraud pattern', category));
      view.append(choices);
    }
    const amount = textInput('number', state.facts.amount);
    amount.min = '0.01';
    amount.max = '99999999999';
    amount.step = '0.01';
    const channel = select({'': 'Not sure', ...api.channelNames}, state.facts.channel);
    const paidAt = textInput('datetime-local', state.facts.paidAt);
    const noticedAt = textInput('datetime-local', state.facts.noticedAt);
    const provider = textInput('text', state.facts.provider, 100);
    provider.placeholder = 'Example: Demo Bank';
    if (!isAttempt) fields.append(field('Amount in ₹', amount), field('Payment method', channel), field('Transaction date and time', paidAt));
    fields.append(field('When you noticed it', noticedAt), field('Bank, app, or provider', provider));
    view.append(fields);
    const error = el('p', '', 'case-error');
    error.setAttribute('role', 'status');
    view.append(error);
    const saveFacts = () => {
      state.facts = {amount: amount.value, channel: channel.value, paidAt: paidAt.value, noticedAt: noticedAt.value, provider: api.redact(provider.value)};
      state.category = category?.value ?? '';
    };
    view.append(actionRow(button('Back', () => { saveFacts(); state.step = 'story'; render(true); }, 'secondary'), button('Build case file', () => {
      if (!isAttempt && !amount.checkValidity()) {
        error.textContent = 'Enter a positive amount with up to two decimal places, or leave it blank.';
        amount.focus();
        return;
      }
      if (paidAt.value && noticedAt.value && paidAt.value > noticedAt.value) {
        error.textContent = 'The time you noticed the issue is before the transaction. Check the dates or leave an uncertain time blank.';
        return;
      }
      saveFacts();
      state.step = 'review';
      resetDrafts();
      render(true);
    }, 'primary')));
  }

  function showReview() {
    const file = api.caseFile(state);
    heading(state.demo ? 'FICTIONAL CASE · STEP 3 OF 3' : 'STEP 3 OF 3', 'Your payment case file', 'Check the facts and choose a draft. Submit it yourself through the appropriate official channel.');
    showFirstSteps();
    const caseTitle = el('div', '', 'case-tags');
    caseTitle.append(el('span', api.routes[state.route].subject));
    const category = api.categories.find(item => item.id === state.category);
    if (category) caseTitle.append(el('span', category.title));
    view.append(caseTitle);

    const timeline = el('details', '', 'case-panel');
    timeline.open = true;
    timeline.append(el('summary', 'Incident timeline'));
    const events = el('ol', '', 'timeline');
    for (const event of file.timeline) {
      const item = el('li');
      item.append(el('strong', event.label), el('small', event.when), el('p', event.detail));
      events.append(item);
    }
    timeline.append(events);
    view.append(timeline);

    const evidence = el('details', '', 'case-panel');
    evidence.append(el('summary', 'Evidence checklist'));
    const list = el('div', '', 'evidence-list');
    for (const item of file.evidence) {
      const label = el('label');
      const check = el('input');
      check.type = 'checkbox';
      check.checked = available.has(item.id);
      check.addEventListener('change', () => { if (check.checked) available.add(item.id); else available.delete(item.id); });
      label.append(check, el('span', item.text));
      list.append(label);
    }
    evidence.append(list, source('checklist'));
    if (category) evidence.append(document.createTextNode(' · '), source(category.source));
    view.append(evidence);

    const progress = el('details', '', 'case-panel');
    progress.open = Boolean(state.report?.status && state.report.status !== 'none');
    progress.append(el('summary', 'Already complained to the provider?'));
    const progressFields = el('div', '', 'case-grid');
    const status = select(api.providerStatuses, state.report?.status ?? 'none');
    const reportDate = textInput('date', state.report?.date);
    const update = button('Update complaint status', () => {
      state.report = {status: status.value, date: status.value === 'none' ? '' : reportDate.value};
      delete edits.escalation;
      render();
      find('#draft-title').focus();
    }, 'secondary');
    progressFields.append(field('Provider response', status), field('Date of written complaint', reportDate));
    progress.append(progressFields, actionRow(update), el('p', file.mayEscalate
      ? 'You can check RBI Ombudsman eligibility for a complaint about the provider’s service. Other eligibility conditions apply.'
      : 'A written complaint to a covered provider comes first. If the reply is unsatisfactory or the response deadline has passed, check RBI Ombudsman eligibility. The response deadline is 30 days or a longer applicable period.'), source('ombudsman'));
    view.append(progress);

    const drafts = el('section', '', 'case-panel draft-panel');
    const draftTitle = el('h4', 'Complaint drafts');
    draftTitle.id = 'draft-title';
    draftTitle.tabIndex = -1;
    drafts.append(draftTitle);
    const names = {bank: 'Bank / provider', cyber: 'Cybercrime report', escalation: 'RBI escalation'};
    if (!file.drafts[activeDraft]) activeDraft = 'bank';
    const draftActions = el('div', '', 'choices');
    const editor = el('textarea', '', 'draft-text');
    editor.autocomplete = 'off';
    editor.spellcheck = false;
    const copyStatus = el('p', '', 'draft-status');
    copyStatus.setAttribute('role', 'status');
    const draftLink = el('div', '', 'source-links');

    function selectDraft(key) {
      activeDraft = key;
      editor.value = edits[key] ?? file.drafts[key];
      editor.setAttribute('aria-label', `Editable ${names[key]} draft`);
      for (const action of draftActions.children) action.setAttribute('aria-pressed', String(action.dataset.draft === key));
      draftLink.replaceChildren();
      if (key === 'cyber') draftLink.append(source('report'), source('checklist'));
      if (key === 'escalation') draftLink.append(source('cms'), source('ombudsman'));
      copyStatus.textContent = '';
    }
    for (const [key, name] of Object.entries(names)) {
      if (!file.drafts[key]) continue;
      const choice = button(name, () => selectDraft(key));
      choice.dataset.draft = key;
      draftActions.append(choice);
    }
    editor.addEventListener('input', () => { edits[activeDraft] = editor.value; });
    const copy = button('Copy draft', async () => {
      try {
        await navigator.clipboard.writeText(editor.value);
        copyStatus.textContent = 'Draft copied.';
      } catch {
        editor.focus();
        editor.select();
        copyStatus.textContent = 'Draft selected. Use your device’s copy command.';
      }
    }, 'secondary');
    drafts.append(draftActions, editor, actionRow(copy), copyStatus, draftLink);
    selectDraft(activeDraft);
    view.append(drafts, actionRow(button('Edit case details', () => { state.step = 'facts'; render(true); }, 'secondary')));
  }

  function render(focus = false) {
    view.replaceChildren();
    for (const item of document.querySelectorAll('[data-route]')) item.setAttribute('aria-pressed', String(item.dataset.route === state?.route));
    for (const item of document.querySelectorAll('[data-demo]')) item.setAttribute('aria-pressed', String(state?.demo && item.dataset.demo === state.id));
    if (!state) {
      find('#desk-sub').textContent = 'Choose what happened or open a fictional case.';
      heading('', 'Which situation fits?', 'Choose a case type to create an incident timeline, evidence checklist, and editable complaint.');
      const info = el('div', '', 'intro-help');
      for (const [title, detail] of [['Explain what happened', 'Start with what you know. Leave missing dates and amounts blank.'], ['Prepare your complaint', 'Review your timeline and draft before using an official channel.']]) {
        const paragraph = el('p');
        paragraph.append(el('strong', title), document.createTextNode(detail));
        info.append(paragraph);
      }
      view.append(info);
    } else {
      find('#desk-sub').textContent = api.routes[state.route].title;
      if (state.step === 'story') showStory();
      else if (state.step === 'facts') showFacts();
      else showReview();
    }
    if (focus) focusDesk();
  }

  function renderLibrary() {
    for (const item of api.categories) {
      const card = el('details', '', 'case-panel library-card');
      card.id = `pattern-${item.id}`;
      card.append(el('summary', item.title), el('p', item.description), el('p', `Records to keep: ${item.evidence}`), source(item.source));
      card.append(actionRow(button('Start a case with this pattern', () => start('unsure', item.id), 'secondary')));
      find('#library-list').append(card);
    }
  }

  function showSearch(event) {
    event.preventDefault();
    const terms = find('#search-query').value.normalize('NFKC').toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
    const group = find('#search-category').value;
    const matches = api.categories.filter(item => {
      const text = `${item.title} ${item.description} ${item.samples.join(' ')}`.toLowerCase();
      return (group === 'all' || group === item.group) && terms.every(term => text.includes(term));
    });
    const results = find('#results-list');
    results.replaceChildren();
    find('#results-status').textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'pattern' : 'patterns'} found.` : 'No matches. Try “QR”, “KYC”, “card”, or a different category.';
    for (const item of matches) {
      const result = el('article', '', 'search-result');
      result.append(el('strong', item.title), el('p', item.description), button('View pattern', () => {
        const card = find(`#pattern-${item.id}`);
        card.open = true;
        card.querySelector('summary').focus({preventScroll: true});
        card.scrollIntoView({block: 'start'});
      }, 'secondary'));
      results.append(result);
    }
    searchResults.hidden = false;
    find('#results-title').focus({preventScroll: true});
    searchResults.scrollIntoView({block: 'start'});
  }

  function clear(focus) {
    state = null;
    resetDrafts();
    searchForm.reset();
    searchResults.hidden = true;
    find('#results-list').replaceChildren();
    find('#results-status').textContent = '';
    render(focus);
  }

  for (const [key, route] of Object.entries(api.routes)) {
    const primary = ['tricked', 'debit', 'unsure'].includes(key);
    const choice = button('', () => start(key), primary ? 'path' : 'example');
    choice.dataset.route = key;
    if (primary) {
      const mark = el('span', String(find('#primary-paths').children.length + 1), 'path-icon');
      mark.setAttribute('aria-hidden', 'true');
      const description = el('span');
      description.append(el('strong', route.title), el('small', route.short));
      choice.append(mark, description, el('span', '›', 'arrow'));
    } else choice.textContent = route.title;
    find(primary ? '#primary-paths' : '#other-paths').append(choice);
  }
  for (const item of document.querySelectorAll('.quick-links [data-route]')) item.addEventListener('click', () => start(item.dataset.route));
  for (const example of api.demos) {
    const choice = button(example.title, () => demo(example), 'example');
    choice.dataset.demo = example.id;
    find('#examples').append(choice);
  }
  for (const key of Object.keys(api.sources)) {
    const item = el('li');
    item.append(source(key));
    find('#sources').append(item);
  }

  const portalTop = find('.portal-top');
  const portalNav = find('#portal-nav');
  const navToggle = find('#nav-toggle');
  const navLinks = [...portalNav.querySelectorAll('a')];
  const desktopNav = window.matchMedia('(min-width: 1100px)');
  const sourceDetails = find('#resources details');
  function measureHeader() {
    document.documentElement.style.setProperty('--portal-top-height', `${portalTop.offsetHeight}px`);
  }
  function setMenu(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    portalNav.classList.toggle('is-open', open);
  }
  function syncLocation() {
    const hash = window.location.hash || '#home';
    for (const link of navLinks) {
      if (link.hash === hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    if (hash === '#resources') sourceDetails.open = true;
  }
  measureHeader();
  new ResizeObserver(measureHeader).observe(portalTop);
  syncLocation();
  window.addEventListener('hashchange', syncLocation);
  desktopNav.addEventListener('change', () => {
    if (!desktopNav.matches && portalNav.contains(document.activeElement)) navToggle.focus();
    setMenu(false);
  });
  navToggle.addEventListener('click', () => {
    const open = !portalNav.classList.contains('is-open');
    setMenu(open);
    if (open) (portalNav.querySelector('[aria-current]') || navLinks[0]).focus();
  });
  for (const link of navLinks) link.addEventListener('click', () => {
    if (link.hash === '#resources') sourceDetails.open = true;
    setMenu(false);
  });
  function closeOutside(event) {
    if (!portalNav.classList.contains('is-open') || portalNav.contains(event.target) || navToggle.contains(event.target)) return;
    if (portalNav.contains(document.activeElement)) navToggle.focus({preventScroll: true});
    setMenu(false);
  }
  document.addEventListener('click', closeOutside);
  document.addEventListener('focusin', closeOutside);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && portalNav.classList.contains('is-open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  const textButtons = [...document.querySelectorAll('[data-text-size]')];
  for (const size of textButtons) size.addEventListener('click', () => {
    document.documentElement.dataset.textSize = size.dataset.textSize;
    for (const option of textButtons) option.setAttribute('aria-pressed', String(option === size));
  });
  const contrast = find('#contrast');
  contrast.addEventListener('click', () => contrast.setAttribute('aria-pressed', String(document.documentElement.classList.toggle('high-contrast'))));
  searchForm.addEventListener('submit', showSearch);
  find('#clear').addEventListener('click', () => clear(true));
  window.addEventListener('pagehide', () => clear(false));
  renderLibrary();
  render();
})();

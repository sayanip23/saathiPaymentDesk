# Saathi Payment Desk

This independent assignment prototype helps users in India prepare a case file for suspected digital payment fraud or a payment dispute. It keeps Saathi's portal styling and provides a separate experience from the safety desk.

## Run

Open `dist/index.html` in a current browser. The page includes its styles, artwork, and scripts. The case builder runs on the device and keeps entries in tab memory. Use fictional details for the demonstration. Official links and phone links open the corresponding channels when selected. Review and submit any complaint yourself.

Use the left sidebar to jump to the case builder, demo cases, fraud library, reporting contacts, or official sources. On smaller screens, open **Menu** in the header to reach the same sections.

Try **Fake refund QR**, then **Failed UPI payment**, to compare their complaint options. Open **Fake trading app** to see a provider complaint status and a possible RBI escalation draft. Use **I was tricked into paying** to try the complete three-step flow.

## How it works

The user chooses how the payment happened. A small example-based character-trigram classifier suggests fraud patterns from the narrative. The user confirms the suggestion or picks another pattern. The chosen path controls reporting guidance, while the pattern adds a relevant evidence item. The timeline and drafts use deterministic templates and facts entered by the user. This demo keeps missing facts unknown and asks the user to supply full transaction references through the relevant official channel.

The pattern library covers the 15 documented types used in the assignment. The provider, cybercrime, and escalation drafts serve different purposes. Ordinary disputes get the provider draft. An unresolved response or a missed applicable response deadline can surface an RBI draft and a link to check eligibility. The RBI Ombudsman Scheme, 2026 has additional conditions and can specify a longer period than 30 days. The app makes no case-specific liability or recovery determination.

The prototype matches English and some Hinglish wording. Pattern suggestions can miss unfamiliar phrasing, so review them and retain the original account. The draft redacts recognizable credential labels and long number sequences. Use fictional or already redacted details because pattern-based redaction cannot recognize every secret. There is no model API, account database, or filing integration.

## Build and verify

```sh
node build.cjs
node check.cjs test-results.json
```

`test-results.json` contains fictional inputs and generated case files. `engine.js` contains the category library, source register, classifier, and draft logic. `page.html`, `style.css`, and `ui.js` define the browser interface. The India Gate artwork is reused from the Saathi Safety Desk prototype.

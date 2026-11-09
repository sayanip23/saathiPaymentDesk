# Saathi Payment Desk

**Kuku AI Generalist Assignment, Problem 2 (Build an AI Lawyer)**

This submission focuses on case preparation for digital payment fraud and disputes in India. All sample cases are fictional.

| Deliverable | Open |
| --- | --- |
| Two-page solution | [Solution.pdf](Solution.pdf) |
| Runnable prototype | [Prototype/dist/index.html](Prototype/dist/index.html) |
| Source and run instructions | [Prototype/README.md](Prototype/README.md) |
| Raw inputs and outputs | [Case runs](Raw_Outputs/test-results.json), [classifier failures](Raw_Outputs/edge-cases.json), and [test log](Raw_Outputs/test-run.txt) |

## Run the prototype

Extract the full ZIP and open `Prototype/dist/index.html` in a current browser. The prototype runs locally without installation or an API key. Use **Demo cases** in the sidebar and choose **Fake refund QR**. Review the timeline, evidence checklist, and complaint drafts. Compare it with **Failed UPI payment**. For a new input, select **Start a case** and enter a fictional or redacted incident.

To regenerate the browser file from source, run `node build.cjs` from `Prototype`. To rerun the checks and export the case outputs, run `node check.cjs ../Raw_Outputs/test-results.json` from the same folder. To reproduce the classifier failures, run `node run-edge-cases.cjs ../Prototype/engine.js` from `Raw_Outputs`.

## Form handoff

The placement-cell form asks for your name, roll number, branch, selected problem, and reviewer-accessible links. Use separate links for `Solution.pdf`, the prototype, and the `Raw_Outputs` folder. The [existing live preview](https://saathi-payment-fraud-demo.unknownmessiah49.chatgpt.site/) is owner-private. For a reviewer link, share an accessible repository containing `Prototype` and its README, or host `Prototype/dist` as a static site. Check the links while signed out before submitting.

## Optional walkthrough cues

Record up to three minutes in your own voice.

- **0:00–0:25** Explain why you scoped the AI lawyer to payment incidents in India.
- **0:25–1:35** Open **Fake refund QR** from **Demo cases**. Show how the story and payment details become a timeline, evidence checklist, and editable draft.
- **1:35–2:10** Open **Failed UPI payment**. Show how the complaint route differs from the fraud case.
- **2:10–2:45** Show the two classifier errors in `edge-cases.json` and explain why the user confirms the label. Describe one test you would add before making the tool available more widely.

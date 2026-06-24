# RFP Proposal Response Assistant

A streaming AI assistant that drafts structured, professional answers to
procurement and RFP questions — built for government and enterprise pre-sales
workflows.

Type a procurement question (e.g. *"Describe your approach to data residency
and sovereignty for UAE government cloud workloads"*) and the app streams back
a structured draft response in real time.

## What it does

- Streams responses token-by-token from the Anthropic API (Claude)
- Uses a tuned system prompt focused on government/enterprise procurement language
- Handles API and network errors gracefully with clear, user-facing messages
- Clean, demo-ready interface with live status indication

## Tech

- **React** (Vite) front-end
- **Anthropic Messages API** with streaming via the Fetch streaming API
- Plain CSS, no UI framework

## Running locally

```bash
npm install
```

Create a `.env` file in the project root:

VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

Then start the dev server:

```bash
npm run dev
```

Open the local URL shown in the terminal (usually http://localhost:5173).

## A note on architecture

This demo calls the Anthropic API **directly from the browser** for simplicity,
using the `anthropic-dangerous-direct-browser-access` header. This exposes the
API key to the client and is suitable only for local development.

A production version would proxy all API calls through a backend service so the
key is never sent to the browser. This is a deliberate, documented trade-off for
a local demo — not an oversight.

## Status

Project 1 of a hands-on AI engineering build series. Next: a
retrieval-augmented generation (RAG) app over a custom document set.
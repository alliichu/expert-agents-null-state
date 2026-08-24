# Expert Agents — marketing null state (prototype)

A design prototype of the **not-yet-purchased Expert Agents null state**, rebuilt as a marketing
surface instead of a utility empty state.

It shows behaviour and pixel intent. Values were pulled from `kajabi-products` and the Figma
frames rather than eyeballed, so it can be used as the spec.

- **Figma:** Alli's Sketchbook → page **`↳ Null State [WIP 🚧]`** (`1629:62411`) — the dev file
  for this state. Exploration and earlier passes live on `↳ Scratchpad - null state`.
- **Deeper detail:** [BUILD-NOTES.md](./BUILD-NOTES.md) — version pins, provenance, Pine
  findings, gotchas

```bash
npm install     # .npmrc sets legacy-peer-deps (Pine peers react@^18; we pin 17 like prod)
npm run dev     # http://localhost:5200
```

One route, `/`. Today's page is Sage (`ExpertAgentsListEmptyState.tsx`); this is Pine.

---

## How it behaves

**The loop.** Each exchange runs `typing → thinking → answer → hold → exit → gap`. The prompt
types into the composer and **stays there** — it is never sent up as a chat bubble. All pacing is
in `AgentDemoAnimation/timing.ts`; nothing else hard-codes a duration. ≈8.2s per exchange,
≈**50s** for a full round trip.

**Tabs switch themselves.** After a tab's **last** exchange finishes collapsing, the panel hands
over to the other one, so it cycles Sales → Teaching → Sales unattended. It drives the same state
a tab click does: both lanes freeze, the track slides 580px, both remount, and the arriving tab
restarts from its first prompt. A click mid-cycle pre-empts it.

**The visitor row never moves or fades.** It is the one fixed thing while everything below it
opens and closes. Who it *names* changes once per exchange, timed to land inside the answer
card's collapse so the bigger movement hides it. On the last exchange it holds its name all the
way out, because the next asker belongs to the other tab.

**Sales rows say `visitor`, Teaching rows say `member`.** That's product truth, not decoration:
`ContactPersonaDigest#identity_line` returns exactly `"a visitor (not signed in)"` or
`"Maya Chen (member since …)"`. On a sales page `anonymous?` is true whenever
`contact.sales_agent_visitor?`; inside a course everyone is signed in.

**The open card is positioned by its centre**, not its top — artifact heights vary a lot (245 /
250 / 189 / 120), and pinning the top left short cards hanging high. Tall cards bottom-anchor to
keep 53px of air, then cap with a dev warning.

**Answers are three lines max**, ~170 characters in the 348px column. Dev warnings fire and name
the prompt if that or the panel height is exceeded.

**Reduced motion** renders the first exchange statically — no loop, no slide, no shimmer.

---

## Links and states

`Learn more` → [Expert Agents overview](https://help.kajabi.com/articles/products/products-overview/expert-agents-overview).
Worth confirming that's the destination product wants; it's the public overview page.

`Add your first agent` isn't wired, because its target depends on the state. There are **three**,
where today's code has two (behind `expert_agents_self_serve_creation_enabled`):

| State | Page | CTA |
|---|---|---|
| Not purchased | what's built here | payment |
| **Purchased, not set up** | same page **minus the pricing strip** | creation |
| Flag off | today's "Request an agent" Typeform | Typeform |

The middle one is Isabelle's (8/21) and is **not built** — *"right now it still shows them the
purchase page which is confusing."*

---

## Structure

```
src/
  data/
    nullStateContent.ts   page copy + AGENT_TABS
    demoPrompts.ts        the six exchanges + the DemoArtifact union
  shell/                  topbar + left rail, built from prod
  components/
    ExpertAgentsNullState/  copy column + pricing strip + CTA
    AgentDemoPanel/         520x600 media panel + switcher tabs
    AgentDemoAnimation/     the loop. timing.ts = ALL pacing
```

One exchange draws exactly one artifact, or none — a discriminated union rather than five
optional fields, so it can't carry both a table and a video. Omitting it is a real shape: not
every question resolves to an artifact, and it's how to buy height back for a longer answer.

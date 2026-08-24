# Expert Agents — marketing null state (prototype)

A design prototype of the **not-yet-purchased Expert Agents null state**, rebuilt as a marketing
surface instead of a utility empty state.

It shows behaviour and pixel intent. Values were pulled from `kajabi-products` and the Figma
frames rather than eyeballed, so it can be used as the spec.

- **Figma:** Alli's Sketchbook → `↳ Scratchpad - null state` — left column `1629:63108`,
  demo frames in section `1500:4067`
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

## What isn't real yet

The demo content is designed and reviewed, built from Isabelle's classified production data
(n = 3,001 Teaching / n = 81 Sales openings). Six different businesses on purpose — the point is
that it works whatever you sell, so don't consolidate them onto one creator.

But **three of the six artifacts don't exist in the chat today**:

| Artifact | Exchange | |
|---|---|---|
| Offer card | S1 course | ✅ `OfferCard` + `ShowOffer` |
| Video tile | T2 warm-ups | ✅ `VideoTile` — but shipped as a 120×68 row, not this large card |
| Source citation | T3 photos | ✅ `SourceCitationCard` — but no excerpt field, so the pull quote is net-new |
| Email capture form | S2 updates | ❌ **net-new** |
| Plan table | S3 pricing | ❌ **net-new** |
| Skills table | T1 skills | ❌ **net-new** |

**On the capture form:** lead capture has no frontend at all. `LeadCapture::Create` is a tool the
LLM calls *after* the visitor types an email into the ordinary composer, and the ask is prose in
the hero's own wording. The capability is real — it creates a Contact stamped
`sales_agent_visitor` — but the field is a design proposal. It also fires nothing downstream
(`FLEX-3806` is still a TODO), so copy must not promise a triggered send.

**On the plans table:** keep it three rows, three columns. A feature matrix turns it into the
pricing-page section Sam killed on 8/18.

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

---

## Open questions

1. **Agent naming.** The tabs put both names on screen at 12px and nobody has picked them — code
   says `SalesAssistant` / `TeachingAssistant`, designs say "Sales Agent".
2. **Will the three net-new artifacts be built?** S2's is the strongest ask: creators selling live
   or coaching products have no artifact at all today.
3. **Is `ratings_enabled` honoured in the member chat frontend?** It defaults OFF for Sales and ON
   for Teaching (`ai/chatbot/settings.rb:67`), but the wiring wasn't found. The message footer
   (thumbs + copy) is removed here while that's unresolved.
4. **Can a pre-purchase account run a live agent?**
5. ~13% of Sales-agent openings are existing customers asking how to access what they bought — a
   support question hitting the sales widget, which by its own boundaries has to deflect.

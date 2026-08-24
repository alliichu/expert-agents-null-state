# Expert Agents — marketing null state (prototype)

A design prototype of the **not-yet-purchased Expert Agents null state**, rebuilt as a
marketing surface instead of a utility empty state.

It exists to show **behaviour and pixel intent**. It is not production code, but every value in
it was pulled from `kajabi-products` or measured off the Figma frames — nothing was eyeballed —
so it can be used as the spec.

- **Design:** Alli's Sketchbook → `↳ Scratchpad - null state`. Left column `1629:63108`,
  demo frames in section `1500:4067` (`08.21.2026`).
- **Owner:** Allison Chu (design) · direction from Sam, requirements from Isabelle.

> ⚠️ **Read [What's real and what isn't](#whats-real-and-what-isnt) before implementing.**
> Three of the six demo exchanges draw UI the chat cannot render today, and the `$49` price has
> no sign-off.

---

## Run

```bash
npm install     # .npmrc sets legacy-peer-deps (Pine peers react@^18; we pin 17 like prod)
npm run dev     # http://localhost:5200
```

One route, `/`. Versions are **routes in this one app**, never folder clones — add a route table
in `App.tsx` if another is needed, and a separate component only if the layout differs.

---

## What this replaces

Today's page is `app/javascript/apps/expert_agents/components/ExpertAgentsList/ExpertAgentsListEmptyState.tsx`.

⚠️ **It is built in Sage** (`EmptyState` from `@kajabi/sage-react`, `AI_SPARKLE` icon). This
prototype is **Pine**. The Sage → Pine migration is real engineering scope, not a copy change.

It has two states behind `expert_agents_self_serve_creation_enabled`. **A third is required**
(Isabelle, 8/21 — scope agreed):

| State | Page | CTA target |
|---|---|---|
| Not purchased | what's built here | payment |
| **Purchased, not set up** | same page **minus the pricing strip** | creation, not payment |
| Flag off | today's "Request an agent" Typeform | Typeform |

> *"Right now it still shows them the purchase page which is confusing… we are missing the
> acknowledgement that they already paid for it, it's ready to set up."*

The purchased-but-not-set-up state is **not built**.

---

## How it behaves

### The demo loop

Each exchange runs `typing → thinking → answer → hold → exit → gap`. The prompt types into the
composer and **stays there** — it is never sent up as a chat bubble.

All pacing lives in `AgentDemoAnimation/timing.ts`. Nothing in any component or stylesheet
hard-codes a duration; the rig publishes each as a CSS custom property.

| | ms | |
|---|---|---|
| `charMs` | 30 | per character while typing |
| `afterTypedMs` | 400 | beat before "thinking…" appears |
| `thinkingMs` | 2000 | shimmer sweeps 3×, derived as `thinkingMs / 3` |
| `answerInMs` / `answerFadeMs` | 600 / 700 | card height / its opacity settling |
| `holdMs` | 3400 | answer readable |
| `exitMs` | 540 | collapse (flat, regardless of prompt length) |
| `exitFadeMs` | 280 | card lets go early so the space shuts after it |
| `gapMs` | 400 | empty beat before the next prompt |
| `switchMs` | 400 | agent switch slide |
| `visitorSwapMs` | 240 | when the visitor label swaps, inside the collapse |

≈ **8.2s per exchange**, ≈25s per tab, ≈**50s for a full round trip** including both handoffs.

### Tabs switch themselves

After a tab's **last** exchange finishes collapsing, the panel hands over to the other tab, so it
cycles Sales → Teaching → Sales unattended.

It drives the **same state a tab click does**: both lanes freeze, the track translates 580px,
both lanes remount, and the arriving tab restarts from its first prompt. A click mid-cycle simply
pre-empts it. The slide takes `switchMs`, which is the same length the gap would have been, so
the loop's cadence doesn't change.

Only the live lane can hand over — a frozen lane gets no callback, so a lane sliding out
mid-state can't fire.

### The agent switch

Each agent gets a **lane**; lanes sit on a track 580px apart (Figma `1483:68475` — two 380px
composers with a 200px gap on a 960px track). Switching translates the track by
`-580 × index`, which reverses for free.

On switch every lane stops advancing: the outgoing one **freezes mid-state** and slides out
showing whatever it was doing; the incoming one waits at its resting composer rather than typing
on the way in. When it lands both remount — the arriving lane starts from the first prompt, the
departed one resets out of sight.

A lane is a copy of the **whole panel box** (520 × 600), which is why the animation inside needs
no layout change: its inset and centring resolve against a lane exactly as against the panel.

### The visitor row

**Constant** — it never fades or moves. It is the one fixed thing while everything below it opens
and closes.

Who it *names* changes once per exchange, timed to land `visitorSwapMs` into the answer card's
collapse, so the larger movement hides it. There is deliberately **no fade**: two earlier passes
(fading the row, then dipping just the label) both dropped it below full opacity and read as the
row vanishing.

On the **last** exchange it holds its name all the way out, because the next asker belongs to the
other tab, not to this one.

**Sales rows say `visitor`; Teaching rows say `member`.** That split is product truth:
`ContactPersonaDigest#identity_line` returns exactly `"a visitor (not signed in)"` or
`"Maya Chen (member since …)"` and nothing else. On a sales page `anonymous?` is true whenever
`contact.sales_agent_visitor?`; inside a course everyone is signed in by definition.

### Where the open card sits

The stack is positioned so the answer card's **centre** stays at y ≈ 367 — not by pinning its
top. Artifact heights vary a lot (offer card 245, video tile 250, plans table 189, capture form
120), and pinning the top left short cards hanging high with a pool of empty panel beneath.

Three regimes, in order of preference:

1. **fits** — centred on `CARD_CENTRE`
2. **tall** — bottom-anchored, keeping 53px of air
3. **taller** — capped at `MIN_TOP` 81, and `measure` logs what won't fit

Derived from the frames, which agree on it: course card 330.7 → top 102, plans 305 → 115,
capture 234 → 145.

### Content rules

**Answers are three lines max**, ~170 characters in the 348px column. Two dev-only warnings fire
and name the offending prompt: one past three lines, one if a card exceeds the ~419px the 600px
panel can physically show.

`**bold**` in an answer marks an inline bold run. That is real agent behaviour — the system
prompt permits *"bold inline labels and short lists"* while banning markdown headings, which
*"render as oversized titles in chat and break the conversational feel."*

### Reduced motion

Renders the first exchange statically. No loop, no slide, no shimmer, no visitor swap.

---

## Links and targets

| Element | Goes to | Confidence |
|---|---|---|
| `Learn more` | [Expert Agents overview](https://help.kajabi.com/articles/products/products-overview/expert-agents-overview) | Real published article. Confirm it's the intended destination — this is the public overview, and in-product may want something more specific. |
| `Add your first agent` | **depends on the state** (see above) | Not wired |

---

## What's real and what isn't

The demo content is **designed and reviewed**, not placeholder. Six exchanges ported frame by
frame from Figma, with questions built from Isabelle's classified production data
(n = 3,001 Teaching openings, n = 81 Sales — the Sales base is small, treat as directional).

Six **different businesses** on purpose: the point is that it works whatever you sell. Do not
consolidate them onto one fictional creator.

### Artifacts

| Artifact | Exchange | Exists in the chat today? |
|---|---|---|
| Offer card | S1 — which course for a beginner | ✅ `OfferCard` + `ShowOffer` |
| Video tile | T2 — where are the warm-ups | ✅ `VideoTile`, rendered at the timestamp — but shipped as a 120×68 row, not this large-media card |
| Source citation | T3 — sharp photos indoors | ✅ `SourceCitationCard` — but **no excerpt field**, so the pull quote is net-new, and it never renders its own `thumbnailUrl` |
| Email capture form | S2 — course updates | ❌ **net-new.** Lead capture has *no frontend at all* |
| Plan table | S3 — how much does it cost | ❌ **net-new** |
| Skills table | T1 — the five core skills | ❌ **net-new** |

**On the capture form specifically:** `Ai::Tools::Member::SalesKnowledge::LeadCapture::Create`
is a tool the LLM calls *after* the visitor types an email into the ordinary composer. The ask is
delivered as prose, in the hero's own `lead_capture_prompt` wording, as a standalone message. The
capability is real — it creates a Contact stamped `sales_agent_visitor` — but the **field is a
design proposal**. It also fires nothing: `# FLEX-3806 (stretch): fire the lead-captured
automation/workflow trigger here` is still a TODO, so a captured lead sits in Contacts until the
hero acts. Copy must not promise a triggered send.

**On the plans table:** keep it three rows and three columns. A feature matrix turns it into the
pricing-page section Sam killed on 8/18.

### Not signed off

⚠️ **The `$49` price.** Flagged in `nullStateContent.ts`. The help centre *does* confirm 1,000
messages and 250 AI credits per agent per month, and an early-adopter rate locked for 12 months
for agents bought 1 Aug–30 Sep 2026 — but not the figure itself.

### Removed deliberately

The message footer (thumbs up/down/copy) **is real** — the member chat reuses `foundry_chat`'s
`Message`, whose footer is exactly that. It is removed here on Allison's call. Note
`ratings_enabled` defaults **OFF for Sales, ON for Teaching** (`ai/chatbot/settings.rb:67`), so a
faithful build would show it on Teaching only — but the frontend gate for that flag was never
found, so removing it everywhere is the safer read.

---

## Structure

```
src/
  data/
    nullStateContent.ts   page copy + AGENT_TABS
    demoPrompts.ts        the six exchanges; DemoArtifact union lives here
    navigation.ts         prod nav model
  shell/
    AppShell/             64px topbar + 250px rail + offset content well
    Topbar/               prod appframe topbar (+ vendored kajabi mark)
    Sidenav/              prod appframe left rail
  components/
    ExpertAgentsNullState/  copy column + pricing strip + CTA
    AgentDemoPanel/         520x600 media panel + switcher tabs
    AgentDemoAnimation/     the loop. timing.ts = ALL pacing
      AgentDemoTrack        the two lanes + the slide
      DemoComposer          visitor row + input
      DemoThinking          "<Agent> thinking…"
      DemoAnswerCard        the answer + whichever artifact
      assets/               photos and avatars, exported from the frames
  styles/                 pine-core → kajabi-theme → global (prod load order)
```

### The artifact union

One exchange draws exactly one artifact, or none:

```ts
export type DemoArtifact =
  | ({ kind: 'offer' } & DemoProduct)
  | ({ kind: 'form' } & DemoForm)
  | ({ kind: 'table' } & DemoTable)
  | ({ kind: 'video' } & DemoVideo)
  | ({ kind: 'citation' } & DemoCitation);
```

A union rather than five optional fields, because optional siblings couldn't express "exactly
one" — nothing stopped an exchange carrying both a table and a video. Omitting `artifact` is a
**real shape**, not a gap: plenty of questions resolve to prose alone, and it's also how to buy
height back for a longer answer (~60–100px card instead of ~250).

---

## Pinned to the monorepo

Versions match `kajabi-products/package.json` at `1a312ca09ed` (2026-06-23):

| Package | Version |
|---|---|
| `@pine-ds/react` | `3.26.4` |
| `@pine-ds/core` | `3.26.4` |
| `@pine-ds/icons` | `10.0.0` |
| `react` / `react-dom` | `17.0.2` |

`src/styles/kajabi-theme.css` is `@kajabi-ui/styles@1.4.0`'s `kajabi_products.css`, vendored. It
loads **after** `pine-core.css` so the Kajabi token overrides win — same order as prod.

## Where the shell came from

Nothing was eyeballed; each file names its source in a header comment.

| Piece | Prod source |
|---|---|
| Topbar markup | `app/views/admin/shared/app_frame/_topbar.html.erb` (+ site selector, actions, user dropdown) |
| Topbar styles | `app/assets/stylesheets/components/app_frame/_top_bar.scss` |
| Sidenav markup | `app/views/admin/shared/app_frame/_sidenav.html.erb` |
| Sidenav styles | `app/assets/stylesheets/components/app_frame/_sidenav.scss` |
| Sidebar shell | `ladera/modules/_sleek_sidebar.scss` |
| Body padding | `_sage_shims.scss` → `sage-spacing(sm)=16px`, `(xs)=8px` |
| Widths | `_variables.scss` `$sidebar-width: 250px`; `--sidebar-offset: 64px` |
| Nav labels | `config/locales/en_admin.yml` → `en.admin.sidenav` |

Verified in-browser against prod: topbar 64px, sidebar 250px at top 64px, nav row padding-block
6px / padding-inline-start 8px / gap 8px / radius 8px, label 14px weight 500 in
`--pine-color-text-readonly`, first row top 80px, icon left edge 24px.

---

## Deliberate deviations

### From prod

1. **`pds-button` icons are slotted, not `icon=`.** Prod passes `icon="search"`, which resolves a
   *name* against the CDN set, and that prop is deprecated. Bundled, the supported path is a
   slotted `PdsIcon`. Consequence: prod's `::part(icon)` selector doesn't apply, so the icon is
   coloured directly.
2. **No mobile hamburger** — desktop-only prototype.
3. **Dropdown panels don't open.** Triggers are exact; the Sage panels behind them are out of
   scope.

### From the Figma frames

- **The video tile is a large-media card**, not the shipped 120×68 row. Justified: the small
  thumb reads as a footnote and undersells the one artifact proving the answer came from the
  creator's own course. This is a product note, not "make it bigger."
- **The citation accordion is open.** The real one is collapsed by default — but a collapsed grey
  accordion is not a visual. Arguably the first answer's citation should default open.
- **CTA sits above the pricing strip** (frame draws the reverse), so the last thing in the column
  is the price, not the action — which lands Sam's "price last in the hierarchy" note better.
- **Composer radius is 9999px** (frame: 16px).
- **The answer card has no stroke.** The frame draws a 0.61px white gradient ring; removed on
  Allison's call. Fill gradient + backdrop blur are now the only things holding its edge.
- **The switcher sits at the panel top** (frame draws it bottom).

### From the Figma *shell* (it's behind prod)

The Figma shell was cloned from a Cycle 4 frame, so: it's missing **Backstage** and **Give
Feedback** (both present here, because prod is the source of truth), it draws a uniform 32px row
pitch where prod measures 33px for plain rows vs ~32px for accordion rows, and it renders
**Amplify** heavier than its siblings where prod does not.

---

## Pine findings — for the design-systems team

### 🔴 Slotted `start` / `end` icons never render on `pds-button` (3.26.4)

The wrapper span gets `pds-button__icon--empty` whenever `hasEndContent` is false — and
`hasStartContent` / `hasEndContent` are **plain instance fields, not reactive state**. They're
set by `handleEndSlotChange`, which fires *after* the first render, so the class is computed once
as empty and never corrected.

Verified live: `hasEndContent === true`, the slot has one assigned element, and the icon still
lays out `0 × 0`.

This silently hid the CTA caret **and both switcher tab icons**. Worked around by putting icons
in the **default slot**, where they land inside `pds-button__content` and render normally. Fix is
to make both flags `@State`.

### 🔴 `--pine-typography-*` composites can't be overridden via their size token

`pds-chip` sets its label with `font: var(--pine-typography-body-sm-medium)`, and the `font`
shorthand inside shadow DOM beats inheritance — so `font-size` on the host does nothing.
Overriding `--pine-font-size-body-sm` also does nothing: a custom property's `var()` references
are substituted **where it is declared**, so that composite resolved 12px back at `:root` and
inherits down already resolved. Only the composite itself is still open to override.

Applies to every component using a `--pine-typography-*` shorthand.

### ⚠️ `pds-alert` needs four overrides for the pricing strip

- Default mode **stacks actions below** the description; `small` puts content and actions in one
  row with `margin-inline-start: auto`, which is the right-aligned link the design needs.
- `small` **drops the `heading` prop**, so both lines are slotted and styled as light DOM.
- Its heading renders 16px/400; the design is 14px/600.
- It pads `--pine-dimension-250` (20px) as a **single shorthand** on `.pds-alert__container`, in
  shadow DOM with **no `part`**. The design needs 16px. A token override can't express it, so the
  component adopts one extra stylesheet into the shadow root — **the only shadow-piercing rule in
  the codebase.** A `container` part or a padding prop would remove it.

That injection has two non-obvious requirements, which is the strongest part of the case:

1. **It must wait for the shadow root.** Pine upgrades asynchronously, so `ref.current.shadowRoot`
   is usually null in a mount effect. Retry on `setTimeout` — deliberately *not*
   `requestAnimationFrame`, which doesn't run in a background tab.
2. **Adopting early loses the cascade.** `adoptedStyleSheets` apply in list order, so a sheet
   adopted the moment the root appears sits *before* Pine's own. The selector is
   `.pds-alert__container.pds-box` (0,2,0), which beats Pine's (0,1,0) on specificity rather than
   order — preferred to `!important` because it stays overridable.

### ✅ Smaller notes

- `pds-tabs` **does** ship a `pill` variant in 3.26.4 — but it's 36px tall against the frame's
  25px, `flex: 1` forces equal widths, and there is **no on-dark or glass variant**. A glass chip
  is the concrete ask.
- `pds-alert` has an undocumented **`hideIcon`** prop (in 3.26.4, absent from the MCP docs).
- `SourceCitation` declares **`thumbnailUrl` and the card never renders it** — always the icon
  placeholder. Only `VideoTile` uses it. A thumbnail-led citation is a **one-line change**.
- `pds-button` micro pads `2px 8px` in shipped CSS but `[2,10,2,10]` in the Figma library. This
  code follows the **shipped CSS**, so buttons measure ~4px narrower than the frames.

---

## Gotchas that cost real time

Recorded so nobody rediscovers them.

1. **Figma gradient stops are meaningless without `gradientTransform`,** and gradient space is
   **normalised to the box, not to pixels.** The composer's stroke direction vector reads
   `(0.916, 0.121)` — apparently ~7.5° — but per pixel on a 380×48 pill it's
   `(0.916/380, 0.121/48)`, i.e. **46.3°**. Always divide by the box dimensions. Verify by
   sampling the alpha of an isolated `contentsOnly` export.
2. **CSS `border` can't be a gradient and honour `border-radius`** (`border-image` ignores
   radius). Every gradient stroke here is a masked `::before` ring: INSIDE-aligned → `inset: 0`,
   OUTSIDE → `inset: -Npx`.
3. **`object-position` is a fraction of the OVERFLOW,** so the crop moves whenever the window
   height changes. Growing the offer card's media band 112 → 180 shifted it 60.7% → 62.9%.
4. **Exporting an image node clips it to its parent's bounds,** so the asset arrives with the
   crop already baked — which also means it **cannot survive a geometry change**. The video still
   had to be re-exported when its window grew.
5. **Every grid row is its own grid.** An `auto` column sizes per row, so columns don't align
   across rows — the plans table's header sat 27px right of its values until the column was given
   a shared fixed width.
6. **Use `tabular-nums` for any column of figures.** Proportional digits made three prices
   measure 50/52/51, which is a visible 2px stagger.
7. **Never measure a Pine component once.** It upgrades asynchronously; use a `ResizeObserver` or
   retry on `setTimeout`. Never `requestAnimationFrame` alone — it's dead in a background tab.
8. **`offsetHeight` rounds to an integer.** A card rendering 326.4 reports 326 and the slot comes
   up short. Use `getBoundingClientRect()` + `Math.ceil`.
9. **`overflow: hidden` on the animated slot clips outset rings AND drop shadows.** The slot's
   clip box is grown 20px (`SHADOW_ROOM`) and pulled back with negative margins.
10. **A node that mounts on the frame it should start animating has nothing to transition from —
    it pops.** Keep it mounted and toggle a class; conditional rendering is the bug.
11. **Curve matters more than duration for "abrupt".** `cubic-bezier(0.16, 1, 0.3, 1)` covers
    most of its distance in the first third, so slowing it just makes a slow lurch.
12. **Testing gotcha:** automated browser tabs run in the background, where Chrome clamps timers
    to ~1s and pauses `requestAnimationFrame`. Transitions freeze at `currentTime: 0` and computed
    transforms read stale while inline styles are correct. **Any timing- or transition-dependent
    check must be done in a foreground tab.** Geometry measurements are fine either way.

---

## Open questions for the pod

1. **Agent naming is unresolved and now blocking.** The tabs put both names on screen at 12px.
   Code says `Ai::Chatbot::SalesAssistant` / `TeachingAssistant`; designs say "Sales Agent";
   Isabelle's mock said both "Teaching Agent" and "Teaching Assistant".
2. **Will the three net-new artifacts be built?** S2's is the strongest ask — creators selling
   live or coaching products have no artifact at all today.
3. **Is `ratings_enabled` honoured in the member chat frontend?** If it is, thumbs-off-on-Sales is
   a free, verified tab differentiator.
4. **Can a pre-purchase account run a live agent?** The panel is built around that idea.
5. **Product finding worth acting on:** ~13% of Sales-agent openings are existing customers asking
   how to access what they bought — a support question hitting the sales widget, which by its own
   boundaries must deflect.

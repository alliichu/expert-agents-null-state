# Marketing Null States — Prototype

Cycle 5 pod: **marketing-focused null states** (Expert Agents first, then Backstage).
Notes, copy versions and research live in `~/kajabi-work/cycle-5/marketing-null-states/`.

Target design: Alli's Sketchbook → page `↳ Scratchpad - null state` → **node `1406:64096`**.

## Status

Admin chrome (topbar + left rail) built from prod. **Expert Agents null state page** built from
Figma `1406:64096` — copy column pixel-verified, media panel built with the full "ask anything"
demo loop and a sliding agent switch. ⚠️ The demo's questions and answers are still invented
placeholder content (`src/data/demoPrompts.ts`).

## Run

```bash
npm install     # .npmrc sets legacy-peer-deps (Pine peers react@^18, we pin 17 like prod)
npm run dev     # http://localhost:5200
```

## Versions

Routes in this one app, never folder clones (pod convention).

| Route | Version | What it is |
|---|---|---|
| `/` (or `/v1`) | **V1** | live. The page Sam reviewed — copy is EL-tone v7, "An expert, on every page" |
| `/v2` | **V2** | ❌ **scratched 8/20** — kept running, not deleted, not being taken further |

V2's copy never actually diverged from V1's, so what it carried was the **text-tabs switcher**
(`1474:68298`). That treatment is still available as `switcher="text"` on `AgentDemoPanel` if it
is ever wanted on V1 — parked, not removed.

Both routes render the **same page component**. `App.tsx` holds one table saying what each
version is; today they differ in two things:

| | V1 | V2 |
|---|---|---|
| copy | `NULL_STATE_V1` | `NULL_STATE_V2` (still a duplicate of V1) |
| switcher | `chip` — Figma `1436:67068` | `text` — Figma `1474:68298` |
| switch transition | `slide` | `slide` |

Everything else — the admin shell, the aura panel, the ask-anything animation and all its
timing — is shared, so the pixel-matched parts can't drift apart between versions.

`transition` is still a per-version field even though both now say `slide`: it's an axis
independent of the switcher treatment, and `cut` (remount the demo in place) is what a version
would want if the slide turns out to be wrong for it.

**The `text` switcher** (V2) drops the glass chip entirely: the active tab is white, the
inactive one is white at 50%, and that opacity step is the only thing marking the selection.
It is the same `Icon/Square/Light` node as the chip with its gradient fill and stroke set to
`visible: false` (the 14.643 radius is still on it, unused), one type step up — 14px/500 labels,
16px icons, 28px tall, 4/12 padding.

Implemented as a `switcher` prop on `AgentDemoPanel`, not a forked panel: it's the same control
with a different treatment, and forking would have duplicated the animation mount for one visual
difference. `size="small"` is the closer Pine size — it already ships 14px at weight 500, exactly
the frame's Inter Medium 14 — and only its box needed correcting (Pine pads small 3/16 in a 32px
min-height; the frame is 4/12 in 28px). The vertical padding subtracts `--pine-border-width` the
way Pine's own `small` rule does: the tertiary button's border is transparent but still takes
layout, so a flat 4px rendered 30px tall instead of 28.

Not reproduced from that node: its LINEAR_BURN drop shadow and 4.068 background blur are still
switched on, but with no fill behind them they'd paint a faint hard-edged rectangle over a smooth
gradient — leftovers from the chip variant rather than part of this treatment.

Editing V2's object cannot touch V1, which is the same working rule as the Figma file: every
copy pass gets its own frame and never overwrites the one before it.

If a version needs a different **layout** rather than different copy, fork
`ExpertAgentsNullState` into its own folder and point that route at the fork in `App.tsx` —
the route indirection is already there. Unknown paths fall back to V1.

`vercel.json` rewrites everything to `index.html` so `/v2` resolves on a deploy as well as in
dev, where Vite's SPA fallback already handles it.

## Pinned to the monorepo

Versions match `kajabi-products/package.json` at `1a312ca09ed` (2026-06-23):

| Package | Version | Why |
|---|---|---|
| `@pine-ds/react` | `3.26.4` | exact monorepo pin |
| `@pine-ds/core` | `3.26.4` | ships with react wrapper; prod loads the same version from jsDelivr |
| `@pine-ds/icons` | `10.0.0` | exact monorepo pin |
| `react` / `react-dom` | `17.0.2` | what kajabi-products actually runs |

`src/styles/kajabi-theme.css` is `@kajabi-ui/styles@1.4.0`'s `kajabi_products.css`, vendored.
It loads **after** `pine-core.css` so the Kajabi token overrides win — same order as prod.

## Where every value came from

Nothing here was eyeballed off the Figma. Each file names its source in a header comment.

| Piece | Prod source |
|---|---|
| Topbar markup | `app/views/admin/shared/app_frame/_topbar.html.erb` (+ `_topbar_site_selector`, `_topbar_actions`, `_user_dropdown`) |
| Topbar styles | `app/assets/stylesheets/components/app_frame/_top_bar.scss` |
| Sidenav markup | `app/views/admin/shared/app_frame/_sidenav.html.erb` |
| Sidenav styles | `app/assets/stylesheets/components/app_frame/_sidenav.scss` |
| Sidebar shell | `app/assets/stylesheets/ladera/modules/_sleek_sidebar.scss` (`.sleek-sidebar`, `.appframe-sidebar`) |
| Body padding | `app/assets/stylesheets/_sage_shims.scss` → `sage-spacing(sm)=16px`, `(xs)=8px` |
| Widths | `_variables.scss` `$sidebar-width: 250px`; `--sidebar-offset: 64px` |
| Nav rows + icons | `app/views/admin/shared/_sleek_sidenav.html.erb` |
| Nav labels | `config/locales/en_admin.yml` → `en.admin.sidenav` |
| Kajabi mark | `app/views/admin/sidenav/_kajabi_logo_no_text.html.erb`, vendored verbatim |

Measured in-browser and matching prod: topbar 64px, sidebar 250px at top 64px, nav row
padding-block 6px / padding-inline-start 8px / gap 8px / radius 8px, label 14px,
text `--pine-color-text-readonly`, weight 500, first row top 80px, icon left edge 24px.

## Known deviations from prod (deliberate)

1. **`pds-button` icons are slotted, not the `icon=` attribute.** Prod passes `icon="search"`,
   which resolves an icon *name* against the CDN set — and that prop is marked DEPRECATED in
   `pds-button`. Bundled, the supported path is `<PdsIcon slot="start" icon={imported} />`.
   Same rendered mark, current API. Consequence: prod's `::part(icon)` selector doesn't apply,
   so `Topbar.css` colours the slotted icon directly.
2. **No mobile hamburger.** Prod renders one and hides it above `lg`. Desktop-only prototype.
3. **Dropdown panels don't open.** Site switcher and user menu triggers are exact; the Sage
   dropdown panels behind them are out of scope for the shell pass.

## Known deviations from the Figma frame (flag before handoff)

The Figma shell was cloned from a Cycle 4 frame (`229:306`), so it is slightly behind prod:

- **Figma is missing `Backstage`**, which prod renders (with a Beta chip) between Partner
  Program and More. Present here, because prod is the stated source of truth.
- **Figma is missing `Give Feedback`** in the footer under Settings. Present here.
- **Figma draws a uniform 32px row pitch.** Prod's plain `pds-link` rows measure 33px while
  `pds-accordion` rows measure ~32px — a real 1px difference that comes from Pine, not from
  this code.
- **Figma renders `Amplify` in a heavier weight** than its siblings. Prod does not.

## Page: Expert Agents null state

Geometry read off `1406:64096` via `get_design_context`, then measured in-browser. All match:

| | Figma | Rendered |
|---|---|---|
| hero | 1004 × 600, centred in the 1190px well | 1004 × 600 ✓, centred on **both** axes — see below |
| copy column | 420 wide, 32px stack gaps | 420 ✓, gaps 8 / 32 / 32 ✓ |
| gap to media | 64 | 64 ✓ |
| media panel | 520 × 600, 16px radius | 520 × 600 ✓ |
| headline | 26px semi-bold, −0.5px tracking, 1.25 lh, #1a1a19 | ✓ (h 32.5 vs 33) |
| body | 14px regular, 1.425 lh, #4d4d4c | ✓ (h 59.8 vs 60) |
| values block | 208 tall, 24px gaps | 219.8 — see below |
| value description | 14px, **20px** lh, **−0.16px** tracking | ✓ |
| pricing strip | 420 × 63, 16/12 padding, 10px radius | 420 × 71.9 — restyled off a reference 8/21, see below |
| CTA | 166 × 36 | 167 × 36 |
| tabs group (V1 chip) | 279 × 73, centred, 24px padding | 311 × 73 ✓ centred, flush — see below |
| active chip (V1) | 93 × 25 | 112.5 × 25 — see below |
| inactive button (V1) | 130 × 24 | 145 × 24 |
| tabs group (V2 text) | 353 × 76 | 351.1 × 76 ✓ |
| V2 active tab | 125 × 28 | 123.9 × 28 ✓ |
| V2 inactive tab | 172 × 28 | 171.2 × 28 ✓ |

⚠️ **The three V1 switcher rows above were previously recorded 18–20px narrower** (chip 92.5,
inactive button 127). Those numbers were measured while the tabs' icons weren't laying out, so
each is short by exactly one icon + its 4px gap. Corrected here from a live measurement.

That leaves a real **V1-only** gap: the frame draws the active chip at 93 and the inactive tab at
130, while a 1:1 build of the same content is 112.5 and 145. The chip node carries fractional
metrics (14.643 radius, 0.610 stroke), which the pod notes already put down to the chip having
been **scaled off another artboard** — 93 / 112.5 ≈ 0.83, consistent with that. So the frame's
numbers aren't a 1:1 spec and the build is not wrong; worth confirming with Allison. **V2's frame
(`1474:68298`) has none of this** — 28px tall, 4/12 padding, 16px icons, 14px text, all integers —
which is why every V2 row lands within ~1px.

### Deliberate changes from the Figma frame (Allison, 8/20)

- **4px gap between each value's title and its description.** The frame has them flush, which
  made the values block 208 tall; with the gap it's 220.
- **Subhead and value descriptions use `color/text/readonly`** (`--pine-color-text-readonly`,
  #6c6a69) instead of the frame's grey-800 #4d4d4c.
- **The CTA carries a trailing caret** (8/21). The frame's button (`1406:64134`) is label-only.
  Pine has **no `chevronRight`** — that shape is `caretRight` in its set, the same icon the
  sidenav's disclosure arrows use. Slotted into `slot="end"`, sized explicitly at 16px because
  Pine styles a slotted `pds-icon` for colour only, never size. Button goes 167 → 191 wide, 36
  tall unchanged, Pine's own 8px content gap.
- **The hero is centred vertically by computation, not by a fixed offset** (Allison, 8/21 —
  *"it feels a little like it's more to the bottom than centered"*). It was
  `padding-block-start: 188px`, taken off the Figma frame. That 188 is not arbitrary: it is
  what centring resolves to at the frame's own height (188 + 600 + 188 = 976, plus the 64px
  topbar = a 1040px artboard). Hard-coded, it only stays centred at exactly 1040 — at
  Allison's 962px window it put **188 above the hero and 110 below**, which is the low-sitting
  she spotted. `.null-state` now fills the well (`min-block-size: calc(100vh - 64px)`) and
  centres the hero in it, so it reproduces the frame at 1040 and holds everywhere else.
  Measured at 962: **149 / 149**.

  The `padding-block: 48px` is a **floor, not spacing** — `min-block-size` is a minimum, so
  on a well shorter than 600 + 96 the element grows past it and the padding keeps the hero
  clear of the topbar rather than letting the top half go unreachable. Verified by simulating
  500px and 660px wells: the hero stays 600 tall and 48px down, never clipped.

- **The CTA sits ABOVE the pricing strip** (8/20). The frame puts the strip first. This also
  reads better against Sam's 8/19 pricing note — price should be last in the visual and
  informational hierarchy, and now the last thing in the column is the price, not the action.
  The copy column is a plain 32px-gap flex column, so this was a JSX reorder with no CSS.
- 🔄 **The pricing strip was restyled off a reference on 8/21** (Allison: *"make the grey
  container on the left styled like this but keep the copy I currently have"*). The reference
  was a screenshot, so every value below was **measured out of the pixels** rather than read
  off a spec — the method is worth knowing because the file was not Inter and not at a known
  zoom, so absolute sizes had to be triangulated from ratios:

  | | was | now | how it was measured |
  |---|---|---|---|
  | container border | 1px #d2d1d1 | **none** | fill goes #f0f0f0 → page in ~1px of antialiasing; no ring at any edge |
  | heading | 14px/600 | **14px/600** (see below) | the reference reads 16px — x-height ratio to its body is 1.158 → 16/14, not 16/13 — but Allison overrode it back to 14 |
  | body | 13px/400 | **14px/400** | ditto; also the reference's two-line copy block measures 44px, and 16 + 14 at 1.425 + the 2px gap = 44.75 |
  | heading → body gap | 0 | **2px** | baselines sit 22px apart in the reference, ~2px more than two flush 1.425 line boxes |
  | "Learn more" size | 12px | **14px** | the link's 'o' and the body's 'o' have the same subpixel x-height (13.2 vs 13.7 @2x) — so the link is body size, not a step under it |
  | "Learn more" weight | 500 | **500** | the link's glyphs carry ~20% more ink than the body's at that same size — one step, i.e. medium. Set earlier the same day; the reference confirmed it |
  | "Learn more" colour | #1a1a19 | **#4d4d4c** | sampled: link 77,77,76 vs body 78,78,77 — the link is the body's colour, not text-strong |

  The fill (#f0f0f0) and the 10px radius already matched and were left alone.

  **The link no longer shrinks to stay quiet — it recedes by colour instead.** That reaches the
  same end as the 8/20 note it replaces (Sam's 8/19 "price last in the hierarchy") by a
  different route: the link is now a peer of the body copy in size and colour, and only the
  weight separates it.

  ⚠️ **Two deliberate misses, both flagged to Allison:**
  1. **Block padding stays 14px**, which she set earlier the same day. The reference measures
     **~11px** — its container is 66 tall against this one's 71.9. One token to change if she
     wants the exact proportion.
  2. **The link stays flush right at the 16px padding** (17px inset with the transparent
     border). The reference insets it **~27px**, 10px more than its own left padding. That
     reads as an artifact of however that mock was built rather than intent, so it was not
     copied.

  ✅ **The heading went back to 14px the same day.** Allison, seeing it built: *"free for 30
  days font styling should be the same as 'Keep buyers and members moving'"* — so
  `.null-state__pricing-heading` is now declaration-for-declaration identical to
  `.null-state__value-heading` (14px / 600 / 1.425 / #1a1a19, verified equal on all six
  computed properties). **Keep the two in step if either moves.**

  That also settles the hierarchy problem the 16px version raised: it had made the price the
  largest type in the copy column after the H1, which worked against Sam's 8/19 note that
  price should be **last** in the visual hierarchy. At 14/600 the strip's heading is a peer of
  the value-prop headings and only the grey block sets it apart. Net: the strip's heading and
  body are now the same size, and weight alone separates them — flatter than the reference,
  quieter than the reference.

  Strip is **420 × 71.9**.

### The chip measured a zero-width tab (fixed 8/20)

Worth knowing because it is invisible until it isn't: the glass chip is sized from the tab it
sits behind, and a tab rendered while the page is in a **background tab** can report a width of
**zero**. The chip then came out 8px wide — nothing but its own outset — and stayed there,
because the measurement was a one-shot with only a `requestAnimationFrame` retry, and rAF does
not run in a background tab either.

It now re-measures from a **ResizeObserver** on the tab row and both tabs, which covers all
three cases that change a tab's box: Pine hydrating asynchronously, Inter loading late, and a
zero-width first layout. Same class of bug as the pricing-strip padding below — a one-shot
measurement or injection against a component that isn't ready yet.

### Pine findings (for the design-systems team)

1. **`pds-tabs` ships a `pill` variant in 3.26.4.** This answers the open question in the pod
   notes — the pill switcher does **not** need hand-building. Used here.
2. **`pds-alert` has a `hideIcon` prop** that the Pine MCP docs do not list (it is in the
   3.26.4 source and works). It covers Sam's 8/19 "remove the sparkle icon" note.
3. ⚠️ **`pds-alert` needs four overrides to render the designed pricing strip** — solved, but
   the friction is worth reporting:
   - Its **default mode stacks actions below** the description. `small` puts content and
     actions in one centred row with `margin-inline-start: auto` on the actions, which is the
     right-aligned link the design needs — so the strip uses `small`.
   - `small` **drops the `heading` prop entirely**, so both lines are slotted instead and
     styled as light DOM.
   - Its heading renders **16px/400**; the design is 14px/600 (same as the value-prop titles).
   - It pads **`var(--pine-dimension-250)` = 20px** as a single shorthand on
     `.pds-alert__container`, in shadow DOM with no `part`. The design is asymmetric 16 inline
     / 14 block (Figma `1406:64122` draws 420 × 63, padding [12, 16, 12, 16], radius 10;
     Allison raised the block padding 12 → 14 on 8/21 for a little more air), which a token
     override can't express — so the component adopts **one extra stylesheet into the
     shadow root**. 14px is a literal: Pine's scale steps 12 (`dimension-150`) → 16
     (`dimension-200`) with nothing between. That is the only shadow-piercing rule on the page.

     ⚠️ **That override silently failed for most of 8/20, and both reasons are worth knowing**
     — they are the strongest part of the case for exposing a `container` part or a padding
     prop, because a consumer has to get two non-obvious things right to change one number:

     1. **It has to wait for the shadow root.** Pine upgrades its custom elements
        asynchronously, so `alertRef.current.shadowRoot` is usually still null when a mount
        effect runs. The original code read it once and returned — so whether the padding
        applied came down to whether it won that race, which is why the strip measured 80.5
        tall on some loads and 64.5 on others. It now retries on `setTimeout`, deliberately
        not `requestAnimationFrame`, which doesn't run in a background tab.
     2. **Adopting it early puts it BEFORE Pine's own sheet.** `adoptedStyleSheets` cascade in
        list order, and adopting the moment the shadow root appears lands ahead of the sheet
        Pine adopts during upgrade — so at equal specificity (`.pds-alert__container`, 0,1,0)
        Pine won and the padding stayed 20px even once the sheet was attached. The selector is
        now `.pds-alert__container.pds-box` (0,2,0), which wins on specificity regardless of
        order. Preferred to `!important` because it stays overridable.

     Measured: **14px block / 16px inline**. The strip is 420 × 74.7 as of the 8/21 restyle;
     it was 64.5 against the frame's 63 at the frame's own 12px block — the 1.5 is browser
     line-height, not padding — and the 8/21 +2px each side plus the bigger type accounts for
     the rest.

     ✅ **The alert's border, by contrast, needed none of this.** Removing it for the 8/21
     restyle is a one-liner on the host — `--pine-alert-color-border: transparent` — because
     `.pds-alert__container` re-reads that token inside the shadow root and custom properties
     inherit through the boundary. Which is exactly the shape the padding ask above wants:
     had padding been a token rather than a hard-coded shorthand, there would be no
     shadow-piercing rule on this page at all.

   A `headingSize`/`actionsPlacement` prop, or exposing `container`/`heading` as parts, would
   remove all of this.
4. ⚠️ **`pds-button` exposes no ARIA props and no way to reach its inner `<button>`.** Its
   props are layout/behaviour only (`variant`, `size`, `iconOnly`, `href`, `loading`, …), and
   the real button lives in the shadow root — so `role`, `aria-selected` and friends can only
   be set on the *host*. The switcher here does that (`role="tab"` + `aria-selected` on the
   host), which is valid enough to convey state but leaves the focusable control itself
   unlabelled by the role. **Handoff note:** the shipped version should use a real tabs
   primitive, or Pine should forward `aria-*` to `part(button)`. The demo panel it controls is
   `aria-hidden` decoration, so there is deliberately no `tabpanel` wired up here.
5. 🔴 **`pds-tabs variant="pill"` was tried and rejected on visual grounds.** It exists and
   works, but its metrics and palette are wrong for this design: 36px tall vs the frame's 25px,
   `flex: 1` forcing equal-width tabs (the frame draws 93px and 130px), and a light-surface
   palette — Pine ships **no on-dark / glass pill variant**. Pinning the frame's 279px group
   width made the tablist wrap onto two rows.
   The switcher matches `1436:67068`: a translucent glass chip for the active tab (no Pine
   equivalent — hand-built, with the frame's fractional values reproduced rather than rounded)
   beside a real `pds-button size="micro" variant="tertiary"`, whose Pine metrics already match
   the frame (12px type, 24px min-height). Only that button's colour is overridden, for dark.

   **Both tabs render as that button, with one chip sliding between them.** The frame draws the
   active tab as a *different element*, which makes switching a hard cut — there is nothing
   continuous to animate. One moving chip keeps every static state identical to the frame and
   gives the motion something to interpolate. The chip is offset `CHIP_OUTSET = 4px` per side,
   derived: the frame's chip pads 12px where Pine's button pads 8px.
   Motion is 260ms on `--motion-ease-out` (the same curve the role-permissions prototype uses),
   with a `prefers-reduced-motion` guard. `width` is animated rather than `scaleX` because the
   tabs differ in width and scaling would distort the 14.643px radius.
   **A glass / on-dark chip is the concrete ask for design systems.**
6. ⚠️ **`get_design_context` flattens gradient strokes and mis-reports stroke alignment.**
   For the chip it returned `border-[0.61px] border-[rgba(255,255,255,0.6)]`. The node itself
   (read via `use_figma`) has a **gradient** stroke — white 0.6 at the top fading to 0.2 at the
   bottom — aligned **OUTSIDE**. A uniformly bright ring is visibly wrong, and the outside
   alignment means the stroke must not add to the box.
   Implemented as a masked `::before` ring: CSS `border` can't take a gradient and still follow
   `border-radius`, and `border-image` ignores radius entirely.
   🔴 **And reading the node's stops is still not enough — you must apply
   `gradientTransform`.** Figma stops are in *gradient* space; the transform scales and
   offsets that space relative to the object. The composer's fill reads as stops 0.404 and
   1.0, but its transform scales by 0.604, so in object space those land at **66.9%** and
   **165.5%** — the ramp runs a third again past the right edge and bottoms out near alpha
   0.66 instead of reaching transparent. Taking the stops at face value made the box dissolve
   from 40% and vanish by its right edge, which looked nothing like the design.
   **Verify by sampling the alpha channel of an isolated `contentsOnly` export** — that gave
   flat 1.0 to ~66% then a linear fall to 0.68, matching the transformed maths and confirming
   the fix to within 0.005 at every sample.
   **Lesson: for anything with a stroke, read the node with `use_figma`, not just the
   design-context reference.** The reference also flattened the shadow's `LINEAR_BURN` blend
   mode (no CSS equivalent; imperceptible at 4% black) and Figma's BACKGROUND_BLUR radius of
   4.068, which maps to `backdrop-filter: blur(2.034px)` — half the Figma value.
6. ⚠️ **Figma bakes a node's rounded clip into `get_screenshot` exports, filling outside the
   radius with the app background** rather than leaving it transparent. Sampling the corner
   pixel of the panel export returns `#f8f8f8`. Dropped into a container with its own rounded
   clip, that reads as four pale corner wedges. Cloning the node and zeroing its `cornerRadius`
   does not help — the nested transformed artwork exports as 1x1 once detached from its
   clipping parent. Worked around by outsetting the stage 20px so the baked corners fall
   outside the visible box; the artwork is blurred by 137px, so the crop is imperceptible.
   **Check corner pixels on any Figma-exported background before trusting it.**
7. **Figma's tabs-group frame carries an invisible stroke** (`visible: false`, bottom side only)
   and a hidden fill. Neither renders; both are artboard residue, not design intent.
8. ⚠️ **Pine's tertiary hover paints a container.** `.pds-button:hover` fills from
   `--pds-button-color-background-hover`, which tertiary sets to `--pine-color-background-muted`
   — a light grey pill, wrong on a dark panel. Those custom properties are declared on the
   button *inside* the shadow root, so setting them on the host has no effect; `::part(button)`
   is the only lever. Hover here is text-only (white → `rgba(255,255,255,0.7)`), per the design.
9. 🔴 **Pine `pds-button` micro: Figma library and shipped code disagree on padding.** The
   Figma component instance has `[2, 10, 2, 10]`; `pds-button.css` ships
   `padding: var(--pine-dimension-025) var(--pine-dimension-xs)` = **2px 8px**. That 2px a side
   is the entire remaining gap — 127 rendered vs 130 designed, which is also the group's 275.5
   vs 279. The prototype follows the **code**, so it shows what a dev would actually get.
   Overriding to 10px is a one-liner if the design should win instead.
6. **Figma's `--neutral/200` (#f1f0ef) is not a Pine token.** Nearest is
   `--pine-color-grey-150` (#f0f0f0). Kept literal in the placeholder since the animation
   replaces it.

## Demo animation (the "ask anything" loop)

`src/components/AgentDemoAnimation/`. Reference is Origin's *Ask anything* section
(useorigin.com), but note what that reference actually is:

- **Theirs is scroll-driven**, playing across a ~2300px pinned region — its pacing is scroll
  *distance*, not time. This panel autoplays, so **there were no timings to lift**; every
  number here is authored.
- It is plain DOM (not video / canvas / Lottie), so the pattern is reproducible.
- Programmatic scrolling does not fire their Webflow scroll triggers, so it can't be stepped
  frame-by-frame from the console.

**All pacing lives in one file — `timing.ts`.** Nothing in the component or the stylesheet
hard-codes a duration; the rig publishes each one to CSS as a custom property, so the state
machine and the transitions cannot drift apart. Tuning the feel = editing that one file.

Phases: `typing → thinking → answer → hold → exit → gap`, looping, with `typing` derived
per-character from the prompt length. **A full exchange runs ~10s, so all three take ~30s** —
paced so someone reading the left column can look over, follow one question end to end, and
look back. **The prompt is never sent up as a bubble** — it types
into the composer and stays there, then "Thinking..." appears *below* the composer and the
answer opens in that same spot, so the two read as one continuous response. Verified in-browser against `timing.ts`:
submit 300ms, thinking 1400ms, answer 475ms (target 460), hold ~2.9s (target 2.8s).

**Composer — done, matched to `1437:67161`.** It is constant: never animates in or out, and
the caret blinks continuously whether or not anything is being typed. Verified in-browser at
x=70, 380x48, radius 16, padding 8/8/8/16, gap 8.75 (its y is not fixed — the rig moves the
whole stack per state). Two things the node carries that a
flattened export would lose: the **fill is a gradient** (opaque white to 40.4%, then fading to
fully transparent at 90deg — that's why its right end dissolves into the aura), and the
**stroke is also a gradient** (#e4e4e4 fading out at ~172deg), so it uses the same masked-ring
technique as the switcher chip, inset 0 because this stroke is INSIDE-aligned. The caret is a
`|` glyph in 14px Inter Semi Bold **#2563eb**, and the send button is a real
`pds-button variant="primary" icon-only size="small"` with `arrow-up` — Pine's icon-only small
is exactly 32px, matching the frame.

**Thinking state — done, matched to `1466:67614`.** "&lt;Agent&gt; thinking…" at 12px Inter
Medium with the switcher's 14px agent icon, 12px below the composer (`1466:67563`: 318 − 306).
It reuses the switcher's `Icon/Square/Light` chip **with its fill and stroke set to
`visible: false`**, so there is no pill and no border here — only the icon, the label and the
chip's backdrop blur. Copying the chip's glass background would have been wrong.

The label **shimmers**, which the frame cannot show: its version is the label plus two white
rectangles, one covering it and one parked 62px to its left at 0.8 opacity — a **sweep masked
by the glyphs**, not a fill. Sampling the rendered node settles it: the glyphs come out solid
white (255,255,255) with a dimmer ramp at the edges, not the #6c6a69 the text fill declares.
The frame captures one moment of that sweep; here it moves, via a gradient clipped to the text
with `background-clip: text`. A still loading state reads as stalled.

It stays **mounted** and fades (260ms, `--motion-ease-out`, plus a 4px rise) rather than being
conditionally rendered — a node that mounts on the same frame it should start animating has no
previous state to transition from, so it pops. The shimmer keeps running while hidden so it
never restarts mid-sweep.

**Answer card — done, matched to `1437:67124`.** 380 wide, radius 16, 16px padding, 20px gap.
Verified in-browser against `1455:67300` (the open state): composer input 380x48 at y=138, card
380 wide at y=202, **344.3** tall where Figma draws 345. Placement is covered under the stack's
geometry below.

**Neither card carries a stroke as of 8/20** (Allison: *"in both of these glass cards can we
remove the stroke"*). Two went:

- the outer glass card's white 0.6 → 0.2 gradient ring, which was a masked `::before` because
  CSS `border` takes no gradient while honouring `border-radius`;
- the inner product card's `1px solid #d2d1d1`, which over the aura was reading as a hard grey
  line along its bottom and right edges.

The card is 2px shorter as a result (346.3 → 344.3, the product card losing its border box), and
nothing had to move: its top stays pinned at 202 and the slot measures the new height itself.
The card's edge is now carried by its fill gradient and backdrop blur alone — which raises the
stakes on the drop-shadow question below, since the shadow is the only other thing separating it
from the aura.

Its fill is still a gradient, and it hit the transform trap — the stops read white 1.0 -> 0.5 but
the ramp runs to ~210% of the box, so the far corner only reaches **0.737** (sampled), never 0.5.
The stroke had its own version of the same trap: its transform *scaled by 3.42*, compressing the
ramp into roughly the first **29%** of the card, so in the frame it is crisp top-left and gone
before the middle. Worth knowing if it ever comes back.

⚠️ The inner block is **named `pds-alert` in the file but is not one structurally** — it's
media + title + meta + button, which pds-alert cannot express (it does icon + heading +
description + actions, as documented above). Built from primitives with a real `pds-button`
for the CTA. Worth confirming with Allison that the layer name is incidental.

**The expand's curve mattered more than its duration.** It originally used
`cubic-bezier(0.16, 1, 0.3, 1)`, which covers most of its distance in the first third — on a
350px height change that is a lurch, and slowing an aggressive curve only makes it a slow
lurch. The entrance curve is now `cubic-bezier(0.4, 0, 0.2, 1)`, gentle at both ends.
Measured, the open now climbs 37→62→141→217→276→305→324→336→341 where it previously jumped
to 204 within two frames.

The card's **fade runs longer than its height** (`answerFadeMs` 700 vs `answerInMs` 600) so it
finishes settling after the geometry has stopped — that offset is what keeps the arrival calm.

**The thinking label and the card cross-fade.** Both stay mounted and are absolutely
positioned inside the slot; the rig sets the slot's height explicitly from whichever is
active, so it can be transitioned. Swapping them with a ternary made the card pop — a node
that mounts on the frame it should start animating has no previous state to transition from —
and with both out of flow neither fights over the height, so they can overlap during the
hand-off instead of one finishing before the other starts. Measured mid-transition, height and
opacity interpolate together: 32→204→269→311→329→342 against 0→0.55→0.76→0.89→0.95→0.99. (Those
numbers were taken at the earlier 560ms tuning; the shape is the same at 600/700.)

**Closing is authored separately from opening**, not the same motion reversed. It runs on
`EASING.collapse` (eased in *and* out) rather than the entrance curve — the entrance curve
front-loads its travel, which is right for something arriving and reads as a snap for
something leaving. Measured, the height now falls 342→336→320→284→235→135→61→24→9→0: slow to
let go, quickest in the middle, settling at the end.

**The card's fade-out is shorter than the collapse it happens inside** — `exitFadeMs` 400
against `exitMs` 600 — **and it is `linear`** (changed 8/20; Allison: *"there's this weird fade
at the very end that lingers"*).

Both halves of that mattered. It used to fade across the entire 600ms collapse on
`EASING.collapse`, which eases out of its end, so the last few percent of opacity crawled and
the 6px blur kept a smeared ghost of the card on screen for the whole tail. Opacity is the one
property where a curve mostly works against you: ease *out* leaves that tail, and ease *in*
holds the card up and then snaps it away — which is what a first pass at 240ms read as (*"a
little too fast"*). Constant rate does neither, so the duration alone sets the feel and 400 is
just the dial.

The height and the stack's top still take the full 600ms on the collapse curve, so the order of
events is now honest: the answer goes, then the space it occupied shuts.

**The prompt backspaces out** at 16ms/char rather than vanishing in a frame, and the exit
phase is sized to cover it (`max(exitMs, len × deleteCharMs + 240)`) so the text and the
collapse finish together — measured 26→22→19→15→12→8→5→1→0 characters against that height fall.

**The stack's vertical position is set per state, and the open state is pinned to the frame**
(changed 8/20 on Allison's note "move it down so it should land right here", pointing at
`1455:67300`).

| state | stack top | source |
|---|---|---|
| collapsed / typing | 258 — `(600 − 84) / 2` | centred; `1467:67619` rests the composer at y=258.5 |
| thinking | 239.5 — `(600 − 121) / 2` | centred (`1466:67563` draws it at 222 — see below) |
| card open | **102**, pinned | `1455:67300`: visitor row 102, composer 138–186, card 202–547 |

Centring alone cannot produce the open state: a 446px stack centred in the 600px panel tops
out at 77, which is 25px above where the frame puts it. Pinning also stops the composer moving
between exchanges — answers wrap to two or three lines (326px vs 346px cards), and centred that
shifted the composer 10px each cycle. Anchored, the composer lands in the same place every time
and the card's bottom edge is what floats (548 for a 3-line answer, 528 for 2).

Measured in-browser at `hold`: stack top 102, composer input 138–186, card 202–548.4 against
the frame's 102 / 138–186 / 202–547 — the 1.4px is the built card being 346.3 tall where Figma
draws 345.

The trade is that the composer's rise is now **its own transition** rather than a consequence of
the slot's height (it used to be `translateY(-50%)`, which recomputed continuously and so could
not desync). They are held together by construction instead: `top` and the slot's `height` are
**one piece of state**, written in one commit, on the same duration and curve. That pairing is
load-bearing — deriving `top` from the height at render time put one render in between, where a
just-closed phase still had the card's height in place, and the stack hopped 25px upward before
the collapse started. Measured, the collapse now leaves 102 and lands on 258 with nothing above
102 in between.

### Content of any height fits — within the three-line rule

The whole point of measuring the card rather than assuming it: **answers wrap to whatever they
wrap to, and the product block is optional**, so a card can be anywhere from ~60px to ~419px and
the panel places it. Verified in-browser with deliberately mismatched content:

| card | stack top | card | air below |
|---|---|---|---|
| 100px (answer only, no product) | **102** pinned | 202–302 | 298 |
| 345px (3 lines + product) | **102** pinned | 202–547 | **53** — the frame exactly |
| 405px (over the rule) | **81** capped | 181–586 | 14 |

So everything a designer would actually write sits at the frame's position and the composer
never moves between exchanges. `openTop` handles the rest in three regimes — pinned while it
fits, bottom-anchored so a tall card keeps its air, then capped at MIN_TOP.

**The rule is three lines of answer** (Allison, 8/20: *"max is 3"*), which is ~170 characters in
the 348px column. Two dev-only guards enforce it, each firing once per exchange and naming the
prompt: one when an answer wraps past three lines, one if a card ever exceeds the ~419px the
panel can physically show. Both were verified by deliberately overshooting:

```
[AgentDemoAnimation] the answer for "Which course is the best for me?" wraps to 9 lines;
the rule is 3. Trim it in src/data/demoPrompts.ts — roughly 171 characters fits.
[AgentDemoAnimation] answer card is 464px tall; only 419px fits in the 600px panel,
so 45px is being clipped.
```

`src/data/demoPrompts.ts` carries the same budget as a comment, at the point where the content
gets written.

**Two gaps, not one.** Composer → thinking label is 12 (`1466:67563`: 318 − 306), composer →
card is 16 (`1455:67300`: 202 − 186). Both live *inside* the animated slot rather than as a flex
`gap` — a flex gap survives the collapse and leaves the space behind, so the collapsed stack
would never sit right on the composer alone.

**The thinking state is still centred**, at 239.5, where `1466:67563` draws its label 17px
higher (composer 222–306, label 318–343 — that frame bottom-anchors the stack at 343, matching
the resting frame's composer bottom of 342.5). Left alone deliberately: only the open state was
in scope. Pinning it too would mean a 36px rise from rest to thinking instead of 18.

**Every other visual is still a slot.** The bubble, thinking state, answer card and composer are plain
blocks marked `swap for the designed component` — the rig owns only *when* things happen.
Replacing a visual should never mean touching `timing.ts` or `useAskSequence.ts`.

### The agent switch slides — Figma `1483:68475`

Added to V2 on 8/20, then to V1 the same day. Every agent gets a **lane**, the lanes sit side
by side on a track **580px** apart, and switching translates the track — so the outgoing
content leaves the panel while the incoming content arrives from the other side, and going
back reverses it with no extra bookkeeping. The offset is just `-580 × active index`.

580 is the frame's own pitch: two 380-wide composers with a 200px gap on a 960 track. The three
frames sample the travel at 194 and 388, which are its even thirds, so they storyboard the
distance but not the pacing — `TIMING.switchMs` (520ms) and the entrance curve are authored.
`EASING.out`, which the switcher chip uses, was wrong here for the same reason it was wrong on
the card's open: it front-loads nearly all of its travel, and 580px of that lurches however long
you make it.

**A lane is a copy of the whole panel's box** (520 × 600), not just the composer's. That is why
`AgentDemoAnimation` needed no layout changes at all: its 70px inline inset and its vertical
centring still resolve against a lane exactly as they did against the panel. `.agent-demo`'s
existing `overflow: hidden` does the clipping, so content disappears at the panel's edge rather
than over the copy column, and the track is `pointer-events: none` so the switcher above it stays
clickable where a lane covers the panel.

**The lane lifecycle is the interesting part**, and it comes straight from what the frames show:

| moment | what happens |
|---|---|
| switch starts | every lane stops advancing. The outgoing one **freezes** — it slides out still showing whatever it was in the middle of, card open or half-typed prompt. The incoming one stays parked at its resting composer instead of typing on the way in, which is what the frames draw (placeholder + caret). |
| switch lands | every lane is remounted. The one that landed **starts from the first prompt**; the one that left is reset to its resting state out of sight, so it's clean next time. |

Freezing rather than resetting is a `running` prop on `AgentDemoAnimation`: `useAskSequence`
already cancels its timers and keeps its last state when disabled, and resets when re-enabled.
The remount-on-settle is what guarantees "starts from the beginning" even if you switch away and
back mid-slide — the settle timer is re-armed on every switch.

**The visitor row is now per agent** — `DEMO_VISITORS` in `src/data/nullStateContent.ts`:
Maya · viewing your sales page (sales), **Bob · inside your course** (teaching), both from
`1483:68475`. That closes an open question: the row used to be Sales-only and didn't change with
the tab. ⚠️ Both frames use the same avatar image, so **Bob currently shows Maya's photo** —
fine as placeholder, wrong to ship.

`prefers-reduced-motion` renders one static exchange with no loop, and the track doesn't slide.

⚠️ **`src/data/demoPrompts.ts` is placeholder content.** The answers are invented — a real
Expert Agent answers from the account's own Offers, Landing Pages, Documents and course
content. Nothing there is cleared to ship.

## Session log — 2026-08-20 (later changes, after the sections above were written)

The sections above describe pieces as they were first built. These landed afterwards and
supersede them where they conflict:

- **Switcher moved to the panel TOP** (frame draws it bottom) and gained **cart / headset
  icons** at 14px with a 4px gap. That gap needed `!important` on `::part(button-content)` —
  Pine's shadow rule sets `gap` directly and wins otherwise.
- **Composer radius → 9999px** (frame: 16px), and it gained the **visitor attribution row**
  (`1467:67626`): 24px avatar with a white 45% OUTSIDE ring, "Maya" 12px Semi Bold, context
  12px Regular @70% with `white-space: pre` to keep the frame's padding spaces. Composer is
  now 380×84.
- **Thinking state rebuilt** to `1466:67614` — "<Agent> thinking…" with the matching icon.
  Its fill and stroke are `visible: false` in the frame, so there is **no pill and no border**,
  only the backdrop blur. The shimmer became an animated **mask** over icon + label (was
  `background-clip: text`, which can only clip glyphs), sweeping 3× per phase.
- **Answer card → glass** (`1455:67445`), the same `Icon/Square/Light` component at card scale.
  Its answer text is **white** (was #343332) and its feedback icons lighten to `#bbbab9`.
  Stroke is 1px INSIDE here, not 0.61px OUTSIDE — outset was being clipped by the slot.
- **Content centres in the card**, not in the space below the tabs.
- **Final pacing:** 45ms/char, 700ms beat, 2000ms thinking, 600/700ms card open, 3400ms hold,
  620ms collapse + 16ms/char backspace, 600ms gap. ~9s per exchange, ~27s for three.

### Still open

1. 🔴 The card's drop shadow is barely visible — Figma blends it **LINEAR_BURN**, which CSS
   `box-shadow` cannot express. At `rgba(0,0,0,0.04)` normal-blended it shifts the background
   ~6/255. Options: a `mix-blend-mode: multiply` pseudo-element, raise the alpha to ~0.10–0.14,
   or leave it. **Awaiting Allison's call.**
2. ⚠️ Visitor context ("viewing your sales page") is Sales-only and does not change with the tab.
3. 🔴 `src/data/demoPrompts.ts` is entirely invented and must be replaced before this is shown.

## Structure

```
src/
  data/            mock data only — navigation.ts (prod nav model), account.ts
  shell/
    AppShell/      64px topbar + 250px rail + offset content well
    Topbar/        prod appframe topbar (+ vendored kajabi mark asset)
    Sidenav/       prod appframe left rail
  components/
    ExpertAgentsNullState/   hero: copy column + pricing strip + CTA
    AgentDemoPanel/          520x600 media panel + pill tabs
    AgentDemoAnimation/      the ask-anything loop (timing.ts = all pacing)
  styles/          pine-core → kajabi-theme → global (prod load order)
```

Copy/page versions will be **routes in this one app** (`/v2`, `/v3`) — never folder clones.

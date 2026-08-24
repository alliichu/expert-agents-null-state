# Build notes

Detail behind the prototype — version pins, where each value came from, deliberate
deviations, Pine findings for the design-systems team, and the gotchas that cost time.

Not needed to understand what the page does; see the README for that.

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

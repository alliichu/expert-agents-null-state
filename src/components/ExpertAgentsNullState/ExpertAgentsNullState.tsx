import { useEffect, useRef } from 'react';
import { PdsAlert, PdsButton, PdsIcon, PdsLink } from '@pine-ds/react';
import { caretRight } from '@pine-ds/icons/icons';
import { NullStateContent } from '../../data/nullStateContent';
import { AgentDemoPanel } from '../AgentDemoPanel/AgentDemoPanel';
import './ExpertAgentsNullState.css';

interface ExpertAgentsNullStateProps {
  /** the version's copy — see src/data/nullStateContent.ts */
  content: NullStateContent;
}

/**
 * Expert Agents marketing null state — Figma node `1406:64096`.
 *
 * Geometry taken from the frame, not eyeballed:
 *   hero          1004 × 600, centred in the 1190px content well (93px each side)
 *   copy column   420 wide, 32px stack gaps, vertically centred in the hero
 *   media         520 × 600, 64px gap from the copy column
 *
 * Layout is shared by every version; only the copy is passed in.
 */
export function ExpertAgentsNullState({
  content,
}: ExpertAgentsNullStateProps) {
  // the Pine React wrapper forwards its ref to the underlying custom element
  const alertRef = useRef<HTMLElement>(null);

  /**
   * pds-alert pads `var(--pine-dimension-250)` (20px) as a single shorthand on
   * `.pds-alert__container`, which lives in its shadow root and is exposed by no
   * `part`. The design is asymmetric — 16 inline / 14 block (Figma `1406:64122`: 420 x 63,
   * padding [12, 16, 12, 16], radius 10; the block value was raised 12 → 14 by Allison on
   * 8/21) — which a token override can't express, so this adopts one extra rule into the
   * shadow root.
   *
   * Deliberately the only shadow-piercing rule on the page. Everything else the alert
   * needs is reachable through inherited custom properties — see the CSS.
   *
   * 🔴 It has to WAIT for the shadow root. Pine upgrades its custom elements
   * asynchronously, so on a cold load `shadowRoot` is usually still null when this effect
   * first runs — and the original version read it once and returned, which meant the
   * override silently never applied and the strip sat at Pine's 20px. It looked like it
   * worked because whether it won that race varied per load.
   *
   * The retry is on `setTimeout`, not `requestAnimationFrame`: rAF does not run in a
   * background tab, so a page opened in one would have lost the override again.
   *
   * 🔴 And the selector has to be `.pds-alert__container.pds-box`, not
   * `.pds-alert__container`. Adopting the sheet the moment the shadow root exists puts it
   * BEFORE Pine's own sheet in the adopted list, so at equal specificity (0,1,0) Pine wins
   * and the padding stays 20px — which is exactly what was happening. The container carries
   * both classes, so 0,2,0 wins on specificity regardless of order. Preferred over
   * `!important` because it stays overridable.
   */
  useEffect(() => {
    const el = alertRef.current;
    if (!el || typeof CSSStyleSheet === 'undefined') return;

    let timer = 0;
    let attempts = 0;
    let cancelled = false;
    let sheet: CSSStyleSheet | null = null;
    let root: ShadowRoot | null = null;

    const attach = () => {
      if (cancelled || sheet) return;

      root = el.shadowRoot;
      if (!root) {
        // ~1s of retries, which is far longer than hydration takes
        if (attempts++ < 40) timer = window.setTimeout(attach, 25);
        return;
      }

      sheet = new CSSStyleSheet();
      sheet.replaceSync(
        '.pds-alert__container.pds-box{' +
          'padding-inline:var(--pine-dimension-200);' + // 16px
          // 16px — square with the inline padding, per `1629:63108` (8/24), which makes the
          // strip 75 tall (16 + 43 + 16). Was a 14px literal from the 8/21 reference pass.
          'padding-block:var(--pine-dimension-200);' + // 16px

          '}'
      );
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    };

    // whichever happens first: it is already upgraded, or the element gets defined
    attach();
    customElements.whenDefined('pds-alert').then(attach);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (root && sheet) {
        const applied = sheet;
        root.adoptedStyleSheets = root.adoptedStyleSheets.filter(
          (s: CSSStyleSheet) => s !== applied
        );
      }
    };
  }, []);

  return (
    <div className="null-state">
      <div className="null-state__hero">
        <div className="null-state__copy">
          <div className="null-state__heading-block">
            <h1 className="null-state__headline">{content.headline}</h1>
            <p className="null-state__body">{content.body}</p>
          </div>

          <div className="null-state__values">
            {content.values.map((value) => (
              <div className="null-state__value" key={value.heading}>
                <p className="null-state__value-heading">{value.heading}</p>
                <p className="null-state__value-description">{value.description}</p>
              </div>
            ))}
          </div>

          {/*
            CTA sits ABOVE the pricing strip (Allison, 8/20 — they were the other way
            round). It also reads better against Sam's 8/19 pricing note: price should be
            last in the visual and informational hierarchy, and now the last thing on the
            page is the price rather than the action.
          */}
          <div className="null-state__actions">
            {/*
              Trailing caret (Allison, 8/21). Pine has no `chevronRight` — the shape is
              called `caretRight` in its set, the same one the sidenav's disclosure arrows
              use. Slotted, not the `icon` prop: that prop is deprecated and resolves a NAME
              against the CDN set, so a bundled icon renders an empty button.

              Sized explicitly because Pine's button styles a slotted `pds-icon` for colour
              only and never for size. 14px per `1629:63108`, where the caret measures 14.

              🔴 DEFAULT slot, not `slot="end"`. Pine 3.26.4 never renders an end-slotted
              icon: the wrapper gets `pds-button__icon--empty` whenever `hasEndContent` is
              false, and that flag is a plain instance field rather than reactive state — it
              is set by `handleEndSlotChange`, which fires AFTER the first render, so the
              class is computed once as empty and never corrected. Verified live: the flag
              reads true, the slot has one assigned element, and the icon still lays out 0x0.
              The default slot lands it inside `pds-button__content` and renders normally.
            */}
            <PdsButton variant="primary">
              {content.cta}
              <PdsIcon className="null-state__cta-icon" icon={caretRight} size="14px" />
            </PdsButton>
          </div>

          {/*
            Real pds-alert, styled to the design rather than replaced.
            `small` is what makes the layout work: it renders content and actions in
            one centred flex row and gives the actions `margin-inline-start: auto`,
            which is the right-aligned link the default mode cannot produce.
            `small` also drops the `heading` prop, so both lines are slotted instead.
            `hideIcon` covers Sam's 8/19 "remove the sparkle icon" note.
          */}
          <PdsAlert ref={alertRef as never} className="null-state__pricing" small hideIcon>
            <span className="null-state__pricing-copy">
              <span className="null-state__pricing-heading">{content.pricing.heading}</span>
              <span className="null-state__pricing-body">{content.pricing.body}</span>
            </span>
            <PdsLink
              slot="actions"
              className="null-state__pricing-link"
              href={content.pricing.linkHref}
              variant="plain"
            >
              {content.pricing.linkLabel}
            </PdsLink>
          </PdsAlert>
        </div>

        <AgentDemoPanel />
      </div>
    </div>
  );
}

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { PdsButton, PdsIcon } from '@pine-ds/react';
import { AGENT_TABS } from '../../data/nullStateContent';
import { AgentDemoAnimation } from '../AgentDemoAnimation/AgentDemoAnimation';
import { AgentDemoTrack } from '../AgentDemoAnimation/AgentDemoTrack';
import './AgentDemoPanel.css';

/**
 * Figma draws the active tab as a 93px glass chip (12px padding) and the inactive one
 * as a `pds-button size="micro" variant="tertiary"` (8px padding in Pine's shipped CSS).
 * The chip is therefore 4px wider per side than the button holding the same label.
 */
const CHIP_OUTSET = 4;

/**
 * Which switcher treatment the panel draws.
 *
 *   chip  Figma `1436:67068` — a glass chip marks the active tab; 12px labels, 14px icons.
 *   text  Figma `1474:68298` — NO chip. The active tab is white, the inactive one is white
 *         at 50%; 14px labels, 16px icons, 28px tall. It is literally the same component
 *         with its gradient fill and stroke switched off (the 14.643 radius is still sitting
 *         on the node), so the difference is opacity and type scale, not structure.
 */
export type SwitcherVariant = 'chip' | 'text';

/**
 * How the panel changes agent.
 *
 *   cut    the demo is remounted on the new agent — it simply starts over in place.
 *   slide  Figma `1483:68475` — both agents live on a track and it translates 580px, so the
 *          outgoing content leaves the panel and the incoming content arrives from the
 *          other side. See AgentDemoTrack.
 */
export type DemoTransition = 'cut' | 'slide';

/** Per-variant metrics that can't be expressed in CSS — they're component props. */
const VARIANTS: Record<SwitcherVariant, { buttonSize: 'micro' | 'small'; iconSize: string }> = {
  chip: { buttonSize: 'micro', iconSize: '14px' },
  text: { buttonSize: 'small', iconSize: '16px' },
};

interface AgentDemoPanelProps {
  /** which switcher treatment to draw — see SwitcherVariant. Defaults to the V1 chip. */
  switcher?: SwitcherVariant;
  /** how switching agents moves the demo — see DemoTransition. Defaults to V1's cut. */
  transition?: DemoTransition;
}

/**
 * Right-hand media panel — Figma node `1406:64136` (520 × 600, 16px radius).
 * Switcher — Figma node `1436:67068` (chip) or `1474:68298` (text).
 *
 * Both tabs render as the same `pds-button`, and a single glass chip slides between
 * them. Rendering the active tab as a different element (as the frame literally draws
 * it) makes switching a hard cut, because there is nothing continuous to animate.
 * One moving chip keeps every state identical to the frame and gives the motion
 * something to interpolate.
 */
export function AgentDemoPanel({
  switcher = 'chip',
  transition = 'cut',
}: AgentDemoPanelProps) {
  const [activeTab, setActiveTab] = useState(AGENT_TABS[0].name);
  const [chip, setChip] = useState<{ x: number; w: number } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});

  const variant = VARIANTS[switcher];

  const measure = useCallback(() => {
    // the text variant has no chip to place, so nothing to measure
    if (switcher !== 'chip') return;
    const list = listRef.current;
    const el = tabRefs.current[activeTab];
    if (!list || !el) return;

    const listRect = list.getBoundingClientRect();
    const tabRect = el.getBoundingClientRect();
    setChip({
      x: tabRect.left - listRect.left - CHIP_OUTSET,
      w: tabRect.width + CHIP_OUTSET * 2,
    });
  }, [activeTab, switcher]);

  useLayoutEffect(() => {
    measure();

    /**
     * The chip is sized from the tab it sits behind, so it has to re-measure whenever that
     * tab's box changes — and it changes more often than you would expect: Pine hydrates
     * asynchronously, Inter loads late, and a tab rendered while the page is in a background
     * tab can report a width of ZERO. That last one was real: the chip came out 8px wide
     * (nothing but its own outset) and stayed there, because a one-shot measurement had
     * nothing to correct it.
     *
     * A ResizeObserver covers all three, since each of them shows up as a box change.
     * requestAnimationFrame can't: it doesn't run in a background tab, which is exactly the
     * case that broke.
     */
    const observer = new ResizeObserver(measure);
    if (listRef.current) observer.observe(listRef.current);
    Object.values(tabRefs.current).forEach((el) => el && observer.observe(el));

    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return (
    <div className="agent-demo">
      {/* aura ground */}
      <div className="agent-demo__stage" aria-hidden="true" />

      {/* the ask-anything loop. `cut` keys it on the agent so switching remounts it and it
          restarts in place; `slide` hands both agents to the track, which owns that. */}
      {transition === 'slide' ? (
        <AgentDemoTrack agent={activeTab} />
      ) : (
        <AgentDemoAnimation key={activeTab} agent={activeTab} />
      )}

      <div
        className={`agent-demo__tabs agent-demo__tabs--${switcher}`}
        role="tablist"
        aria-label="Agent type"
        ref={listRef}
      >
        {switcher === 'chip' && chip && (
          <span
            className="agent-tab-chip"
            aria-hidden="true"
            style={{ transform: `translateX(${chip.x}px)`, width: `${chip.w}px` }}
          />
        )}

        {AGENT_TABS.map((tab) => (
          <PdsButton
            key={tab.name}
            ref={((el: HTMLElement | null) => {
              tabRefs.current[tab.name] = el;
            }) as never}
            role="tab"
            aria-selected={tab.name === activeTab}
            className={`agent-tab${tab.name === activeTab ? ' agent-tab--active' : ''}`}
            size={variant.buttonSize}
            variant="tertiary"
            onClick={() => setActiveTab(tab.name)}
          >
            <PdsIcon slot="start" icon={tab.icon} size={variant.iconSize} />
            {tab.label}
          </PdsButton>
        ))}
      </div>
    </div>
  );
}

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { PdsButton, PdsIcon } from '@pine-ds/react';
import { AGENT_TABS } from '../../data/nullStateContent';
import { AgentDemoTrack } from '../AgentDemoAnimation/AgentDemoTrack';
import { EASING, TIMING } from '../AgentDemoAnimation/timing';
import './AgentDemoPanel.css';

/**
 * Figma draws the active tab as a 93px glass chip (12px padding) and the inactive one
 * as a `pds-button size="micro" variant="tertiary"` (8px padding in Pine's shipped CSS).
 * The chip is therefore 4px wider per side than the button holding the same label.
 */
const CHIP_OUTSET = 4;

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
export function AgentDemoPanel() {
  const [activeTab, setActiveTab] = useState(AGENT_TABS[0].name);

  /**
   * Hand over to the other tab once a tab has played all of its exchanges — so the panel
   * cycles Sales -> Teaching -> Sales on its own instead of looping one agent forever
   * (Allison, 8/24).
   *
   * Nothing about switching changes: this drives the SAME state a tab click does, so the
   * track freezes both lanes, slides, and restarts the arriving one from its first prompt,
   * exactly as a manual switch already does. A click mid-cycle simply pre-empts it.
   */
  const handleCycleEnd = useCallback(() => {
    setActiveTab((current) => {
      const i = AGENT_TABS.findIndex((tab) => tab.name === current);
      return AGENT_TABS[(i + 1) % AGENT_TABS.length].name;
    });
  }, []);
  const [chip, setChip] = useState<{ x: number; w: number } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});


  const measure = useCallback(() => {
    const list = listRef.current;
    const el = tabRefs.current[activeTab];
    if (!list || !el) return;

    const listRect = list.getBoundingClientRect();
    const tabRect = el.getBoundingClientRect();
    setChip({
      x: tabRect.left - listRect.left - CHIP_OUTSET,
      w: tabRect.width + CHIP_OUTSET * 2,
    });
  }, [activeTab]);

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

  /**
   * The chip and the content track are ONE gesture, so they share one duration and
   * one curve. Published here — the closest ancestor both of them live inside — and
   * sourced from timing.ts, so neither can drift from the other again.
   *
   * They had drifted: the chip hard-coded 260ms on `EASING.out` against the track's
   * 520ms on `EASING.entrance`. Half the duration on a curve that front-loads its
   * travel, so the chip was parked before the content had really started moving
   * (Allison, 8/24: "the tab animates faster than the content switch").
   */
  const switchVars = {
    '--switch-duration': `${TIMING.switchMs}ms`,
    '--switch-ease': EASING.entrance,
  } as React.CSSProperties;

  return (
    <div className="agent-demo" style={switchVars}>
      {/* aura ground */}
      <div className="agent-demo__stage" aria-hidden="true" />

      {/* the ask-anything loop. `cut` keys it on the agent so switching remounts it and it
          restarts in place; `slide` hands both agents to the track, which owns that. */}
      <AgentDemoTrack agent={activeTab} onCycleEnd={handleCycleEnd} />

      <div
        className="agent-demo__tabs"
        role="tablist"
        aria-label="Agent type"
        ref={listRef}
      >
        {chip && (
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
            size="micro"
            variant="tertiary"
            onClick={() => setActiveTab(tab.name)}
          >
            <PdsIcon slot="start" icon={tab.icon} size="14px" />
            {tab.label}
          </PdsButton>
        ))}
      </div>
    </div>
  );
}

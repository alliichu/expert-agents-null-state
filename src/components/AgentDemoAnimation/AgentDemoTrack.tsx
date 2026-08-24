import { useEffect, useRef, useState } from 'react';
import { AGENT_TABS } from '../../data/nullStateContent';
import { EASING, TIMING } from './timing';
import { AgentDemoAnimation } from './AgentDemoAnimation';
import './AgentDemoTrack.css';

/**
 * Distance between one lane and the next — Figma `1483:68475`: two 380-wide composers with
 * a 200px gap on a 960 track, so each switch travels 580px. The frames sample that travel
 * at 194 and 388, which are its even thirds.
 */
const LANE_PITCH = 580;

interface AgentDemoTrackProps {
  /** the tab that should be showing */
  agent: string;
  /** fires when the running lane's last exchange has collapsed */
  onCycleEnd?: () => void;
}

/** Per-lane bookkeeping. `generation` is a remount key; see the switch effect. */
interface Lane {
  generation: number;
  running: boolean;
}

/**
 * The sliding agent switch — Figma `1483:68475`.
 *
 * Every agent gets a LANE, and the lanes sit side by side on a track 580px apart. Switching
 * translates the track, so the outgoing lane leaves to one side while the incoming one
 * arrives from the other, and going back reverses it without any extra bookkeeping — the
 * track's offset is just `-580 × active index`.
 *
 * Each lane is a full copy of the panel's coordinate space (520 × 600), which is why the
 * animation inside it needs no changes: its own 70px inset and its vertical centring still
 * resolve against a lane exactly as they did against the panel.
 *
 * The lane lifecycle is the part worth reading:
 *
 *   switch starts   every lane stops advancing. The outgoing one FREEZES — it slides out
 *                   still showing whatever it was in the middle of (Allison: "where it is
 *                   at in the animation the content will slide over") — and the incoming one
 *                   stays parked at its resting composer instead of typing on the way in,
 *                   which is what the frames draw.
 *   switch lands    every lane is remounted. The one that landed starts from the first
 *                   prompt ("the tab they just landed on will start from the beginning");
 *                   the one that left is reset to its resting state, out of sight, so it is
 *                   clean the next time it comes back.
 */
export function AgentDemoTrack({ agent, onCycleEnd }: AgentDemoTrackProps) {
  const index = Math.max(
    0,
    AGENT_TABS.findIndex((tab) => tab.name === agent)
  );

  const [lanes, setLanes] = useState<Lane[]>(() =>
    AGENT_TABS.map((_, i) => ({ generation: 0, running: i === index }))
  );

  const settleTimer = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    // on first render the initial state already has the right lane running
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setLanes((prev) => prev.map((lane) => ({ ...lane, running: false })));

    // Re-armed on every switch, so switching back mid-slide just restarts the wait rather
    // than settling against a lane that is no longer the one arriving.
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      setLanes((prev) =>
        prev.map((lane, i) => ({ generation: lane.generation + 1, running: i === index }))
      );
    }, TIMING.switchMs);

    return () => window.clearTimeout(settleTimer.current);
  }, [index]);

  const vars = {
    '--switch-duration': `${TIMING.switchMs}ms`,
    // Gentle at both ends. The switcher chip's `EASING.out` is right for a 100px chip and
    // wrong here for the same reason it was wrong on the card's open: it front-loads almost
    // all of its travel, and 580px of that reads as a lurch however long you make it.
    '--switch-ease': EASING.entrance,
  } as React.CSSProperties;

  return (
    <div
      className="ask-track"
      style={{ ...vars, transform: `translateX(${-LANE_PITCH * index}px)` }}
    >
      {AGENT_TABS.map((tab, i) => (
        <div
          className="ask-track__lane"
          key={tab.name}
          style={{ insetInlineStart: `${LANE_PITCH * i}px` }}
        >
          {/* Only the live lane may hand over — a frozen one must not fire mid-slide. */}
          <AgentDemoAnimation
            key={lanes[i].generation}
            agent={tab.name}
            running={lanes[i].running}
            onCycleEnd={lanes[i].running ? onCycleEnd : undefined}
          />
        </div>
      ))}
    </div>
  );
}

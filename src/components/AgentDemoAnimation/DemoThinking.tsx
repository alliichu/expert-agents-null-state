import { PdsIcon } from '@pine-ds/react';
import { AGENT_TABS } from '../../data/nullStateContent';
import './DemoThinking.css';

interface DemoThinkingProps {
  visible: boolean;
  /** which agent is answering — drives both the label and the icon */
  agent: string;
}

/**
 * Thinking state — Figma node `1466:67614`.
 *
 * Reuses the switcher's `Icon/Square/Light` chip, but with its **fill and stroke set to
 * `visible: false`** — so there is no pill and no border here, only the icon, the label
 * and the chip's backdrop blur. Copying the chip's glass background would be wrong.
 *
 *   165 x 25, radius 14.643, padding 4/12/4/4, 6px gap, backdrop blur 4.068 (CSS 2.034)
 *   icon  14 x 14, white — the same cart / headset as the switcher
 *   text  "<Agent> thinking..." 12px Inter Medium, white
 *
 * Stays mounted and fades so it has a previous state to transition from.
 */
export function DemoThinking({ visible, agent }: DemoThinkingProps) {
  const tab = AGENT_TABS.find((t) => t.name === agent) ?? AGENT_TABS[0];

  return (
    <span className={`demo-thinking${visible ? ' demo-thinking--in' : ''}`}>
      {/* The shimmer masks this wrapper, so one sweep crosses the icon and the label as
          a single motion. It can't live on the chip itself — that would mask the
          backdrop blur too. */}
      <span key={visible ? 'on' : 'off'} className="demo-thinking__sweep">
        <PdsIcon className="demo-thinking__icon" icon={tab.icon} size="14px" />
        <span className="demo-thinking__label">{tab.label} thinking...</span>
      </span>
    </span>
  );
}

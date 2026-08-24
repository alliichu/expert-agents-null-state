import { useEffect, useState } from 'react';
import { PdsButton, PdsIcon } from '@pine-ds/react';
import { arrowUp } from '@pine-ds/icons/icons';
import type { DemoVisitor } from '../../data/demoPrompts';
import { TIMING } from './timing';
import './DemoComposer.css';

interface DemoComposerProps {
  /** what has been "typed" so far; empty shows the placeholder */
  typed?: string;
  /**
   * Whose question this is. Keyed PER EXCHANGE, not per agent: each exchange is a
   * different business, so one fixed asker across all three would read as one
   * confused account.
   */
  visitor: DemoVisitor;
}

/**
 * The message box — Figma nodes `1467:67625` (wrapper), `1467:67626` (attribution)
 * and `1437:67161` (input).
 *
 * Constant: it never animates in or out, and the visitor row is present in every state
 * and through every transition. Only the text inside the input changes.
 *
 *   wrapper      380 wide, vertical, 12px gap  (24 + 12 + 48 = 84 tall)
 *   attribution  24 tall, horizontal, 8px gap, centred
 *   avatar       24x24 circle, image fill, 1px white @45% stroke OUTSIDE
 *   name         12px Inter Semi Bold, white
 *   context      12px Inter Regular, white @70%
 *   input        380 x 48 — see below for its two gradients
 */
export function DemoComposer({ typed = '', visitor: incoming }: DemoComposerProps) {

  /**
   * The row that is actually painted, held in state so the swap can be hidden.
   *
   * The parent hands over the next asker the moment the collapse begins; this holds the
   * change back until `visitorSwapMs` into it, so it lands while the card is folding away
   * and the prompt is backspacing. No fade — the row stays at full opacity throughout and
   * the larger movement does the hiding.
   *
   * Compared by value, not identity — the parent recomputes the object every render.
   */
  const [visitor, setVisitor] = useState(incoming);

  useEffect(() => {
    if (incoming.name === visitor.name && incoming.context === visitor.context) return;
    const t = window.setTimeout(() => setVisitor(incoming), TIMING.visitorSwapMs);
    return () => window.clearTimeout(t);
  }, [incoming, visitor]);

  return (
    <div className="demo-composer">
      <div className="demo-composer__attribution">
        <span className="demo-composer__avatar">
          <img src={visitor.avatar} alt="" width={24} height={24} />
        </span>
        <span className="demo-composer__meta">
          <span className="demo-composer__visitor">{visitor.name}</span>
          <span className="demo-composer__context">{visitor.context}</span>
        </span>
      </div>

      <div className="demo-composer__input">
        {/* The caret sits at the insertion point, like a real input: at the start while
            the field is empty (the resting state the frame draws), then trailing the
            text as it types. It does not blink. */}
        <span className="demo-composer__field">
          {typed ? (
            <>
              <span className="demo-composer__typed">{typed}</span>
              <span className="demo-composer__caret">|</span>
            </>
          ) : (
            <>
              <span className="demo-composer__caret">|</span>
              <span className="demo-composer__placeholder">Ask anything…</span>
            </>
          )}
        </span>

        {/* pds-button's `icon` prop is deprecated and resolves an icon NAME against the
            CDN set — a bundled icon renders an empty button. Slotted is the working path. */}
        <PdsButton className="demo-composer__send" variant="primary" size="small" iconOnly>
          <PdsIcon slot="start" icon={arrowUp} />
          Send
        </PdsButton>
      </div>
    </div>
  );
}

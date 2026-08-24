import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DEMO_EXCHANGES } from '../../data/demoPrompts';
import { EASING, TIMING } from './timing';
import { useAskSequence } from './useAskSequence';
import { DemoComposer } from './DemoComposer';
import { DemoThinking } from './DemoThinking';
import { DemoAnswerCard } from './DemoAnswerCard';
import './AgentDemoAnimation.css';

interface AgentDemoAnimationProps {
  /** which agent tab is active — swaps the prompt set and restarts the loop */
  agent: string;
  /**
   * Whether the loop is advancing. False FREEZES it where it is rather than resetting it,
   * which is what lets a lane slide out of the panel still showing whatever it was in the
   * middle of. Re-enabling restarts from the first prompt.
   */
  running?: boolean;
  /** fires once the LAST exchange has finished collapsing — see `useAskSequence` */
  onCycleEnd?: () => void;
}

/** the panel the stack is positioned inside — Figma `1406:64136`, 520 x 600. */
const PANEL_BLOCK = 600;

/**
 * The composer's height. A constant rather than a measurement because it is fixed by
 * construction: DemoComposer.css pins all three values — attribution 24, gap 12, input 48
 * (Figma `1467:67625`, 84 tall).
 */
const COMPOSER_BLOCK = 84;

/** composer -> thinking label (Figma `1466:67563`: 318 - 306) */
const THINKING_GAP = 12;

/** composer -> answer card (Figma `1455:67300`: 202 - 186) */
const CARD_GAP = 16;

/**
 * Where the stack's top edge lands once the card is open — Figma `1455:67300`, which puts
 * the visitor row at y=102, the composer at 138-186 and the card at 202-547.
 *
 * It is NOT the centred position. Centring a 446px stack in the 600px panel puts its top at
 * 77 and the card's bottom at 523, which is where the build landed until Allison sent the
 * frame back on 8/20 ("move it down so it should land right here"). So the open state is
 * pinned to the frame rather than derived.
 *
 * ⚠️ Superseded as the general rule on 8/24 — it is now the position this frame's own card
 * height happens to produce, not a constant. See `CARD_CENTRE`.
 */
const PREFERRED_TOP = 102;

/**
 * Where the answer card's vertical CENTRE sits, in panel space.
 *
 * The card's height varies a lot by artifact — an offer card is ~331, a plan table ~305, an
 * email-capture form only ~234. Pinning the stack's TOP meant a short card hung high with a
 * pool of empty panel beneath it (Allison, 8/24, on Jim's frame: "its too high since the
 * card is shorter than the first state").
 *
 * Allison's own frames already resolve this, and they agree on a rule: the card's centre
 * stays put and the stack rides above it. Measured off the three Sales frames —
 *
 *   `1500:4068` course  card 202-532.7  centre 367.4  stack top 102
 *   `1517:11966` plans  card 215-520    centre 367.5  stack top 115
 *   `1508:5456` capture card 245-479    centre 362    stack top 145
 *
 * Two of the three land on 367.4 to within a tenth of a pixel, so that is the constant; the
 * capture frame sits 5px off it and reads as a hand nudge. Note the rule reproduces the old
 * pinned 102 exactly for the course card, so S1 does not move.
 *
 * Trade-off, deliberately accepted: the open-state composer height now varies by exchange
 * (102 / 115 / 150 across the three above) where the pinned rule held it constant. It is
 * milder than it sounds — the composer already travels on every open, because the collapsed
 * and thinking states are centred at 258, so this changes the DISTANCE it travels rather
 * than introducing movement. Between exchanges it still returns to the same 258.
 */
const CARD_CENTRE = 367.4;

/**
 * Air kept under the stack before it gives up the pinned position — Figma `1455:67300`
 * again (600 - 547). Once a card is tall enough that the pinned top would eat into this,
 * the stack starts lifting instead of growing past the panel's bottom edge.
 */
const BOTTOM_MARGIN = 53;

/**
 * The highest the stack may go. The switcher row is 73 tall (`1436:67068` / `1474:68298`)
 * and overlays the panel rather than displacing content, so this keeps 8px of air under it
 * — past that the visitor row starts colliding with the tabs.
 */
const MIN_TOP = 81;

/**
 * Where the stack sits with the card open, for a stack of this height.
 *
 * Three regimes, in order of preference:
 *
 *   fits            centred on `CARD_CENTRE`, so the card's middle stays put and short
 *                   cards sit lower rather than hanging high;
 *   tall            bottom-anchored: the stack lifts so the 53px of air under it survives,
 *                   which is what keeps a long answer from running off the panel;
 *   taller still    capped at MIN_TOP, and `measure` logs what would not fit.
 *
 * The last regime is a real ceiling, not a bug to design around: a 600px panel minus the
 * composer's 100px leaves ~419px for a card, and no amount of positioning invents more.
 * The dev warning exists so new content runs into it while it is being written rather than
 * in front of Sam.
 */
function openTop(cardBlock: number): number {
  const stackBlock = COMPOSER_BLOCK + CARD_GAP + cardBlock;
  const centred = CARD_CENTRE - cardBlock / 2 - CARD_GAP - COMPOSER_BLOCK;
  const bottomAnchored = PANEL_BLOCK - BOTTOM_MARGIN - stackBlock;
  return Math.max(MIN_TOP, Math.min(centred, bottomAnchored));
}

/** How tall a card can be before it is clipped by the panel. ~419px. */
const MAX_CARD_BLOCK = PANEL_BLOCK - MIN_TOP - COMPOSER_BLOCK - CARD_GAP;

/**
 * The house rule for answer copy (Allison, 8/20: *"max is 3"*). Not a technical limit — the
 * panel can hold more, and `openTop` will place it — but three lines is what gets designed,
 * and it is the height the frame is drawn at. Checked at runtime so new content trips over
 * the rule while it is being written.
 */
const MAX_ANSWER_LINES = 3;

/** Answer text line-height — 14px Inter at 1.425, per DemoAnswerCard.css. */
const ANSWER_LINE_BLOCK = 20;

/**
 * Dev warnings already fired, so the console stays readable. Module-level on purpose: a lane
 * remounts on every agent switch and measures three or four times per open (mount, next
 * frame, and again once Inter has loaded), and none of that should repeat the same message.
 */
const warned = new Set<string>();

function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/**
 * Room added around the slot's clip box so the answer card's drop shadow isn't shaved.
 * The shadow is `0 9.762 12.203 -4.881`, which reaches ~17px below the card and ~7px to
 * each side; 20px covers it. Pulled back out of the layout with negative margins in CSS,
 * so the stack's height is unaffected.
 */
const SHADOW_ROOM = 20;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The "ask anything" loop, in the media panel.
 *
 * Flow: the prompt types into the composer and stays there. "Thinking..." fades in below
 * it, then cross-fades into the answer card as the card opens.
 *
 * Both the thinking label and the card stay MOUNTED and absolutely positioned, and the
 * slot's height is set explicitly from whichever is active. Two reasons:
 *   - a node that mounts on the frame it should start animating has no previous state to
 *     transition from, so it pops — which is what swapping them with a ternary did;
 *   - with both out of flow, nothing fights over the height, so the two can overlap
 *     during the hand-off instead of one having to finish before the other starts.
 *
 * The stack's own top is set per state (see `layout` below) rather than being centred with
 * translateY(-50%), which is what it used to do. Centring made the composer's rise a
 * consequence of the slot's height and so impossible to desync, but it also fixed where the
 * open state landed — 25px above where `1455:67300` puts it. Top and height are now written
 * together, on the same duration and curve, which holds them to each other instead. See
 * `openTop` for how the open position adapts when a card is taller than the frame's.
 */
export function AgentDemoAnimation({
  agent,
  running = true,
  onCycleEnd,
}: AgentDemoAnimationProps) {
  const exchanges = useMemo(() => DEMO_EXCHANGES[agent] ?? DEMO_EXCHANGES.sales, [agent]);
  const reduced = prefersReducedMotion();
  const { phase, index, typed } = useAskSequence(exchanges, running && !reduced, onCycleEnd);

  const exchange = exchanges[index];

  /**
   * Who the visitor row names. It changes DURING the collapse (Allison, 8/24) rather
   * than in the empty beat after it, so the answer folding away and the asker changing
   * read as one movement instead of two.
   *
   * That means looking ahead: `index` does not advance until after `gap`, so through
   * `exit` and `gap` the row already names the NEXT exchange's asker. The composer
   * swaps to it, and by the time typing starts the new person is in place.
   *
   * ⚠️ NOT on the last exchange. `(index + 1) % length` wraps to 0 there, which used to
   * flip the row back to the tab's FIRST asker during the final collapse (Allison, 8/24:
   * "i see the name switching back to maya"). The wrap was only ever right while the
   * loop continued inside one tab — now the tab hands over instead, so there is no next
   * asker to look ahead to and the row holds the last one all the way out.
   */
  const isLastExchange = index === exchanges.length - 1;
  const nextExchange = exchanges[(index + 1) % exchanges.length];
  const rowVisitor =
    !isLastExchange && (phase === 'exit' || phase === 'gap')
      ? nextExchange.visitor
      : exchange.visitor;

  /** kept through `exit` so the text can be seen backspacing out, not just vanish */
  const promptVisible = phase !== 'gap';
  const showThinking = phase === 'thinking';
  const showAnswer = phase === 'answer' || phase === 'hold';

  const thinkingRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /**
   * The slot's height and the stack's top are ONE piece of state, set in one commit.
   *
   * Deriving the top at render time from the height instead put one render in between: on
   * the frame the phase left `hold`, it saw "card closed" with the card's height still in
   * place and centred a full-height stack — a visible 25px hop upward just before the
   * collapse. Pairing them makes that state unrepresentable.
   */
  const [layout, setLayout] = useState<{ slot: number; top: number }>({
    slot: 0,
    top: (PANEL_BLOCK - COMPOSER_BLOCK) / 2,
  });

  useLayoutEffect(() => {
    const measure = () => {
      const active = showAnswer ? cardRef.current : showThinking ? thinkingRef.current : null;
      // the card sits 4px further from the composer than the thinking label does — both
      // gaps are the frames' own (see the constants above)
      const gap = showAnswer ? CARD_GAP : THINKING_GAP;
      // getBoundingClientRect, not offsetHeight: offsetHeight rounds to an integer, so a
      // card that renders 326.4 tall reports 326 and the slot ends up a fraction short —
      // enough for `overflow: hidden` to shave the bottom edge of the card's stroke.
      // Ceil for the same reason.
      const slot = active ? Math.ceil(active.getBoundingClientRect().height) + gap : 0;

      if (import.meta.env.DEV && showAnswer && active) {
        const cardBlock = slot - CARD_GAP;
        const answer = active.querySelector('.answer-card__text');
        const lines = answer
          ? Math.round(answer.getBoundingClientRect().height / ANSWER_LINE_BLOCK)
          : 0;

        // The house rule first — it is the one that will actually be hit.
        if (lines > MAX_ANSWER_LINES) {
          warnOnce(
            `lines:${exchange.prompt}:${lines}`,
            `[AgentDemoAnimation] the answer for "${exchange.prompt}" wraps to ${lines} ` +
              `lines; the rule is ${MAX_ANSWER_LINES}. Trim it in src/data/demoPrompts.ts ` +
              `— roughly ${MAX_ANSWER_LINES * 57} characters fits.`
          );
        }

        // Backstop: the panel is only 600 tall, so past this the card is genuinely cut off.
        if (cardBlock > MAX_CARD_BLOCK) {
          warnOnce(
            `clip:${exchange.prompt}:${cardBlock}`,
            `[AgentDemoAnimation] answer card is ${cardBlock}px tall; only ` +
              `${MAX_CARD_BLOCK}px fits in the ${PANEL_BLOCK}px panel, so ` +
              `${cardBlock - MAX_CARD_BLOCK}px is being clipped.`
          );
        }
      }

      setLayout({
        slot,
        // Centred while collapsed and thinking, which is what the frames draw — `1467:67619`
        // rests the composer at y=258.5, and (600 - 84) / 2 = 258. Open, `openTop` holds the
        // card's CENTRE at `CARD_CENTRE` and lets the stack ride above it.
        top: showAnswer
          ? openTop(slot - CARD_GAP)
          : (PANEL_BLOCK - (COMPOSER_BLOCK + slot)) / 2,
      });
    };
    measure();
    // Inter can load late and the card's text wraps differently once it does
    const raf = requestAnimationFrame(measure);
    document.fonts?.ready.then(measure);
    return () => cancelAnimationFrame(raf);
  }, [showAnswer, showThinking, exchange]);

  const vars = {
    '--seq-thinking-fade': `${TIMING.thinkingFadeMs}ms`,
    // exactly three sweeps across the thinking phase, whatever its length
    '--seq-thinking-shimmer': `${TIMING.thinkingMs / 3}ms`,
    '--seq-answer-in': `${TIMING.answerInMs}ms`,
    '--seq-answer-fade': `${TIMING.answerFadeMs}ms`,
    '--seq-exit': `${TIMING.exitMs}ms`,
    '--seq-exit-fade': `${TIMING.exitFadeMs}ms`,
    '--seq-ease-collapse': EASING.collapse,
    '--seq-ease-out': EASING.out,
    '--seq-ease-entrance': EASING.entrance,
    '--seq-ease-exit-fade': EASING.exitFade,
    // geometry, not pacing — but it belongs to the same single source of truth as the
    // heights the rig measures, so the stylesheet reads it rather than restating it
    '--ask-gap-thinking': `${THINKING_GAP}px`,
    '--ask-gap-card': `${CARD_GAP}px`,
  } as React.CSSProperties;

  if (reduced) {
    return (
      <div className="ask-demo" style={vars} aria-hidden="true">
        {/* No loop, so nothing to measure: the pinned position is the right one for a
            card of ordinary height, and a very tall one would clip rather than lift. */}
        <div className="ask-demo__stack" style={{ insetBlockStart: `${PREFERRED_TOP}px` }}>
          <DemoComposer typed={exchanges[0].prompt} visitor={exchanges[0].visitor} />
          <div className="ask-demo__slot" style={{ height: 'auto' }}>
            <div className="ask-demo__layer ask-demo__layer--in">
              <DemoAnswerCard exchange={exchanges[0]} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ask-demo" style={vars} aria-hidden="true" data-phase={phase}>
      <div className="ask-demo__stack" style={{ insetBlockStart: `${layout.top}px` }}>
        {/* Constant — never animates in or out; only its text changes. */}
        <DemoComposer typed={promptVisible ? typed : ''} visitor={rowVisitor} />

        <div className="ask-demo__slot" style={{ height: `${layout.slot + SHADOW_ROOM}px` }}>
          <div
            ref={thinkingRef}
            className={`ask-demo__layer${showThinking ? ' ask-demo__layer--in' : ''}`}
          >
            <DemoThinking visible={showThinking} agent={agent} />
          </div>

          <div
            ref={cardRef}
            className={`ask-demo__layer ask-demo__layer--card${showAnswer ? ' ask-demo__layer--in' : ''}`}
          >
            <DemoAnswerCard exchange={exchange} />
          </div>
        </div>
      </div>
    </div>
  );
}

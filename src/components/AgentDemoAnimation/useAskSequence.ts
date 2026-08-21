import { useEffect, useRef, useState } from 'react';
import { PHASE_SEQUENCE, Phase, TIMING, phaseDuration } from './timing';
import { DemoExchange } from '../../data/demoPrompts';

interface SequenceState {
  phase: Phase;
  /** index into the exchange list */
  index: number;
  /** how much of the prompt has been "typed" */
  typed: string;
}

/**
 * Drives the loop: type a prompt → send it → think → open the answer → hold → clear.
 *
 * A chained timeout rather than one long timeline, so a phase's length can depend on
 * its content (typing is per-character) and so switching agent types can cut in
 * cleanly mid-loop without unwinding anything.
 */
export function useAskSequence(exchanges: DemoExchange[], enabled: boolean): SequenceState {
  const [phase, setPhase] = useState<Phase>('typing');
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');

  // kept in refs so the timers never close over stale values
  const phaseRef = useRef<Phase>('typing');
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled || exchanges.length === 0) return;

    // restart whenever the exchange list changes (i.e. the agent tab switched)
    phaseRef.current = 'typing';
    indexRef.current = 0;
    setPhase('typing');
    setIndex(0);
    setTyped('');

    let phaseTimer = 0;
    let typeTimer = 0;
    let cancelled = false;

    const runTyping = () => {
      // clear any interval still running from a previous prompt — without this they
      // accumulate, and every leaked one keeps calling setTyped forever
      window.clearInterval(typeTimer);
      const prompt = exchanges[indexRef.current].prompt;
      let n = 0;
      setTyped('');
      typeTimer = window.setInterval(() => {
        if (cancelled) return window.clearInterval(typeTimer);
        n += 1;
        setTyped(prompt.slice(0, n));
        if (n >= prompt.length) window.clearInterval(typeTimer);
      }, TIMING.charMs);
    };

    /** backspace the prompt out, one character at a time */
    const runDeleting = () => {
      window.clearInterval(typeTimer);
      const prompt = exchanges[indexRef.current].prompt;
      let n = prompt.length;
      typeTimer = window.setInterval(() => {
        if (cancelled) return window.clearInterval(typeTimer);
        n -= 1;
        setTyped(prompt.slice(0, Math.max(0, n)));
        if (n <= 0) window.clearInterval(typeTimer);
      }, TIMING.deleteCharMs);
    };

    const advance = () => {
      if (cancelled) return;
      const current = phaseRef.current;
      const next = PHASE_SEQUENCE[(PHASE_SEQUENCE.indexOf(current) + 1) % PHASE_SEQUENCE.length];

      if (next === 'typing') {
        indexRef.current = (indexRef.current + 1) % exchanges.length;
        setIndex(indexRef.current);
      }

      phaseRef.current = next;
      setPhase(next);
      if (next === 'typing') runTyping();
      if (next === 'exit') runDeleting();

      phaseTimer = window.setTimeout(
        advance,
        phaseDuration(next, exchanges[indexRef.current].prompt.length)
      );
    };

    runTyping();
    phaseTimer = window.setTimeout(advance, phaseDuration('typing', exchanges[0].prompt.length));

    return () => {
      cancelled = true;
      window.clearTimeout(phaseTimer);
      window.clearInterval(typeTimer);
    };
  }, [exchanges, enabled]);

  return { phase, index, typed };
}

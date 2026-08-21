/**
 * Every number that controls how the demo animation FEELS lives here.
 *
 * Tuning the motion means editing this file only — nothing in the component or the
 * stylesheet hard-codes a duration. The CSS reads these through custom properties
 * that the rig writes onto its root node.
 *
 * Reference is Origin's "Ask anything" section (useorigin.com). Note that theirs is
 * scroll-driven across a ~2300px pinned region, so its pacing is scroll DISTANCE, not
 * time — none of its numbers transfer to an autoplaying panel. These are authored.
 */

export const TIMING = {
  /** per character while the prompt types in */
  charMs: 45,
  /** beat after the last character, before the thinking state appears below */
  afterTypedMs: 700,
  /** agent is thinking */
  thinkingMs: 2000,
  /** the "Thinking..." label fading in, and back out as the answer takes its place */
  thinkingFadeMs: 320,
  /** answer card's HEIGHT opening — a ~350px change, so it needs real room */
  answerInMs: 600,
  /** its opacity/blur resolving. Deliberately longer than the height: letting the card
      finish settling after the geometry has stopped is what stops the open reading as a
      lurch, even at the same duration. */
  answerFadeMs: 700,
  /** answer card sits there and is readable */
  holdMs: 3400,
  /** per character while the prompt backspaces out — faster than typing, as real
      backspacing is, but not instant */
  deleteCharMs: 16,
  /** floor for the collapse; the real length also has to cover the backspacing */
  exitMs: 600,
  /**
   * The card's FADE on the way out — deliberately much shorter than the collapse it
   * happens inside (Allison, 8/20: "there's this weird fade at the very end that lingers").
   *
   * Fading over the whole 600ms collapse was the problem, and the curve made it worse:
   * `collapse` eases at both ends, so the last sliver of opacity took the longest, and the
   * 6px blur kept a smeared ghost of the card visible through all of it. The card now lets
   * go early and the panel finishes closing on its own, which is also the honest order of
   * events — the answer is gone, then the space it occupied shuts.
   *
   * Landed at 400 on the second pass: 240 read as too fast. This is the dial — the curve
   * (`EASING.exitFade`) is constant-rate, so changing the number changes only how long the
   * fade takes, not its character.
   */
  exitFadeMs: 400,
  /** empty beat before the next prompt starts typing */
  gapMs: 600,
  /**
   * How long the agent switch takes to slide one lane out and the next one in — Figma
   * `1483:68475`, where the content sits on a track and translates 580px per switch.
   *
   * Authored: the frames storyboard the travel (they sample it at 194 and 388, even thirds
   * of 580) but not its pacing. This is also the beat the incoming lane waits out before it
   * starts typing, so the number lives here and the track publishes it to CSS — the two
   * cannot drift.
   */
  switchMs: 520,
} as const;

/**
 * Curves. `out` matches the switcher and the role-permissions prototype so the whole
 * app shares one motion language. `entrance` is flatter at the end — it lets the card
 * settle rather than arrive, which is what makes an expand read as deliberate.
 */
export const EASING = {
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  /**
   * Gentle both ends. The previous curve — cubic-bezier(0.16, 1, 0.3, 1) — covers most of
   * its distance in the first third, which is a lurch on a 350px expand no matter how long
   * the duration is. Slowing an aggressive curve just makes it a slow lurch.
   */
  entrance: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /**
   * The card's fade-out — deliberately `linear`.
   *
   * Opacity is the one property where a curve mostly hurts. Anything that eases OUT crawls
   * through the last few percent, which is the lingering ghost this replaced; anything that
   * eases IN holds the card up and then snaps it away, which is what 240ms read as. Constant
   * rate does neither: it is gone when it is gone, and the duration alone sets the feel.
   */
  exitFade: 'linear',
  /**
   * Collapse. The `entrance` curve front-loads its motion, which is right for something
   * arriving and wrong for something leaving — it reads as a snap. This one eases in and
   * out symmetrically so the card lets go gradually.
   */
  collapse: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

export type Phase = 'typing' | 'thinking' | 'answer' | 'hold' | 'exit' | 'gap';

/** Phase order, and how long each lasts. `typing` is derived from the prompt length. */
export const PHASE_SEQUENCE: Phase[] = [
  'typing',
  'thinking',
  'answer',
  'hold',
  'exit',
  'gap',
];

export function phaseDuration(phase: Phase, promptLength: number): number {
  switch (phase) {
    case 'typing':
      return promptLength * TIMING.charMs + TIMING.afterTypedMs;
    case 'thinking':
      return TIMING.thinkingMs;
    case 'answer':
      return TIMING.answerInMs;
    case 'hold':
      return TIMING.holdMs;
    case 'exit':
      // long enough to backspace the whole prompt, with a beat after the last character
      return Math.max(TIMING.exitMs, promptLength * TIMING.deleteCharMs + 240);
    case 'gap':
      return TIMING.gapMs;
  }
}

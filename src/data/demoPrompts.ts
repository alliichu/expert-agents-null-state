/**
 * What the demo agent gets asked, per agent type. Swapped when the switcher changes.
 *
 * ⚠️ Placeholder content. An Expert Agent answers from the account's own Offers,
 * Landing Pages, Documents and course content, so every answer, product name, price
 * and duration here is invented and must not ship.
 *
 * ── Writing new content ───────────────────────────────────────────────────────────────
 *
 * **Three lines of answer is the rule** (Allison, 8/20: *"max is 3"*). The text column is
 * 348px wide at 14px, so that is roughly **170 characters**. The rig warns in dev, naming
 * the prompt, if an answer wraps past three lines.
 *
 * Within that rule, heights do NOT have to match, and nothing assumes they do — the panel
 * measures each card and places it (`openTop` in AgentDemoAnimation.tsx):
 *
 *   3 lines + product    ~345px — the frame exactly: card at y=202, 53px of air below
 *   1–2 lines + product  ~305–325px — same pinned position, more air below
 *   no product           ~60–100px — omit `product` and the artifact block disappears
 *
 * All of those sit at the frame's position, so the composer never moves between exchanges.
 * Past ~366px the stack starts lifting to keep air under the card, and past ~419px the card
 * is genuinely clipped by the 600px panel — both are backstops for content that has broken
 * the three-line rule, not places to design into.
 */

export interface DemoProduct {
  title: string;
  meta: string;
  cta: string;
}

export interface DemoExchange {
  prompt: string;
  answer: string;
  /**
   * The product the agent surfaces alongside its answer. **Optional** — omit it and the
   * card is answer text alone, which is both a real shape (plenty of questions don't
   * resolve to an offer) and the way to buy height back for a longer answer.
   */
  product?: DemoProduct;
}

export const DEMO_EXCHANGES: Record<string, DemoExchange[]> = {
  sales: [
    {
      prompt: 'Which course is the best for me?',
      answer:
        "I'd start with this one. It's the most beginner-friendly and covers what you need to know before you start cooking.",
      product: { title: 'Your first 20 dinners', meta: 'Beginner · 6 weeks · Self-paced', cta: 'Enroll now' },
    },
    {
      prompt: 'Do you offer payment plans?',
      answer:
        'Yes — you can pay in three monthly instalments, or save a little by paying for the whole course up front.',
      product: { title: 'Your first 20 dinners', meta: '3 payments · or pay once', cta: 'See pricing' },
    },
    {
      prompt: "What's included in the membership?",
      answer:
        'Every course, the live Q&As each month, and the community. New courses are added as they launch.',
      product: { title: 'All-access membership', meta: 'Monthly · Cancel anytime', cta: 'Join now' },
    },
  ],
  teaching: [
    {
      prompt: 'Where do I find lesson three?',
      answer:
        "It's in Getting Started, right after the knife skills lesson. You'll need lesson two finished first.",
      product: { title: 'Getting Started', meta: 'Lesson 3 · 12 min', cta: 'Open lesson' },
    },
    {
      prompt: 'Can I get the workbook again?',
      answer:
        "It's attached to lesson two as a download, and it's yours to keep — grab it whenever you need it.",
      product: { title: 'Course workbook', meta: 'PDF · 24 pages', cta: 'Download' },
    },
    {
      prompt: 'How long do I have access?',
      answer:
        "Your access doesn't expire. Come back to any lesson whenever you like, at whatever pace suits you.",
      product: { title: 'Your enrollment', meta: 'Lifetime access', cta: 'View details' },
    },
  ],
};

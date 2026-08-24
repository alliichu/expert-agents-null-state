/**
 * Expert Agents null-state copy, one object per version.
 *
 * Transcribed from Alli's Sketchbook → page `↳ Scratchpad - null state` → node
 * `1406:64096`. Copy is still in flight — the version row at y=7890 in that file holds
 * the alternates. Keep this file as the single place copy lives so swapping a version
 * never means touching a component.
 *
 * Versions are ROUTES in this one app, never folder clones: `/` (or `/v1`) renders V1,
 * `/v2` renders V2. App.tsx holds the table of what each version is; this file holds only
 * the copy, so adding V3 is one more object here plus one row there.
 */

import { cart, headset } from '@pine-ds/icons/icons';

export interface ValueProp {
  heading: string;
  description: string;
}

export interface NullStateContent {
  headline: string;
  body: string;
  values: ValueProp[];
  pricing: {
    heading: string;
    body: string;
    linkLabel: string;
    /** where `Learn more` goes — data, not a hard-coded href, so devs can repoint it */
    linkHref: string;
  };
  cta: string;
}

/** V1 — the copy the prototype was built and reviewed against. */
export const NULL_STATE_V1: NullStateContent = {
  // Headline and body from `1629:63108`, 8/24. The body carries Sam's "an agent for you"
  // note: "hand it the questions" is the delegation beat, and it measures 3 lines at 420.
  headline: 'An expert, on every page.',
  body:
    'Add an Expert Agent to your site and hand it the questions. It answers buyers on '
    + 'your sales pages and members inside your courses, all around the clock.',
  values: [
    {
      heading: 'Decide what your agent can say',
      description: 'Set its tone, its topics, and its instructions before it goes live.',
    },
    {
      heading: 'See every conversation',
      description: 'Every conversation lands in your inbox. Step in mid-chat whenever you want.',
    },
    {
      heading: 'Keep buyers and members moving',
      description: 'Buyers stop guessing. Members stop searching. Both get what they came for.',
    },
  ],
  pricing: {
    heading: 'Free for 30 days',
    // ⚠️ UNVERIFIED — the $49 figure has no pricing sign-off. See the pod CLAUDE.md
    // "Product truth" section before this goes anywhere near a real account.
    body: '$49/mo per agent after that',
    linkLabel: 'Learn more',
    // Real published article, found 8/24 — not a guessed slug. Devs should confirm this is
    // the destination product wants before launch; it is the public overview page, and the
    // in-product link may be meant to go somewhere more specific.
    linkHref: 'https://help.kajabi.com/articles/products/products-overview/expert-agents-overview',
  },
  cta: 'Add your first agent',
};

/**
 * ⚠️ Names are NOT settled. Code says `Ai::Chatbot::SalesAssistant` /
 * `TeachingAssistant`; designs say "Sales Agent". The Figma frame labels the tabs
 * as below, so that's what ships here — but tabs put both names on screen at 12px,
 * which is what makes this blocking. See the pod CLAUDE.md.
 */
export const AGENT_TABS = [
  { name: 'sales', label: 'Sales Agent', icon: cart },
  { name: 'teaching', label: 'Teaching Assistant', icon: headset },
];

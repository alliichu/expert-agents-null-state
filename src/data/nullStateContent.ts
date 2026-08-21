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
  };
  cta: string;
}

/** V1 — the copy the prototype was built and reviewed against. */
export const NULL_STATE_V1: NullStateContent = {
  headline: 'An expert, on every page',
  body: 'Add an Expert Agent to your site. It answers buyers on your sales pages and members inside your courses, around the clock.',
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
  },
  cta: 'Add your first agent',
};

/**
 * V2 — created 2026-08-20 as an exact duplicate of V1, to be taken somewhere else.
 *
 * Nothing here is shared with V1: editing a line in this object cannot move the version
 * it is being compared against. That mirrors the working rule in the Figma file — every
 * copy pass gets its own frame, and a pass never overwrites the one before it.
 *
 * Measured constraints still apply to whatever replaces these lines (see the pod notes):
 * the headline has a 420px column and wraps past ~27 characters, and the three value
 * descriptions must stay even — 1/1/2 lines reads as broken.
 */
export const NULL_STATE_V2: NullStateContent = {
  headline: 'An expert, on every page',
  body: 'Add an Expert Agent to your site. It answers buyers on your sales pages and members inside your courses, around the clock.',
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
    // ⚠️ UNVERIFIED — see the note on V1.
    body: '$49/mo per agent after that',
    linkLabel: 'Learn more',
  },
  cta: 'Add your first agent',
};

export interface DemoVisitor {
  name: string;
  /** the separator and its padding spaces are part of the string, as the frame writes it */
  context: string;
}

/**
 * Who is asking, per agent — Figma `1467:67626` (sales) and `1483:68481` / `1483:68482`
 * (teaching). Constant within an agent: the row is present in every state of the loop.
 *
 * The slide frames are what settled this. Until then the row was Sales-only ("viewing your
 * sales page") and didn't change with the tab, which was a live open question; `1483:68475`
 * writes a second visitor for the teaching lane and answers it.
 *
 * ⚠️ Both frames use the SAME avatar image, so Bob currently shows Maya's photo. Fine as
 * placeholder, wrong to ship.
 */
export const DEMO_VISITORS: Record<string, DemoVisitor> = {
  sales: { name: 'Maya', context: '  \u00b7  viewing your sales page' },
  teaching: { name: 'Bob', context: '  \u00b7  inside your course' },
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

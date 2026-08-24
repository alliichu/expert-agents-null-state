/**
 * What the demo agent gets asked, per agent type. Swapped when the switcher changes.
 *
 * Content status, 8/24: these six exchanges are the DESIGNED set, ported frame by frame
 * from Figma and reviewed with Isabelle and Brent. They are no longer placeholders.
 *
 * They are still fictional, deliberately: six different businesses, because the point is
 * that it works whatever you sell. The questions come from Isabelle's classified data
 * (n=3,001 Teaching / n=81 Sales openings), so the SHAPES are real even though the
 * creators are invented. Do not consolidate them onto one fictional creator.
 *
 * ⚠️ What genuinely is not cleared: the $49 price in `nullStateContent.ts`, and three of
 * the six artifacts are UI the chat cannot render today — see each type's doc comment.
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

/**
 * Who is asking. Lives here rather than with the page copy because it is demo content:
 * every exchange names its own asker, and each one is a different business.
 */
export interface DemoVisitor {
  name: string;
  /** the separator and its padding spaces are part of the string, as the frame writes it */
  context: string;
  /** imported avatar asset, exported from the node's image fill at 4x for a 24px row */
  avatar: string;
}
import courseKnifeSkills from '../components/AgentDemoAnimation/assets/course-knife-skills.jpg';
import visitorMaya from '../components/AgentDemoAnimation/assets/visitor-maya.png';
import visitorJim from '../components/AgentDemoAnimation/assets/visitor-jim.png';
import visitorIsa from '../components/AgentDemoAnimation/assets/visitor-isa.png';
import visitorRoman from '../components/AgentDemoAnimation/assets/visitor-roman.png';
import visitorKaylee from '../components/AgentDemoAnimation/assets/visitor-kaylee.png';
import lessonWarmupStill from '../components/AgentDemoAnimation/assets/lesson-warmup-still.jpg';
import visitorDana from '../components/AgentDemoAnimation/assets/visitor-dana.png';
import citeLowLight from '../components/AgentDemoAnimation/assets/cite-low-light.png';

export interface DemoProduct {
  title: string;
  meta: string;
  cta: string;
  /** imported asset for the 348x112 media band; omit and it falls back to flat #d5d5d5 */
  image?: string;
}

/**
 * The email-capture artifact — Figma `1508:5456`.
 *
 * ⚠️ Net-new UI. Lead capture has NO frontend in the product: `LeadCapture::Create` is a
 * tool the LLM calls once the prospect has typed an email into the ordinary composer, and
 * the ask itself is delivered as prose in the hero's own `lead_capture_prompt` wording.
 * The capability is real — it creates a Contact stamped `sales_agent_visitor` — but the
 * field is a design proposal. Flag it in handoff alongside the plan table and the outline.
 */
export interface DemoForm {
  /** field label, 10px semi-bold — `Your email` */
  label: string;
  /** the address shown as already typed */
  value: string;
  /** submit label. `Send` keeps it generic; anything naming an outcome would overclaim,
      since capture persists a contact and fires nothing (see FLEX-3806 in the tool). */
  cta: string;
}

/**
 * Three-column table artifact — Figma `1517:11966`.
 *
 * ⚠️ Net-new UI, and the one Sam is most likely to push on: a plan comparison inside the
 * chat is a step from the pricing-page section he killed on 8/18. Keep it three rows and
 * three columns — a feature matrix turns it into the thing he rejected. Isabelle cleared
 * the stretch on 8/21 ("Ya I'm okay with the payments one stretching a bit!").
 *
 * Quoting a price in the prose alongside it IS correct agent behaviour — the Sales system
 * prompt's stage 3 says to "share the price" — it is only wrong to restate a number the
 * card already carries, which is why the answer gives a range the table never states.
 */
export interface DemoTable {
  /**
   * Column headers, 10px semi-bold. Two or three — the count picks the column template:
   *   3  `1517:11966` plans   54 / 1fr / 52, 24px gaps, columns at x 0 / 78 / 272
   *   2  `1500:4179` skills   1fr / 100, no gap, columns at x 0 / 224
   */
  headers: string[];
  /** one entry per column, same arity as `headers` */
  rows: string[][];
  /** hairline after every row. The plans table has them; the skills table does not. */
  dividers?: boolean;
  /**
   * Centred tertiary footer button, trailing Pine `launch` icon. Omit for no footer — the
   * card then closes with 16px of padding instead of 8 + the button, which is what the
   * skills frame draws.
   */
  footerCta?: string;
}

/**
 * Video-tile artifact — Figma `1519:12334`.
 *
 * ✅ The closest thing in this set to a REAL component: `VideoTile` ships, renders its
 * thumbnail at the timestamp via `buildTimestampThumbnailUrl`, and carries the
 * "Jump to 4:12" + arrowRight affordance. `isVideoWithTimestamp` routes any
 * `video_transcript` citation with a timestamp here rather than to a citation card.
 *
 * The one departure is scale: the shipped tile is a 120x68 horizontal row with no
 * container, and this is a large-media card. Justified — the small thumb reads as a
 * footnote and undersells the only artifact proving the answer came from the creator's own
 * course. Log it in handoff as a product note, not as "make it bigger".
 *
 * It is also the frame that answers Brent's 8/21 callout: it never navigates. It names the
 * lesson and points at the second, which is what EA is good at.
 */
export interface DemoVideo {
  /** 340x160 still, already cropped — see the CSS note on why no object-position is needed */
  still: string;
  title: string;
  /** `Module 2 · Lesson 2` */
  subtitle: string;
  /** `Jump to 4:12` — m:ss, which is `formatTimestamp`'s format under an hour */
  cta: string;
}

/**
 * Source-citation artifact — Figma `1524:12425`.
 *
 * Built on a real component, with two departures worth logging in handoff:
 *
 * 1. `SourceCitationCard` declares a `thumbnailUrl` and NEVER renders it — it always draws
 *    the icon placeholder, and only `VideoTile` uses the thumbnail. So a thumbnail-led
 *    citation is a one-line component change, not new data plumbing. Cheapest Pine ask on
 *    the list.
 * 2. There is no excerpt field, so the pull quote is net-new — though the excerpts already
 *    exist upstream as the chunks `TeachingKnowledge::Search` returns and `Cite` picks from.
 *
 * Also note the real accordion is COLLAPSED by default; drawing it open is deliberate, since
 * a collapsed grey accordion is not a visual. Arguably a product note in its own right.
 *
 * ⚠️ Source must stay non-video: `isVideoWithTimestamp` routes any `video_transcript` with a
 * timestamp to a `VideoTile` instead, which would collide with T2.
 */
export interface DemoCitation {
  /** `1 Reference`. The shipped strings are `1 reference` / `N references`, max 5, deduped. */
  label: string;
  /** 32x32 source thumbnail, already cropped */
  thumb: string;
  title: string;
  /** pull quote — adds the reasoning behind the answer rather than restating it */
  quote: string;
  cta: string;
}

/**
 * Every artifact the demo can draw, tagged by `kind`.
 *
 * ⚠️ Only `offer`, `video` and `citation` correspond to components that exist in the chat
 * today. `form` and `table` are net-new UI — see each interface's own note for what that
 * costs and why it was worth it. Three of the six exchanges depend on them.
 */
export type DemoArtifact =
  | ({ kind: 'offer' } & DemoProduct)
  | ({ kind: 'form' } & DemoForm)
  | ({ kind: 'table' } & DemoTable)
  | ({ kind: 'video' } & DemoVideo)
  | ({ kind: 'citation' } & DemoCitation);

export interface DemoExchange {
  prompt: string;
  /**
   * Who is asking. Keyed PER EXCHANGE, not per agent: each exchange is a different
   * business, so one fixed asker across all three would read as one confused account.
   *
   * Sales rows say `visitor`, Teaching rows say `member`. That split is product truth:
   * `ContactPersonaDigest`'s `identity_line` returns exactly "a visitor (not signed in)"
   * or "Maya Chen (member since ...)" and nothing else, and on a sales page `anonymous?`
   * is true whenever `contact.sales_agent_visitor?`, while inside a course everyone is
   * signed in by definition.
   */
  visitor: DemoVisitor;
  /**
   * The agent's reply. `**bold**` marks an inline bold run — real behaviour, the system
   * prompt allows "bold inline labels and short lists" while banning markdown headings.
   */
  answer: string;
  /**
   * The one thing the agent renders alongside its answer, or nothing.
   *
   * A discriminated union rather than five optional fields: exactly one artifact is ever
   * valid, and optional siblings could not express that — nothing stopped an exchange
   * carrying both a table and a video, and a reader could not tell that was wrong.
   *
   * Omitting it is a REAL shape, not a gap: plenty of questions resolve to prose alone, and
   * it is also how to buy height back for a longer answer (~60-100px card instead of ~250).
   */
  artifact?: DemoArtifact;
}

export const DEMO_EXCHANGES: Record<string, DemoExchange[]> = {
  sales: [
    {
      // S1 — Figma `1500:4068` "agents-card - course". Cooking business.
      prompt: 'Which course is best for a beginner?',
      visitor: { name: 'Maya', context: '  \u00b7  visitor', avatar: visitorMaya },
      answer:
        'This self-paced course is where I’d recommend you starting. It covers basic safety '
        + 'skills and tricks before you start cooking.',
      artifact: {
        kind: 'offer',
        title: 'Your first 20 dinners',
        meta: '$149 · 6 weeks · Self-paced',
        cta: 'Enroll now',
        image: courseKnifeSkills,
      },
    },
    {
      // S2 — Figma `1508:5456` "agents-card - email capture". Lead capture.
      // Workshops rather than courses: Maya's exchange is already a course question
      // resolving to a Course card, and two of three Sales frames on the same subject
      // undercuts the "it works on every business" point the set exists to make.
      prompt: 'How do I hear about new workshops?',
      visitor: { name: 'Jim', context: '  \u00b7  visitor', avatar: visitorJim },
      answer:
        'New workshops get announced by email first. Leave your email and I’ll add you to '
        + 'the list!',
      artifact: {
        kind: 'form',
        label: 'Your email',
        value: 'jimmy.c@gmail.com',
        cta: 'Send',
      },
    },
    {
      // S3 — Figma `1517:11966` "agents-card - plans". Guitar membership.
      prompt: 'How much does it cost?',
      visitor: { name: 'Isa', context: '  \u00b7  visitor', avatar: visitorIsa },
      answer:
        'Plans run $19 to $79 a month. Most people start on **Player** and move up once '
        + 'they’re recording.',
      artifact: {
        kind: 'table',
        headers: ['Plans', 'Includes', 'Price'],
        rows: [
          ['Practice', 'All courses + TAB library', '$19 / mo'],
          ['Player', 'Adds monthly live Q&A', '$39 / mo'],
          ['Studio', 'Adds 1:1 feedback', '$79 / mo'],
        ],
        dividers: true,
        footerCta: 'View details',
      },
    },
  ],
  teaching: [
    {
      // T1 — Figma `1500:4179` "agents-card - skills". Business-development program.
      // Replaces the old "Where do I find lesson three?" exchange, whose `Open lesson`
      // button was exactly the navigation Brent flagged on 8/21 as not working well.
      prompt: 'What were the 5 core skills again?',
      visitor: { name: 'Roman', context: '  \u00b7  member', avatar: visitorRoman },
      answer:
        'These are the five skills she teaches for landing clients. The first four modules '
        + 'cover them in more depth.',
      artifact: {
        kind: 'table',
        headers: ['Skills', 'Module'],
        rows: [
          ['1. Positioning', 'Module 1'],
          ['2. Pricing', 'Module 1'],
          ['3. Outreach', 'Module 2'],
          ['4. Discovery calls', 'Module 3'],
          ['5. Follow-up', 'Module 4'],
        ],
      },
    },
    {
      // T2 — Figma `1519:12334` "agents-card - location". Singing course.
      prompt: 'Where can I find the vocal warm-ups?',
      visitor: { name: 'Kaylee', context: '  \u00b7  member', avatar: visitorKaylee },
      answer:
        'The full warm-up starts about 4 minutes into lessons two. The first 3 minutes are '
        + 'setup, so I’ve pointed you at the warm-up itself.',
      artifact: {
        kind: 'video',
        still: lessonWarmupStill,
        title: 'Breath & Support',
        subtitle: 'Module 2 · Lesson 2',
        cta: 'Jump to 4:12',
      },
    },
    {
      // T3 — Figma `1524:12425` "agents-card - reference". Photography course.
      prompt: 'How do I get sharp photos indoors?',
      visitor: { name: 'Dana', context: '  \u00b7  member', avatar: visitorDana },
      answer:
        'Drop to 1/60 and push ISO to 800 — that’s usually enough indoors. Brace against '
        + 'something if you go below 1/60.',
      artifact: {
        kind: 'citation',
        label: '1 Reference',
        thumb: citeLowLight,
        title: 'Low Light Photography',
        quote: '“…the sensor handles grain better than your hands handle a slow shutter.”',
        cta: 'View lesson',
      },
    },
  ],
};

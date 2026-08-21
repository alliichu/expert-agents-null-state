/**
 * Admin sidenav model — transcribed from kajabi-products.
 *
 * Source of truth:
 *   app/views/admin/shared/_sleek_sidenav.html.erb   (sections, icons, order)
 *   app/views/admin/shared/_sleek_sidebar.html.erb   (footer links)
 *   config/locales/en_admin.yml → en.admin.sidenav   (every label)
 *
 * Checked out at 1a312ca09ed (2026-06-23). Re-verify against main before handoff.
 *
 * Prod gates each row behind an ability check and/or a feature flag. This models the
 * fully-entitled `ux_appframe` account the Figma frame depicts, which is why Analytics
 * is a plain link here (under ux_appframe prod renders it without subsections) and why
 * the flag-gated rows — Agents, Media Library, Amplify, Backstage — are all present.
 */

import {
  amplifyOutlined,
  backstage,
  barChartTone,
  comment,
  creditCardTone,
  cubeTone,
  dotsHorizontalTone,
  editor,
  gear,
  homeTone,
  image,
  mailTone,
  monitorTone,
  userStar,
  usersTone,
} from '@pine-ds/icons/icons';

export interface NavChild {
  label: string;
  /** prod renders these with `external`, which suppresses the trailing launch icon */
  external?: boolean;
}

export interface NavItem {
  label: string;
  icon: string;
  children?: NavChild[];
  /** prod: `display_backstage_beta_badge` */
  betaBadge?: boolean;
  external?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', icon: homeTone },
  {
    label: 'Products',
    icon: cubeTone,
    children: [
      { label: 'All Products' },
      { label: 'Courses' },
      { label: 'Coaching' },
      { label: 'Community' },
      { label: 'Podcasts' },
      { label: 'Newsletters' },
      { label: 'Downloads' },
    ],
  },
  {
    label: 'Sales',
    icon: creditCardTone,
    children: [
      { label: 'Payments' },
      { label: 'Offers' },
      { label: 'Payouts' },
      { label: 'Cart' },
      { label: 'Invoices' },
      { label: 'Coupons' },
      { label: 'Affiliates' },
    ],
  },
  {
    label: 'Website',
    icon: monitorTone,
    children: [
      { label: 'Design' },
      // ux_appframe splits prod's single "Pages" row into these two
      { label: 'Website Pages' },
      { label: 'Landing Pages' },
      { label: 'Navigation' },
      { label: 'Blog' },
    ],
  },
  {
    label: 'Marketing',
    icon: mailTone,
    children: [
      { label: 'Overview' },
      { label: 'Universal Inbox' },
      { label: 'SMS Campaigns' },
      { label: 'Email Campaigns' },
      { label: 'Funnels' },
      { label: 'Automations' },
      { label: 'Events' },
      { label: 'Forms' },
    ],
  },
  {
    label: 'Contacts',
    icon: usersTone,
    children: [{ label: 'All Contacts' }, { label: 'Insights' }, { label: 'Assessments' }],
  },
  { label: 'Analytics', icon: barChartTone },
  { label: 'Agents', icon: editor },
  { label: 'Media Library', icon: image },
  { label: 'Amplify', icon: amplifyOutlined, external: true },
  { label: 'Partner Program', icon: userStar },
  { label: 'Backstage', icon: backstage, betaBadge: true },
  {
    label: 'More',
    icon: dotsHorizontalTone,
    children: [
      { label: 'Capital' },
      { label: 'Branded App' },
      { label: 'Creator Studio' },
      { label: 'Expert Services', external: true },
      { label: 'Custom Templates', external: true },
    ],
  },
];

export const FOOTER_NAV: NavItem[] = [
  { label: 'Settings', icon: gear },
  { label: 'Give Feedback', icon: comment, external: true },
];

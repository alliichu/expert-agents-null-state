/**
 * Mock account/user shown in the shell. Matches the Figma frame
 * (Alli's Sketchbook → ↳ Scratchpad - null state → node 1406:64096).
 */

export const ACCOUNT = {
  siteName: "Sydney's Sweets",
  userName: 'Sydney Smith',
  /** prod reads current_user.avatar_url; null renders pds-avatar's initial-less default */
  avatarUrl: null as string | null,
};

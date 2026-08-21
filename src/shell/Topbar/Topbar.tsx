import { Fragment } from 'react';
import { PdsAvatar, PdsBox, PdsButton, PdsIcon, PdsRow } from '@pine-ds/react';
import { aiSparkle, search } from '@pine-ds/icons/icons';
// Vendored verbatim from app/views/admin/sidenav/_kajabi_logo_no_text.html.erb.
// Kept as an <img> because the mark carries three linear gradients that
// pds-icon would flatten (it forces fill: currentColor).
import kajabiMark from './assets/kajabi-mark.svg';
import './Topbar.css';

export interface Crumb {
  label: string;
  href?: string;
}

interface TopbarProps {
  siteName: string;
  userName: string;
  avatarUrl?: string | null;
  breadcrumbs?: Crumb[];
}

/**
 * Admin topbar, 1:1 with prod's `ux_appframe` bar.
 *
 * Source: app/views/admin/shared/app_frame/_topbar.html.erb
 *         + _topbar_site_selector / _topbar_actions / _user_dropdown
 *
 * Prod also renders a hamburger toggle in the left box; it's `display: none`
 * above the lg breakpoint, so it's omitted here (this prototype is desktop-only).
 * The interactive dropdown panels are out of scope — the triggers are exact,
 * they just don't open yet.
 */
export function Topbar({ siteName, userName, avatarUrl, breadcrumbs = [] }: TopbarProps) {
  return (
    <PdsBox className="appframe-topbar" display="block">
      <PdsRow className="appframe-topbar__row" colGapX="sm" noWrap>
        {/* site switcher */}
        <PdsBox alignItems="center" auto>
          <PdsButton
            className="site-select-menu__trigger"
            variant="secondary"
            subtle
            aria-label="Select a site to view"
          >
            <span className="site-select-menu__inner">
              <img className="site-select-menu__logo" src={kajabiMark} alt="" width={28} height={28} />
              <span className="site-select-menu__title">{siteName}</span>
            </span>
          </PdsButton>
        </PdsBox>

        {/* breadcrumbs — prod yields `content_for :breadcrumbs` here */}
        <PdsBox className="assistant-bar__breadcrumbs" id="app-breadcrumbs">
          {breadcrumbs.length > 0 && (
            <nav className="sage-breadcrumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <Fragment key={crumb.label}>
                  {i > 0 && <span className="sage-breadcrumbs__divider">/</span>}
                  <a
                    className={`sage-breadcrumbs__link${
                      i === breadcrumbs.length - 1 ? ' sage-breadcrumbs__link--current' : ''
                    }`}
                    href={crumb.href ?? '#'}
                    aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                  >
                    {crumb.label}
                  </a>
                </Fragment>
              ))}
            </nav>
          )}
        </PdsBox>

        {/* actions */}
        <PdsBox className="appframe-topbar__actions" alignItems="center" gap="xs" auto>
          {/* prod passes the deprecated `icon="name"` attribute, which resolves against
              the CDN icon set. Bundled, the supported path is a slotted pds-icon with an
              imported icon — same rendered mark, current API. `iconOnly` keeps the child
              text as the accessible name. */}
          <div className="copy-magic__conversation-assistant-button">
            <PdsButton variant="secondary" iconOnly>
              <PdsIcon slot="start" icon={aiSparkle} />
              Kajabi Assistant
            </PdsButton>
          </div>
          <PdsButton className="appframe-topbar__modal-trigger" variant="secondary" iconOnly>
            <PdsIcon slot="start" icon={search} />
            Search
          </PdsButton>
          <PdsButton
            aria-label="User account menu"
            className="user-profile-menu__trigger"
            id="user-dropdown"
            variant="secondary"
          >
            <span className="user-profile-menu__inner">
              <PdsAvatar
                className="user-profile-menu__avatar"
                image={avatarUrl ?? undefined}
                size="28px"
                variant="admin"
              />
              <p className="user-profile__name">{userName}</p>
            </span>
          </PdsButton>
        </PdsBox>
      </PdsRow>
    </PdsBox>
  );
}

import { MouseEvent } from 'react';
import { PdsAccordion, PdsBox, PdsChip, PdsIcon, PdsLink } from '@pine-ds/react';
import { FOOTER_NAV, NavItem, PRIMARY_NAV } from '../../data/navigation';
import './Sidenav.css';

interface SidenavProps {
  /** matches NavItem.label; prod computes this from the request path */
  activeItem?: string;
  onNavigate?: (label: string) => void;
}

/**
 * Admin left rail, 1:1 with prod's `ux_appframe` sidenav.
 *
 * Markup mirrors kajabi-products so the class hooks and Pine parts line up:
 *   app/views/admin/shared/_sleek_sidebar.html.erb  → .sleek-sidebar > body + footer
 *   app/views/admin/shared/app_frame/_sidenav.html.erb → pds-link / pds-accordion per row
 *
 * Styling is prod's, not re-derived — see Sidenav.css for the file each value came from.
 */
export function Sidenav({ activeItem, onNavigate }: SidenavProps) {
  const renderLink = (item: NavItem, isActive: boolean) => (
    <PdsLink
      className={isActive ? 'active' : undefined}
      href="#"
      variant="plain"
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        onNavigate?.(item.label);
      }}
    >
      {/* prod passes an explicit colour only on the active row and lets the
          stylesheet own the rest — same here */}
      <PdsIcon icon={item.icon} color={isActive ? 'var(--pine-color-text-strong)' : undefined} />
      <span>{item.label}</span>
      {item.betaBadge && (
        <PdsChip sentiment="neutral" size="sm" className="beta-badge">
          Beta
        </PdsChip>
      )}
    </PdsLink>
  );

  return (
    <div className="sleek-sidebar sleek-sidebar--sage appframe-sidebar">
      <div className="sage-sidebar__body">
        <nav className="sage-nav appframe-sidenav" aria-label="Main navigation">
          <ul className="sage-nav__list">
            {PRIMARY_NAV.map((item) => {
              const isActive = item.label === activeItem;

              return (
                <li key={item.label}>
                  {item.children ? (
                    <PdsAccordion className={isActive ? 'active' : undefined} open={isActive}>
                      <PdsBox slot="label" alignItems="center" gap="xs">
                        <PdsIcon
                          icon={item.icon}
                          color={isActive ? 'var(--pine-color-text-hover)' : undefined}
                        />
                        <span>{item.label}</span>
                      </PdsBox>
                      <PdsBox direction="column" fit>
                        {item.children.map((child) => (
                          <PdsLink
                            key={child.label}
                            href="#"
                            variant="plain"
                            external={child.external}
                            onClick={(event: MouseEvent) => {
                              event.preventDefault();
                              onNavigate?.(child.label);
                            }}
                          >
                            {child.label}
                          </PdsLink>
                        ))}
                      </PdsBox>
                    </PdsAccordion>
                  ) : (
                    renderLink(item, isActive)
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sage-sidebar__footer">
        <nav className="sage-nav" aria-label="Secondary navigation">
          <ul className="sage-nav__list" id="sleek_sidenav_bottom_links">
            {FOOTER_NAV.map((item) => (
              <li key={item.label}>{renderLink(item, item.label === activeItem)}</li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

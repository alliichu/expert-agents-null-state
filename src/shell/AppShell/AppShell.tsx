import { ReactNode } from 'react';
import { Topbar, Crumb } from '../Topbar/Topbar';
import { Sidenav } from '../Sidenav/Sidenav';
import { ACCOUNT } from '../../data/account';
import './AppShell.css';

interface AppShellProps {
  breadcrumbs?: Crumb[];
  siteName?: string;
  userName?: string;
  activeNavItem?: string;
  onNavigate?: (item: string) => void;
  children?: ReactNode;
}

/**
 * Admin chrome: 64px fixed topbar + 250px fixed left rail + offset content area.
 * Offsets come from prod (--sidebar-offset: 64px, $sidebar-width: 250px).
 */
export function AppShell({
  breadcrumbs,
  siteName = ACCOUNT.siteName,
  userName = ACCOUNT.userName,
  activeNavItem,
  onNavigate,
  children,
}: AppShellProps) {
  return (
    <>
      <Topbar
        siteName={siteName}
        userName={userName}
        avatarUrl={ACCOUNT.avatarUrl}
        breadcrumbs={breadcrumbs}
      />
      <Sidenav activeItem={activeNavItem} onNavigate={onNavigate} />
      <main className="app-content">{children}</main>
    </>
  );
}

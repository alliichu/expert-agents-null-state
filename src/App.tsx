import { useEffect } from 'react';
import { AppShell } from './shell/AppShell/AppShell';
import { ExpertAgentsNullState } from './components/ExpertAgentsNullState/ExpertAgentsNullState';
import { DemoTransition, SwitcherVariant } from './components/AgentDemoPanel/AgentDemoPanel';
import { NULL_STATE_V1, NULL_STATE_V2, NullStateContent } from './data/nullStateContent';

interface Version {
  content: NullStateContent;
  /** demo-panel switcher treatment */
  switcher: SwitcherVariant;
  /** how switching agents moves the demo */
  transition: DemoTransition;
}

/**
 * What each version IS. One table — routes, copy and per-version options in one place.
 *
 *   V1  the page Sam reviewed: glass-chip switcher (Figma `1436:67068`)
 *   V2  added 8/20: text switcher (Figma `1474:68298`)
 *
 * Both slide the demo on a switch (Figma `1483:68475`) — added to V2 first, then adopted by
 * V1 too (Allison, 8/20). So the switcher treatment is the only thing separating them today,
 * besides the copy object.
 *
 * `transition` stays a per-version field rather than becoming the default inside the panel:
 * the two are independent axes, and `cut` is still what a version would want if the slide
 * ever turns out to be wrong for it.
 *
 * Both render the same page component and share the shell and the demo panel; a version
 * that needs a different LAYOUT gets its own component and this table points at it.
 */
const VERSIONS = {
  v1: { content: NULL_STATE_V1, switcher: 'chip', transition: 'slide' },
  v2: { content: NULL_STATE_V2, switcher: 'text', transition: 'slide' },
} as const satisfies Record<string, Version>;

type VersionId = keyof typeof VERSIONS;

/** Versions are routes in this one app — never folder clones (pod convention). */
const ROUTES: Record<string, VersionId> = {
  '/': 'v1',
  '/v1': 'v1',
  '/v2': 'v2',
};

/**
 * Read once at mount, not reactively: switching versions is a page load. That is also what
 * makes the versions comparable — two tabs, one per version, side by side. Unknown paths
 * fall back to V1 rather than erroring; a prototype should never show a blank screen to
 * someone who typed the URL slightly wrong.
 */
function currentVersion(): VersionId {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return ROUTES[path] ?? 'v1';
}

export default function App() {
  const id = currentVersion();
  const version = VERSIONS[id];

  // so two tabs open on two versions are tellable apart
  useEffect(() => {
    document.title = `Marketing Null States — ${id.toUpperCase()}`;
  }, [id]);

  return (
    <AppShell activeNavItem="Agents">
      <ExpertAgentsNullState
        content={version.content}
        switcher={version.switcher}
        transition={version.transition}
      />
    </AppShell>
  );
}

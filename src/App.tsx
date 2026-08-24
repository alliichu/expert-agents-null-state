import { useEffect } from 'react';
import { AppShell } from './shell/AppShell/AppShell';
import { ExpertAgentsNullState } from './components/ExpertAgentsNullState/ExpertAgentsNullState';
import { NULL_STATE_V1 } from './data/nullStateContent';

/**
 * One version. V2 existed 8/20-8/24 as a text-switcher variant, was scratched on 8/20 and
 * deleted on 8/24 for the dev handoff — a scratched route is noise in a repo someone is
 * reading to implement from.
 *
 * The pod convention still holds if another version is wanted: versions are ROUTES in this
 * one app, never folder clones. Add a table here mapping paths to content, and give a
 * version its own component only if it needs a different layout.
 */
export default function App() {
  useEffect(() => {
    document.title = 'Marketing Null States — Expert Agents';
  }, []);

  return (
    <AppShell activeNavItem="Agents">
      <ExpertAgentsNullState content={NULL_STATE_V1} />
    </AppShell>
  );
}

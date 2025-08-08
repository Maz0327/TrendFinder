// Workspace Page - Phase 2 migration
// Main workspace container with new navigation

import React from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { WorkspaceLayout } from '@/features/workspace/components/WorkspaceLayout';
import { 
  TodaysBriefing, 
  ExploreSignals, 
  NewSignalCapture, 
  StrategicBriefLab, 
  Manage 
} from '@/features/workspace/pages';

interface WorkspacePageProps {
  user: { id: string; email: string };
  onLogout: () => void;
}

export function WorkspacePage({ user, onLogout }: WorkspacePageProps) {
  return (
    <WorkspaceLayout user={user} onLogout={onLogout}>
      <Switch>
        <Route path="/workspace/briefing" component={TodaysBriefing} />
        <Route path="/workspace/explore" component={ExploreSignals} />
        <Route path="/workspace/capture" component={NewSignalCapture} />
        <Route path="/workspace/briefs" component={StrategicBriefLab} />
        <Route path="/workspace/manage" component={Manage} />
        <Route>
          <Redirect to="/workspace/briefing" />
        </Route>
      </Switch>
    </WorkspaceLayout>
  );
}
import React from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { NewWorkspaceLayout } from '@/features/workspace/components/NewWorkspaceLayout';
import { 
  DashboardPage,
  SignalsPage,
  CapturePage,
  BriefsPage,
  InsightsPage
} from '@/features/workspace/pages/redesigned';

interface NewWorkspacePageProps {
  user: { id: string; email: string };
  onLogout: () => void;
}

export function NewWorkspacePage({ user, onLogout }: NewWorkspacePageProps) {
  return (
    <NewWorkspaceLayout user={user} onLogout={onLogout}>
      <Switch>
        <Route path="/workspace/dashboard" component={DashboardPage} />
        <Route path="/workspace/signals" component={SignalsPage} />
        <Route path="/workspace/capture" component={CapturePage} />
        <Route path="/workspace/briefs" component={BriefsPage} />
        <Route path="/workspace/insights" component={InsightsPage} />
        <Route>
          <Redirect to="/workspace/dashboard" />
        </Route>
      </Switch>
    </NewWorkspaceLayout>
  );
}
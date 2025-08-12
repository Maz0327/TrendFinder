// Client API service for brief operations

interface ExportBriefRequest {
  captureIds: string[];
  projectId: string;
  title: string;
  outline?: any[];
}

interface ExportBriefResponse {
  slidesUrl: string;
  presentationId: string;
  title: string;
}

export async function exportBriefToSlides(request: ExportBriefRequest): Promise<ExportBriefResponse> {
  const response = await fetch('/api/google/brief', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include session cookies
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401 && errorData.authRequired) {
      throw new Error('Google authentication required. Please visit the Integrations page to configure your Google API credentials.');
    }
    
    throw new Error(errorData.error || `Export failed: ${response.status}`);
  }

  return response.json();
}

export async function checkGoogleAuthStatus(): Promise<{
  authenticated: boolean;
  authUrl?: string;
  availableServices: string[];
}> {
  const response = await fetch('/api/google/auth/status', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to check authentication status');
  }

  return response.json();
}
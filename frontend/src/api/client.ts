
import axios from 'axios';
import { auth } from '../config/firebase';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the current Firebase ID token to backend requests.
apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;

  if (currentUser) {
    const idToken = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// Handle unauthorized responses without treating GitHub
// repository-connection errors as BugPulse session failures.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? '';
    const isGitHubRequest = /\/github(?:\/|$|\?)/i.test(requestUrl);

    if (error.response?.status === 401 && !isGitHubRequest) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

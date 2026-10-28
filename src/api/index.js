import { httpApi } from './http';
import { mockApi, resetDemo } from './mock';

// Only this module decides whether the app talks to local demo data or FastAPI.
// Pages/components never import mock data and never call fetch directly.
export const mode = import.meta.env.VITE_DATA_MODE === 'http' ? 'http' : 'mock';
export const api = mode === 'http' ? httpApi : mockApi;
export const isDemo = mode === 'mock';
export { resetDemo };

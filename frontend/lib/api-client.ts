/**
 * Unified API Client for Frontend connecting to Node.js Express Backend
 */

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('expo_admin_token');
    if (stored && stored !== 'null' && stored !== 'undefined') {
      token = stored;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const baseUrl = getApiBaseUrl();
  const requestUrl = `${baseUrl}${endpoint}`;

  try {
    const res = await fetch(requestUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      if (text.trim().startsWith('<')) {
        throw new Error(`API Endpoint "${endpoint}" at ${baseUrl} returned HTML instead of JSON (${res.status} ${res.statusText})`);
      }
      throw new Error(`Server returned non-JSON response (${res.status} ${res.statusText})`);
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || `API Request Failed (${res.status})`);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Server response timed out. Please check backend connection.');
    }
    throw err;
  }
}

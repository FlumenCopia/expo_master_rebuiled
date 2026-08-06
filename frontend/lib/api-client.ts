/**
 * Unified API Client for Frontend connecting to Node.js Express Backend
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'API Request Failed');
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body?.message === 'string' ? body.message : `Request failed with ${status}`);
    this.status = status;
    this.body = body;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('lms_token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem('lms_token', token);
  else window.localStorage.removeItem('lms_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (networkErr: any) {
    // This is exactly the shape a real CORS block takes in the browser:
    // fetch() rejects with a generic "Failed to fetch" / TypeError, and
    // the actual reason only shows up in the DevTools console, never in
    // the JS error message itself. We surface that reality here.
    throw new ApiError(0, {
      message:
        'Network request failed. If this is the video manifest call, open DevTools Console - this is almost always a CORS policy block, not a real network outage.',
      raw: networkErr?.message,
    });
  }

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: any) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: any) =>
    request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
};

export { API_URL };

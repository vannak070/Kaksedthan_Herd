const API_BASE_URL = typeof window !== 'undefined' ? '/api/v1' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api/v1');

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      responseData?.message || `API Request failed with status ${response.status}`,
      responseData
    );
  }

  return responseData?.data !== undefined ? responseData.data : responseData;
}

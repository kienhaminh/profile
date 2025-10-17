/**
 * Centralized authentication utilities for client-side admin API calls
 * Uses httpOnly cookie-based authentication for security
 */

export interface AuthFetchOptions extends RequestInit {
  credentials?: 'include' | 'omit' | 'same-origin';
}

/**
 * Makes an authenticated fetch request to admin endpoints
 * Automatically includes credentials for cookie-based authentication
 */
export async function authFetch(url: string, options: AuthFetchOptions = {}) {
  const config: RequestInit = {
    ...options,
    credentials: options.credentials ?? 'include', // Default to include for cookie auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  return fetch(url, config);
}

/**
 * Makes an authenticated POST request to admin endpoints
 */
export async function authPost<T = unknown>(
  url: string,
  data?: T,
  options: AuthFetchOptions = {}
) {
  return authFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Makes an authenticated PUT request to admin endpoints
 */
export async function authPut<T = unknown>(
  url: string,
  data?: T,
  options: AuthFetchOptions = {}
) {
  return authFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * Makes an authenticated DELETE request to admin endpoints
 */
export async function authDelete(url: string, options: AuthFetchOptions = {}) {
  return authFetch(url, {
    method: 'DELETE',
    ...options,
  });
}

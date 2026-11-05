/**
 * Utility to reliably extract human-friendly error messages from API errors.
 * Handles strings, FastAPI Pydantic validation error lists, Error objects, and network errors.
 */
export function getErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!error) return fallbackMessage;

  const detail = error.response?.data?.detail;

  // 1. FastAPI string error (e.g. detail: "Incorrect email or password.")
  if (typeof detail === 'string') {
    return detail;
  }

  // 2. FastAPI validation error array (e.g. detail: [{ loc: [...], msg: "...", type: "..." }])
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.msg) {
          const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : '';
          return field && field !== 'body' ? `${field}: ${item.msg}` : item.msg;
        }
        return JSON.stringify(item);
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  // 3. Object with msg or message
  if (detail && typeof detail === 'object') {
    if (detail.msg) return String(detail.msg);
    if (detail.message) return String(detail.message);
  }

  if (error.response?.data?.message) {
    return String(error.response.data.message);
  }

  // 4. Network or CORS error (no response received)
  if (error.request && !error.response) {
    return 'Unable to connect to the backend server. Please verify the server is running on http://localhost:8000.';
  }

  if (error.message) {
    return error.message;
  }

  return fallbackMessage;
}

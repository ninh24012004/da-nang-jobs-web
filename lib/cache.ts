/**
 * Generic helper to transparently cache API responses in sessionStorage for the duration of the browser tab session.
 * Highly recommended for master data (categories, districts, positions) that rarely change.
 */
export const getCachedOrFetch = async <T>(key: string, fetchFn: () => Promise<T>): Promise<T> => {
  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(`Failed to parse sessionStorage cache for key "${key}":`, e);
      }
    }
  }

  const data = await fetchFn();

  if (typeof window !== "undefined" && data) {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed to save data to sessionStorage for key "${key}":`, e);
    }
  }

  return data;
};

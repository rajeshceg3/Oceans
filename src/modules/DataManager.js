import oceanData from '../data/oceans.json';

/**
 * Fetches ocean data.
 * In a real app, this might fetch from an API.
 * Currently, it returns the imported JSON.
 * @returns {Promise<Object>} The ocean data object
 */
export async function fetchOceanData() {
  // Simulate network delay if needed, or just return data
  return new Promise((resolve) => {
      resolve(oceanData);
  });
}

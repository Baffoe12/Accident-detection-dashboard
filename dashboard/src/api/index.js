export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:4000'
    : 'https://accident-detection-85af.onrender.com');

const API_KEY = process.env.REACT_APP_API_KEY || 'safedrive_secret_key';

async function fetchWithTimeout(url, options = {}, timeout = 5000, signal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const cleanup = () => {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', abortHandler);
    }
  };

  const abortHandler = () => {
    cleanup();
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      cleanup();
      throw new DOMException('Aborted', 'AbortError');
    }
    signal.addEventListener('abort', abortHandler);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response;
  } catch (err) {
    cleanup();
    if (err.name === 'AbortError') {
      console.log('Request was aborted');
      throw err;
    }
    throw err;
  }
}

async function handleApiRequest(endpoint, method = 'GET', data = null, signal) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${endpoint}`,
      {
        method,
        body: data ? JSON.stringify(data) : undefined,
      },
      10000,
      signal
    );
    return await response.json();
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(`API Error (${endpoint}):`, err);
    }
    throw err;
  }
}

const api = {
  getLatestSensorData: (signal) => handleApiRequest('/api/sensor', 'GET', null, signal),
  getHealth: (signal) => handleApiRequest('/api/health', 'GET', null, signal),
  getStats: (signal) => handleApiRequest('/api/stats', 'GET', null, signal),
  getAccidents: (signal) => handleApiRequest('/api/accidents', 'GET', null, signal),
  getSensorHistory: (signal) => handleApiRequest('/api/sensor/history', 'GET', null, signal),
  postSensorData: (data, signal) => handleApiRequest('/api/sensor', 'POST', data, signal),
};

export default api;
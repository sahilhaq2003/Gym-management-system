export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Ensure no trailing slash
    BASE_URL = BASE_URL.replace(/\/$/, '');
    // Ensure it ends with /api if not present in the env var (common user mistake)
    if (!BASE_URL.endsWith('/api')) {
        BASE_URL += '/api';
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Include specific backend error details if available
        const detail = errorData.error || errorData.details || '';
        throw new Error(errorData.message ? `${errorData.message}${detail ? `: ${detail}` : ''}` : `API Error: ${response.statusText}`);
    }

    return response.json();
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("generated_app_token");
}

export function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function login(email: string, password: string) {
  return apiRequest<{ token: string; user: any }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(name: string, email: string, password: string) {
  return apiRequest<{ id?: string; name?: string; email?: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

import { CompanySettings, Product, Client, Movement, ReconciliationCut, User } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Authentication & Users
  login: (email: string, password: string): Promise<{ success: boolean; user: User }> =>
    fetchJson<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getUsers: (): Promise<User[]> => fetchJson<User[]>('/users'),
  createUser: (user: { name: string; email: string; password: string; role: string; roleLabel?: string }): Promise<User> =>
    fetchJson<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  deleteUser: (id: string): Promise<{ success: boolean; id: string }> =>
    fetchJson<{ success: boolean; id: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),
  updateUserPassword: (id: string, password: string): Promise<{ success: boolean }> =>
    fetchJson<{ success: boolean }>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),

  // Company Settings
  getSettings: (): Promise<CompanySettings> => fetchJson<CompanySettings>('/settings'),
  updateSettings: (settings: CompanySettings): Promise<CompanySettings> =>
    fetchJson<CompanySettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Products
  getProducts: (): Promise<Product[]> => fetchJson<Product[]>('/products'),
  saveProduct: (product: Product): Promise<Product> =>
    fetchJson<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  importProductsBatch: (products: Product[]): Promise<Product[]> =>
    fetchJson<Product[]>('/products/batch', {
      method: 'POST',
      body: JSON.stringify(products),
    }),
  deleteProduct: (sku: string): Promise<{ success: boolean }> =>
    fetchJson<{ success: boolean }>(`/products/${encodeURIComponent(sku)}`, {
      method: 'DELETE',
    }),

  // Clients
  getClients: (): Promise<Client[]> => fetchJson<Client[]>('/clients'),
  saveClient: (client: Client): Promise<Client> =>
    fetchJson<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    }),

  // Movements
  getMovements: (): Promise<Movement[]> => fetchJson<Movement[]>('/movements'),
  addMovement: (movement: Movement): Promise<Movement> =>
    fetchJson<Movement>('/movements', {
      method: 'POST',
      body: JSON.stringify(movement),
    }),

  // Cuts
  getCuts: (): Promise<ReconciliationCut[]> => fetchJson<ReconciliationCut[]>('/cuts'),
  addCut: (cut: ReconciliationCut): Promise<ReconciliationCut> =>
    fetchJson<ReconciliationCut>('/cuts', {
      method: 'POST',
      body: JSON.stringify(cut),
    }),

  // Administrative Reset
  resetDatabase: (mode: 'empty' | 'demo'): Promise<{ message: string }> =>
    fetchJson<{ message: string }>('/admin/reset', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),
};

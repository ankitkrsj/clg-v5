const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async register(email: string, password: string, username: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Wallet endpoints
  async getWallet() {
    return this.request('/wallet');
  }

  async getTransactions() {
    return this.request('/wallet/transactions');
  }

  async updateWalletBalance(amount: number) {
    return this.request('/wallet/balance', {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  }

  // Game endpoints
  async getCurrentGame() {
    return this.request('/games/current');
  }

  async placeBet(gameId: string, betType: string, betValue: string, amount: number) {
    return this.request('/games/bet', {
      method: 'POST',
      body: JSON.stringify({ gameId, betType, betValue, amount }),
    });
  }

  // Transaction endpoints
  async createDepositRequest(amount: number, screenshot: File) {
    const formData = new FormData();
    formData.append('amount', amount.toString());
    formData.append('screenshot', screenshot);

    return this.request('/transactions/deposit', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers() {
    return this.request('/admin/users');
  }

  async blockUser(userId: string, isBlocked: boolean, blockReason?: string) {
    return this.request(`/admin/users/${userId}/block`, {
      method: 'PUT',
      body: JSON.stringify({ isBlocked, blockReason }),
    });
  }

  async getAdminTransactions() {
    return this.request('/admin/transactions');
  }

  async updateTransaction(transactionId: string, status: string, adminNotes?: string) {
    return this.request(`/admin/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  async getAdminSettings() {
    return this.request('/admin/settings');
  }

  async updateAdminSettings(settings: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async createGame() {
    return this.request('/games/create', {
      method: 'POST',
    });
  }

  async endGame(gameId: string) {
    return this.request(`/games/${gameId}/end`, {
      method: 'PUT',
    });
  }

  async fixGameResult(gameId: string, fixedResult: number) {
    return this.request(`/admin/games/${gameId}/fix`, {
      method: 'PUT',
      body: JSON.stringify({ fixedResult }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
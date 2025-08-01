/**
 * Simple Service Client - Basic service communication for Gateway pattern
 */

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SimpleServiceClient {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request to service
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ServiceResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Service error: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods
  protected get<T>(endpoint: string, headers?: Record<string, string>): Promise<ServiceResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  protected post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ServiceResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers
    });
  }

  protected put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ServiceResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers
    });
  }

  protected delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ServiceResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

/**
 * Article Service Client
 */
export class ArticleServiceClient extends SimpleServiceClient {
  constructor() {
    super(process.env.ARTICLE_SERVICE_URL || 'http://localhost:3001');
  }

  async createArticle(data: any, userId: string): Promise<ServiceResponse> {
    return this.post('/api/articles', { ...data, userId }, {
      'X-User-ID': userId
    });
  }

  async getArticle(articleId: string): Promise<ServiceResponse> {
    return this.get(`/api/articles/${articleId}`);
  }

  async updateArticle(articleId: string, data: any, userId: string): Promise<ServiceResponse> {
    return this.put(`/api/articles/${articleId}`, data, {
      'X-User-ID': userId
    });
  }

  async deleteArticle(articleId: string, userId: string): Promise<ServiceResponse> {
    return this.delete(`/api/articles/${articleId}`, {
      'X-User-ID': userId
    });
  }
}

/**
 * User Service Client
 */
export class UserServiceClient extends SimpleServiceClient {
  constructor() {
    super(process.env.USER_SERVICE_URL || 'http://localhost:3002');
  }

  async getUser(userId: string): Promise<ServiceResponse> {
    return this.get(`/api/users/${userId}`);
  }

  async updateProfile(userId: string, data: any): Promise<ServiceResponse> {
    return this.put(`/api/users/${userId}`, data, {
      'X-User-ID': userId
    });
  }

  async getUserStats(userId: string): Promise<ServiceResponse> {
    return this.get(`/api/users/${userId}/stats`);
  }
}

/**
 * Auth Service Client
 */
export class AuthServiceClient extends SimpleServiceClient {
  constructor() {
    super(process.env.AUTH_SERVICE_URL || 'http://localhost:3003');
  }

  async register(userData: any): Promise<ServiceResponse> {
    return this.post('/api/auth/register', userData);
  }

  async login(credentials: any): Promise<ServiceResponse> {
    return this.post('/api/auth/login', credentials);
  }

  async getCurrentUser(token: string): Promise<ServiceResponse> {
    return this.get('/api/auth/me', {
      'Authorization': `Bearer ${token}`
    });
  }
}
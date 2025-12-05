/**
 * API Client for Electric Store Management System
 * Centralized API configuration and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'

export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  status: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      // If running in the browser, auto-attach Authorization header from localStorage
      const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
      }
      try {
        if (typeof window !== 'undefined' && !headers.Authorization && !headers.authorization) {
          const token = localStorage.getItem('auth_token')
          if (token) headers.Authorization = `Token ${token}`
        }
      } catch (e) {
        // ignore localStorage access errors
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      const text = await response.text()
      let data: any = null
      try {
        data = text ? JSON.parse(text) : null
      } catch (e) {
        // not JSON, keep raw text
        data = text
      }

      if (!response.ok) {
        // try to surface structured error message if present
        const errMsg =
          (data && (data.error || data.detail || data.message)) ||
          response.statusText ||
          `HTTP ${response.status}`

        return {
          data: null,
          error: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg),
          status: response.status,
        }
      }

      return {
        data,
        error: null,
        status: response.status,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Network error',
        status: 0,
      }
    }
  }

  // Products
  async getProducts() {
    return this.request('/products/products/')
  }

  async getProduct(id: string) {
    return this.request(`/products/products/${id}/`)
  }

  async createProduct(token: string, data: any) {
    // Map frontend field names to backend field names
    const payload = {
      name: data.name,
      description: data.description,
      base_price: data.basePrice || data.base_price,
      category: data.category,
      brand: data.brand,
      image: data.image,
      is_active: true,
    }
    
    // allow passing optional initial_stock
    if (typeof data.initial_stock === 'number') payload.initial_stock = data.initial_stock

    return this.request('/products/products/', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  }

  async updateProduct(token: string, id: string, data: any) {
    // Map frontend field names to backend field names
    const payload: any = {
      name: data.name,
      description: data.description,
      base_price: data.basePrice || data.base_price,
      category: data.category,
      brand: data.brand,
    }
    
    if (data.image) {
      payload.image = data.image
    }
    
    return this.request(`/products/products/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    })
  }

  async deleteProduct(token: string, id: string) {
    return this.request(`/products/products/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
  }

  async uploadProductImage(token: string | null | undefined, file: File) {
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      const url = `${this.baseURL}/products/upload-image/`
      // No authorization headers needed - endpoint allows any user
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMsg = response.statusText
        try {
          const data = await response.json()
          errorMsg = data.error || errorMsg
        } catch (e) {
          // Response might not be JSON
        }
        return {
          data: null,
          error: errorMsg,
          status: response.status,
        }
      }

      const data = await response.json()
      return {
        data,
        error: null,
        status: response.status,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Upload failed',
        status: 0,
      }
    }
  }

  async deleteProductImage(token: string, imageUrl: string) {
    return this.request('/products/upload-image/', {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ url: imageUrl }),
    })
  }

  async getCategories() {
    return this.request('/products/products/categories/')
  }

  async createCategory(token: string, data: any) {
    return this.request('/products/categories/', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async updateCategory(token: string, id: string, data: any) {
    return this.request(`/products/categories/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(token: string, id: string) {
    return this.request(`/products/categories/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
  }

  async getBrands() {
    return this.request('/products/products/brands/')
  }

  async getProductVariants(productId: string) {
    return this.request(`/products/products/${productId}/variants/`)
  }

  async updateVariant(token: string, variantId: string, data: any) {
    const headers: any = {}
    if (token) headers.Authorization = `Token ${token}`
    return this.request(`/products/variants/${variantId}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    })
  }

  async createVariant(token: string, data: any) {
    const headers: any = {
      Authorization: `Token ${token}`,
    }
    return this.request(`/products/variants/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  // Cart
  async getCart() {
    return this.request('/cart/')
  }

  async addToCart(data: { product_id: string; variant_id: string; quantity: number }) {
    return this.request('/cart/add_item/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCartItem(data: { product_id: string; variant_id: string; quantity: number }) {
    return this.request('/cart/update_item/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async removeFromCart(productId: string, variantId: string) {
    return this.request(`/cart/remove_item/?product_id=${productId}&variant_id=${variantId}`, {
      method: 'DELETE',
    })
  }

  async clearCart() {
    return this.request('/cart/clear/', {
      method: 'POST',
    })
  }

  // Orders
  async getOrders(token?: string) {
    const headers: any = {}
    if (token) headers.Authorization = `Token ${token}`
    return this.request('/orders/orders/', { headers })
  }

  async getOrder(id: string) {
    return this.request(`/orders/orders/${id}/`)
  }

  async createOrder(data: any) {
    return this.request('/orders/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async cancelOrder(id: string) {
    return this.request(`/orders/orders/${id}/cancel/`, {
      method: 'POST',
    })
  }

  // Users & Auth
  async sendOTP(data: { email: string; purpose?: string }) {
    return this.request('/users/send-otp/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async register(data: { email: string; password: string; otp: string; first_name?: string; last_name?: string; phone?: string }) {
    return this.request('/users/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; otp: string }) {
    return this.request('/users/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile(token: string) {
    return this.request('/users/profile/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
  }

  async updateProfile(token: string, data: any) {
    return this.request('/users/profile/', {
      method: 'PATCH',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  // Favorites
  async getFavorites(token: string) {
    return this.request('/orders/favorites/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
  }

  async addFavorite(token: string, productId: string) {
    return this.request('/orders/favorites/', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ product: productId }),
    })
  }

  async removeFavorite(token: string, id: string) {
    return this.request(`/orders/favorites/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
  }

  // Reports (Admin)
  async getSalesReports(token: string, params?: string) {
    return this.request(`/reports/sales-reports/${params || ''}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
  }

  async getDashboardSummary(token: string) {
    return this.request('/reports/sales-reports/dashboard_summary/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
  }

  async getAnalyticsOverview(token: string) {
    return this.request('/reports/analytics/overview/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
  }

  async getTopSellingProducts(token: string, periodType = 'MONTHLY', limit = 5) {
    const headers: any = {}
    if (token) headers.Authorization = `Token ${token}`
    return this.request(`/product-performance/top_sellers/?period_type=${encodeURIComponent(periodType)}&limit=${limit}`, {
      headers,
    })
  }

  async getLowSellingProducts(token: string, periodType = 'MONTHLY', limit = 10) {
    const headers: any = {}
    if (token) headers.Authorization = `Token ${token}`
    return this.request(`/product-performance/low_sellers/?period_type=${encodeURIComponent(periodType)}&limit=${limit}`, {
      headers,
    })
  }

  async getProductTrends(productId: string, years = 3, token?: string) {
    const headers: any = {}
    if (token) headers.Authorization = `Token ${token}`
    return this.request(`/product-trends/by_product/?product_id=${encodeURIComponent(productId)}&years=${years}`, {
      headers,
    })
  }

  async getProductTrendsList(token?: string) {
    const headers: any = {}
    if (token) headers.Authorization = `Token ${token}`
    return this.request(`/product-trends/`, { headers })
  }

  async getProductRelations(productId: string, limit = 5, token?: string) {
    const headers: any = {}
    if (token) headers.Authorization = `Token ${token}`
    return this.request(`/product-relations/recommendations/?product_id=${encodeURIComponent(productId)}&limit=${limit}`, {
      headers,
    })
  }

  async getProductRelationsList(token?: string) {
    const headers: any = {}
    if (token) headers.Authorization = `Token ${token}`
    return this.request(`/product-relations/`, { headers })
  }

  // Stock Management (Admin with optional token for read access)
  async getStock(token?: string) {
    const headers: any = {}
    if (token) {
      headers.Authorization = `Token ${token}`
    }
    return this.request('/inventory/stock/', { headers })
  }

  async adjustStock(token: string, stockId: string, adjustment: number, reason?: string) {
    return this.request(`/inventory/stock/${stockId}/adjust/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
      body: JSON.stringify({ adjustment, reason: reason || 'Manual adjustment' }),
    })
  }

  async updateStockThreshold(token: string, stockId: string, threshold: number) {
    return this.request(`/inventory/stock/${stockId}/`, {
      method: 'PATCH',
      headers: { Authorization: `Token ${token}` },
      body: JSON.stringify({ low_stock_threshold: threshold }),
    })
  }

  async getLowStock(token: string) {
    return this.request('/inventory/stock/low_stock/', {
      headers: { Authorization: `Token ${token}` },
    })
  }

  async getOutOfStock(token: string) {
    return this.request('/inventory/stock/out_of_stock/', {
      headers: { Authorization: `Token ${token}` },
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient

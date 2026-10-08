import axios, { AxiosInstance } from 'axios';

export class WooCommerceService {
  private client: AxiosInstance;

  constructor() {
    const url = process.env.WOOCOMMERCE_URL;
    const consumerKey = process.env.WOOCOMMERCE_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_SECRET;

    if (!url || !consumerKey || !consumerSecret) {
      console.warn("WooCommerce credentials not fully provided in environment variables.");
    }

    // Using query string for authentication as a fallback to prevent 401 Authorization header stripping issues
    this.client = axios.create({
      baseURL: `${url}/wp-json/wc/v3`,
      params: {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      }
    });
  }

  async listProducts(page = 1, perPage = 10) {
    const response = await this.client.get('/products', { params: { page, per_page: perPage } });
    return response.data;
  }

  async createProduct(name: string, type: string, regular_price: string) {
    const response = await this.client.post('/products', { name, type, regular_price });
    return response.data;
  }

  async listOrders(page = 1, perPage = 10, before?: string, after?: string) {
    const params: any = { page, per_page: perPage };
    if (before) params.before = before;
    if (after) params.after = after;
    const response = await this.client.get('/orders', { params });
    return response.data;
  }

  async getOrder(id: number) {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: number, status: string) {
    const response = await this.client.put(`/orders/${id}`, { status });
    return response.data;
  }
}

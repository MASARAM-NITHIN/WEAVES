import axios from 'axios';

// Base URL resolution:
// - Browser: NEXT_PUBLIC_API_BASE_URL (baked at build time). Falls back to
//   same-origin '/api', which the Next.js rewrites proxy to Spring Boot.
//   Same-origin works on any host (localhost, Replit, custom domain).
// - Server (SSR / route handlers): relative URLs are invalid in Node, so use
//   BACKEND_INTERNAL_URL (runtime env, direct container-to-container).
const resolveApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    const internal = (process.env.BACKEND_INTERNAL_URL || '').replace(/\/$/, '');
    if (internal) return `${internal}/api`;
    return process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
};

export const API_BASE_URL = resolveApiBaseUrl();

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Automatically Attach JWT Bearer Token if logged in
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sree_padmavathi_jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Expired Tokens and Implement Retry Logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sree_padmavathi_jwt_token');
        localStorage.removeItem('sree_padmavathi_admin_auth');
      }
    }
    
    const config = error.config;
    // Only retry GET requests on 500+ or network errors
    if (config && config.method === 'get' && (!error.response || error.response.status >= 500)) {
      config.retryCount = config.retryCount || 0;
      if (config.retryCount < 2) {
        config.retryCount += 1;
        // Exponential backoff
        const delay = new Promise((resolve) => setTimeout(resolve, config.retryCount * 1000));
        await delay;
        return apiClient(config);
      }
    }
    
    return Promise.reject(error);
  }
);

// Owner Authentication API (validated against the PostgreSQL DB via Spring Boot API)
export const loginOwnerApi = async (username, password) => {
  try {
    const res = await apiClient.post('/admin/login', { username, password });
    const apiResp = res.data;
    if (apiResp && apiResp.accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sree_padmavathi_jwt_token', apiResp.accessToken);
        localStorage.setItem('sree_padmavathi_user_role', apiResp.role || 'ROLE_ADMIN');
        localStorage.setItem('sree_padmavathi_admin_auth', 'true');
      }
      return { success: true, message: 'Login successful', data: apiResp };
    }
    return { success: false, message: 'Authentication failed' };
  } catch (err) {
    const errMsg = err.response?.data?.message || 'Invalid username or password (Failed Database Authentication)';
    return { success: false, message: errMsg };
  }
};

// Update Owner Credentials in the PostgreSQL Database
export const updateOwnerCredentialsApi = async (credentialsData) => {
  const res = await apiClient.put('/admin/users/credentials', credentialsData);
  const apiResp = res.data;
  if (apiResp && apiResp.success && apiResp.data) {
    if (typeof window !== 'undefined' && apiResp.data.token) {
      localStorage.setItem('sree_padmavathi_jwt_token', apiResp.data.token);
    }
  }
  return apiResp;
};

// Spring Boot stateless JWT doesn't need /auth/me for admin unless implemented. We'll leave it as a mock or use an admin route if needed.
export const fetchCurrentUserApi = async () => {
  // Mocked for now, rely on local storage JWT
  return { success: true };
};

// Products Catalog API
export const fetchProductsApi = async (params = {}) => {
  const res = await apiClient.get('/sarees', { params });
  return res.data;
};

export const fetchProductByIdApi = async (id) => {
  const res = await apiClient.get(`/sarees/${id}`);
  return res.data;
};

export const createProductApi = async (productData) => {
  const res = await apiClient.post('/admin/sarees', productData);
  return res.data;
};

export const updateProductApi = async (id, productData) => {
  const res = await apiClient.put(`/admin/sarees/${id}`, productData);
  return res.data;
};

export const deleteProductApi = async (id) => {
  const res = await apiClient.delete(`/admin/sarees/${id}`);
  return res.data;
};

// File Upload to local storage via Spring Boot API
export const uploadBase64ImageApi = async (base64Data) => {
  const res = await apiClient.post('/upload/base64', { base64Data });
  return res.data;
};

export const uploadSingleFileApi = async (file, type, id) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Route ALL uploads through our foolproof Next.js upload proxy to bypass Java/Env issues
  const response = await fetch('/api/admin-upload', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Direct upload failed');
  }
  
  const data = await response.json();
  return data;
};

// Categories API -> Fabric Types
export const fetchCategoriesApi = async () => {
  const res = await apiClient.get('/fabric-types');
  return res.data;
};

export const createCategoryApi = async (data) => {
  const res = await apiClient.post('/admin/fabric-types', data);
  return res.data;
};

export const updateCategoryApi = async (id, data) => {
  const res = await apiClient.put(`/admin/fabric-types/${id}`, data);
  return res.data;
};

export const deleteCategoryApi = async (id) => {
  const res = await apiClient.delete(`/admin/fabric-types/${id}`);
  return res.data;
};

// Theme Collections API
export const fetchCollectionsApi = async () => {
  const res = await apiClient.get('/collections');
  return res.data;
};

export const createCollectionApi = async (data) => {
  const res = await apiClient.post('/admin/collections', data);
  return res.data;
};

export const updateCollectionApi = async (id, data) => {
  const res = await apiClient.put(`/admin/collections/${id}`, data);
  return res.data;
};

export const deleteCollectionApi = async (id) => {
  const res = await apiClient.delete(`/admin/collections/${id}`);
  return res.data;
};

// ============ Product Reviews ============
export const createReviewApi = async (data) => {
  const res = await apiClient.post(`/reviews`, data);
  return res.data;
};

export const fetchProductReviewsApi = async (sareeId) => {
  const res = await apiClient.get(`/reviews/saree/${sareeId}`);
  return res.data;
};

export const fetchAllReviewsApi = async () => {
  const res = await apiClient.get('/reviews/all');
  return res.data;
};

export const markReviewHelpfulApi = async (id) => {
  const res = await apiClient.put(`/reviews/${id}/helpful`);
  return res.data;
};

// Orders API
export const fetchAdminProductsApi = async () => {
  const res = await apiClient.get('/sarees', { params: { size: 1000 } });
  return res.data;
};

export const fetchAdminOrdersApi = async (page = 0, size = 50) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sree_padmavathi_jwt_token');
    const baseUrl = API_BASE_URL;
    
    // Use native fetch to bypass any Axios interceptor/connection pool bottlenecks
    const response = await fetch(`${baseUrl}/admin/orders?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }
  return [];
};

export const lookupOrderApi = async (orderCode, phone) => {
  const res = await apiClient.get('/orders/lookup', { params: { orderCode, phone } });
  return res.data;
};

export const lookupOrderHistoryApi = async (phone) => {
  const res = await apiClient.get('/orders/history', { params: { phone } });
  return res.data;
};

export const createOrderApi = async (orderData) => {
  const res = await apiClient.post('/orders', orderData);
  return res.data;
};

export const uploadPaymentProofApi = async (orderCode, phone, utrNumber, file) => {
  const formData = new FormData();
  formData.append('phone', phone);
  formData.append('utrNumber', utrNumber);
  formData.append('file', file);

  const res = await apiClient.post(`/orders/${orderCode}/payment-proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateOrderStatusApi = async (id, status) => {
  const res = await apiClient.put(`/admin/orders/${id}/status`, null, {
    params: { status }
  });
  return res.data;
};

export const updateVerificationStatusApi = async (id, status) => {
  const res = await apiClient.put(`/admin/orders/${id}/verification-status`, null, {
    params: { status }
  });
  return res.data;
};

// ============ Customer Registration ============
export const registerCustomerApi = async (userData) => {
  const res = await apiClient.post('/auth/register', userData);
  return res.data;
};

// ============ Customer Profile ============
export const fetchCustomerProfileApi = async () => {
  const res = await apiClient.get('/customer/profile');
  return res.data;
};

export const updateCustomerProfileApi = async (profileData) => {
  const res = await apiClient.put('/customer/profile', profileData);
  return res.data;
};

// ============ Customer Cart ============
export const fetchCartApi = async () => {
  const res = await apiClient.get('/customer/cart');
  return res.data;
};

export const addToCartApi = async (cartItem) => {
  const res = await apiClient.post('/customer/cart', cartItem);
  return res.data;
};

export const updateCartItemApi = async (cartId, quantity) => {
  const res = await apiClient.put(`/customer/cart/${cartId}`, { quantity });
  return res.data;
};

export const removeFromCartApi = async (cartId) => {
  const res = await apiClient.delete(`/customer/cart/${cartId}`);
  return res.data;
};

export const clearCartApi = async () => {
  const res = await apiClient.delete('/customer/cart');
  return res.data;
};

// ============ Customer Wishlist ============
export const fetchWishlistApi = async () => {
  const res = await apiClient.get('/customer/wishlist');
  return res.data;
};

export const addToWishlistApi = async (productId) => {
  const res = await apiClient.post('/customer/wishlist', { productId });
  return res.data;
};

export const removeFromWishlistApi = async (productId) => {
  const res = await apiClient.delete(`/customer/wishlist/${productId}`);
  return res.data;
};

export const checkWishlistApi = async (productId) => {
  const res = await apiClient.get(`/customer/wishlist/check/${productId}`);
  return res.data;
};

// ============ Customer Addresses ============
export const fetchAddressesApi = async () => {
  const res = await apiClient.get('/customer/addresses');
  return res.data;
};

export const addAddressApi = async (addressData) => {
  const res = await apiClient.post('/customer/addresses', addressData);
  return res.data;
};

export const updateAddressApi = async (addressId, addressData) => {
  const res = await apiClient.put(`/customer/addresses/${addressId}`, addressData);
  return res.data;
};

export const deleteAddressApi = async (addressId) => {
  const res = await apiClient.delete(`/customer/addresses/${addressId}`);
  return res.data;
};

export const setDefaultAddressApi = async (addressId) => {
  const res = await apiClient.put(`/customer/addresses/${addressId}/default`);
  return res.data;
};

// ============ Users Management ============
export const fetchAllUsersApi = async () => {
  const res = await apiClient.get('/admin/users');
  return res.data;
};

export const updateUserStatusApi = async (id, status, role) => {
  const res = await apiClient.put(`/admin/users/${id}/status`, null, {
    params: { status, role }
  });
  return res.data;
};

// ============ Customer Enquiries ============
export const createEnquiryApi = async (data) => {
  const res = await apiClient.post('/public/enquiries', data);
  return res.data;
};

export const fetchAdminEnquiriesApi = async () => {
  const res = await apiClient.get('/admin/enquiries');
  return res.data;
};

export const updateEnquiryStatusApi = async (id, status) => {
  const res = await apiClient.put(`/admin/enquiries/${id}/status`, null, {
    params: { status }
  });
  return res.data;
};

export const deleteEnquiryApi = async (id) => {
  const res = await apiClient.delete(`/admin/enquiries/${id}`);
  return res.data;
};

// ============ Admin User Management ============
export const deleteUserApi = async (userId) => {
  const res = await apiClient.delete(`/admin/users/${userId}`);
  return res.data;
};


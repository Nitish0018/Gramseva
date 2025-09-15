import api from './backendService';

// Admin API interfaces
export interface AdminStats {
  totalUsers: number;
  totalServices: number;
  totalTransactions: number;
  totalRevenue: number;
  activeUsers: number;
  pendingServices: number;
  newRegistrations: number;
  systemAlerts: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  status: 'active' | 'suspended' | 'pending';
  kycVerified: boolean;
  totalTransactions: number;
}

export interface AdminService {
  id: string;
  title: string;
  provider: string;
  category: string;
  price: number;
  status: 'active' | 'pending' | 'rejected' | 'suspended';
  bookings: number;
  rating: number;
  createdDate: string;
}

export interface AdminTransaction {
  id: string;
  user: string;
  service: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  paymentMethod: string;
}

// Admin API endpoints
export const adminApi = {
  // Get admin dashboard stats
  getStats: async (): Promise<{ success: boolean; data?: AdminStats; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock data for development
        const mockStats: AdminStats = {
          totalUsers: 12547,
          totalServices: 2834,
          totalTransactions: 45623,
          totalRevenue: 2847539,
          activeUsers: 8934,
          pendingServices: 127,
          newRegistrations: 234,
          systemAlerts: 5
        };
        return { success: true, data: mockStats };
      }
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch admin stats' };
    }
  },

  // Get users list
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data?: AdminUser[]; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock users data
        const mockUsers: AdminUser[] = [
          {
            id: '1',
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@email.com',
            phone: '+91 98765 43210',
            location: 'Punjab, India',
            joinDate: '2024-01-15',
            status: 'active',
            kycVerified: true,
            totalTransactions: 45
          },
          {
            id: '2',
            name: 'Priya Sharma',
            email: 'priya.sharma@email.com',
            phone: '+91 87654 32109',
            location: 'Haryana, India',
            joinDate: '2024-02-20',
            status: 'pending',
            kycVerified: false,
            totalTransactions: 12
          },
          {
            id: '3',
            name: 'Amit Singh',
            email: 'amit.singh@email.com',
            phone: '+91 76543 21098',
            location: 'Uttar Pradesh, India',
            joinDate: '2024-03-10',
            status: 'active',
            kycVerified: true,
            totalTransactions: 78
          }
        ];
        return { success: true, data: mockUsers };
      }
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch users' };
    }
  },

  // Get services list
  getServices: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{ success: boolean; data?: AdminService[]; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock services data
        const mockServices: AdminService[] = [
          {
            id: '1',
            title: 'Tractor Rental Service',
            provider: 'Rajesh Kumar',
            category: 'Equipment',
            price: 1200,
            status: 'active',
            bookings: 145,
            rating: 4.8,
            createdDate: '2024-01-10'
          },
          {
            id: '2',
            title: 'Crop Advisory',
            provider: 'Dr. Amit Singh',
            category: 'Advisory',
            price: 500,
            status: 'pending',
            bookings: 23,
            rating: 4.5,
            createdDate: '2024-03-05'
          },
          {
            id: '3',
            title: 'Seed Supply',
            provider: 'Krishna Seeds',
            category: 'Seeds',
            price: 2500,
            status: 'active',
            bookings: 89,
            rating: 4.6,
            createdDate: '2024-02-15'
          }
        ];
        return { success: true, data: mockServices };
      }
      const response = await api.get('/admin/services', { params });
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch services' };
    }
  },

  // Get transactions list
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ success: boolean; data?: AdminTransaction[]; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock transactions data
        const mockTransactions: AdminTransaction[] = [
          {
            id: '1',
            user: 'Rajesh Kumar',
            service: 'Tractor Rental',
            amount: 1200,
            status: 'completed',
            date: '2024-03-08',
            paymentMethod: 'UPI'
          },
          {
            id: '2',
            user: 'Priya Sharma',
            service: 'Seed Supply',
            amount: 2500,
            status: 'pending',
            date: '2024-03-09',
            paymentMethod: 'Bank Transfer'
          },
          {
            id: '3',
            user: 'Amit Singh',
            service: 'Crop Advisory',
            amount: 500,
            status: 'completed',
            date: '2024-03-07',
            paymentMethod: 'UPI'
          }
        ];
        return { success: true, data: mockTransactions };
      }
      const response = await api.get('/admin/transactions', { params });
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch transactions' };
    }
  },

  // Update user status
  updateUserStatus: async (userId: string, status: 'active' | 'suspended' | 'pending'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock update
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
      }
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to update user status' };
    }
  },

  // Update service status
  updateServiceStatus: async (serviceId: string, status: 'active' | 'pending' | 'rejected' | 'suspended'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock update
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
      }
      const response = await api.put(`/admin/services/${serviceId}/status`, { status });
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to update service status' };
    }
  },

  // Delete user
  deleteUser: async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock delete
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
      }
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to delete user' };
    }
  },

  // Delete service
  deleteService: async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock delete
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
      }
      const response = await api.delete(`/admin/services/${serviceId}`);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Failed to delete service' };
    }
  },

  // Admin authentication
  login: async (credentials: { username: string; password: string }): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock admin login
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (credentials.username === 'admin' && credentials.password === 'gramseva123') {
          return { success: true, token: 'mock-admin-token' };
        } else {
          return { success: false, error: 'Invalid credentials' };
        }
      }
      const response = await api.post('/admin/login', credentials);
      return response.data;
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('adminToken');
  }
};

export default adminApi;

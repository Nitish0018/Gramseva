import React, { useState, useEffect } from 'react';
import { adminApi, type AdminStats, type AdminUser, type AdminService, type AdminTransaction } from '../services/adminService';
import { 
  BarChartIcon,
  UsersIcon,
  PackageIcon,
  MessageSquareIcon,
  CurrencyIcon,
  TrendingUpIcon,
  AlertIcon,
  SettingsIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshIcon,
  BellIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon
} from './icons';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'services' | 'transactions' | 'analytics' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Load all admin data in parallel
      const [statsResponse, usersResponse, servicesResponse, transactionsResponse] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ limit: 50 }),
        adminApi.getServices({ limit: 50 }),
        adminApi.getTransactions({ limit: 50 })
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data);
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
  }> = ({ title, value, icon, trend, color }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-textSecondary">{title}</p>
          <p className="text-2xl font-bold text-textPrimary">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${
              trend > 0 ? 'text-success' : 'text-error'
            }`}>
              <TrendingUpIcon className="h-3 w-3" />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }> = ({ label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary text-white shadow-md'
          : 'text-textSecondary hover:text-primary hover:bg-primary/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('totalUsers')}
          value={stats?.totalUsers.toLocaleString() || '0'}
          icon={<UsersIcon className="h-6 w-6 text-primary" />}
          trend={12.5}
          color="bg-primary/10"
        />
        <StatCard
          title={t('activeServices')}
          value={stats?.totalServices || 0}
          icon={<PackageIcon className="h-6 w-6 text-info" />}
          trend={8.3}
          color="bg-info/10"
        />
        <StatCard
          title={t('totalRevenue')}
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={<CurrencyIcon className="h-6 w-6 text-success" />}
          trend={15.7}
          color="bg-success/10"
        />
        <StatCard
          title={t('systemAlerts')}
          value={stats?.systemAlerts || 0}
          icon={<AlertIcon className="h-6 w-6 text-warning" />}
          color="bg-warning/10"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{t('recentRegistrations')}</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-textPrimary">{user.name}</p>
                  <p className="text-xs text-textSecondary">{user.location}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  user.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {user.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Services */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{t('pendingApprovals')}</h3>
          <div className="space-y-3">
            {services.filter(s => s.status === 'pending').slice(0, 5).map(service => (
              <div key={service.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <PackageIcon className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-textPrimary">{service.title}</p>
                  <p className="text-xs text-textSecondary">by {service.provider}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors">
                    <ShieldCheckIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t('searchUsers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textSecondary" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4">Contact</th>
              <th className="text-left py-3 px-4">Location</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">KYC</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-textPrimary">{user.name}</p>
                    <p className="text-sm text-textSecondary">ID: {user.id}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm">{user.email}</p>
                    <p className="text-sm text-textSecondary">{user.phone}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{user.location}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' ? 'bg-success/10 text-success' :
                    user.status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-error/10 text-error'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.kycVerified ? 'bg-success/10 text-success' : 'bg-gray/10 text-gray'
                  }`}>
                    {user.kycVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-info hover:bg-info/10 rounded transition-colors">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-primary hover:bg-primary/10 rounded transition-colors">
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-error hover:bg-error/10 rounded transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchServices')}
              className="input pl-10 w-64"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textSecondary" />
          </div>
          <select className="px-4 py-2 border border-border rounded-lg">
            <option value="all">{t('allCategories')}</option>
            <option value="equipment">{t('equipment')}</option>
            <option value="advisory">{t('advisory')}</option>
            <option value="transport">{t('transport')}</option>
          </select>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          {t('addService')}
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <div key={service.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div className={`px-2 py-1 rounded-full text-xs ${
                service.status === 'active' ? 'bg-success/10 text-success' :
                service.status === 'pending' ? 'bg-warning/10 text-warning' :
                'bg-error/10 text-error'
              }`}>
                {service.status}
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-info hover:bg-info/10 rounded transition-colors">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-primary hover:bg-primary/10 rounded transition-colors">
                  <EditIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-textPrimary mb-2">{service.title}</h3>
            <p className="text-sm text-textSecondary mb-2">by {service.provider}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-primary">₹{service.price}</span>
              <span className="text-sm text-textSecondary">{service.bookings} {t('bookings')}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-textSecondary">
              <span>Rating: {service.rating}/5</span>
              <span>{service.createdDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gradient">{t('gramsevaAdmin')}</h1>
              <p className="text-textSecondary">{t('agriculturalPlatformManagement')}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-textSecondary hover:text-primary transition-colors">
                <BellIcon className="h-6 w-6" />
                {stats?.systemAlerts && stats.systemAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.systemAlerts}
                  </span>
                )}
              </button>
              <button className="p-2 text-textSecondary hover:text-primary transition-colors">
                <SettingsIcon className="h-6 w-6" />
              </button>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="btn btn-secondary text-sm"
                >
                  {t('logout')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
          <TabButton
            id="overview"
            label={t('overview')}
            icon={<BarChartIcon className="h-4 w-4" />}
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            id="users"
            label={t('users')}
            icon={<UsersIcon className="h-4 w-4" />}
            isActive={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <TabButton
            id="services"
            label={t('services')}
            icon={<PackageIcon className="h-4 w-4" />}
            isActive={activeTab === 'services'}
            onClick={() => setActiveTab('services')}
          />
          <TabButton
            id="transactions"
            label={t('transactions')}
            icon={<CurrencyIcon className="h-4 w-4" />}
            isActive={activeTab === 'transactions'}
            onClick={() => setActiveTab('transactions')}
          />
          <TabButton
            id="analytics"
            label={t('analytics')}
            icon={<TrendingUpIcon className="h-4 w-4" />}
            isActive={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <TabButton
            id="settings"
            label={t('settings')}
            icon={<SettingsIcon className="h-4 w-4" />}
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'transactions' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{t('transactionManagement')}</h2>
            <p className="text-textSecondary">{t('transactionManagementComingSoon')}</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{t('analyticsDashboard')}</h2>
            <p className="text-textSecondary">{t('analyticsComingSoon')}</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{t('systemSettings')}</h2>
            <p className="text-textSecondary">{t('settingsComingSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

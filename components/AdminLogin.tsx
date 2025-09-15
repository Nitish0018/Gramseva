import React, { useState } from 'react';
import { ShieldCheckIcon, EyeIcon, CloseIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';
import { adminApi } from '../services/adminService';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminLoginProps {
  onLogin: (credentials: { username: string; password: string }) => void;
  isLoading: boolean;
  error?: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, isLoading, error }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin({ username: username.trim(), password: password.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin Login Card */}
        <div className="card">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">{t('adminAccess')}</h1>
            <p className="text-textSecondary mt-2">{t('signInToAdmin')}</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-textPrimary mb-2">
                {t('username')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder={t('enterAdminUsername')}
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder={t('enterAdminPassword')}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <CloseIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>{t('signingIn')}</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>{t('signIn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
            <h3 className="font-semibold text-info mb-2">{t('demoCredentials')}</h3>
            <div className="text-sm text-textSecondary space-y-1">
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> gramseva123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-textSecondary">
              {t('gramsevaAdminPanel')}
            </p>
            <p className="text-xs text-textSecondary mt-1">
              {t('secureAccess')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

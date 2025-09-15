export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        primaryDark: '#059669',
        secondary: '#F59E0B',
        accent: '#8B5CF6',
        background: '#F8FAFC',
        backgroundDark: '#F1F5F9',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.2)'
      }
    },
  },
  plugins: [],
}

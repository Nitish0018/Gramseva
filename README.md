# Gramseva

<div align="center">
  <h3>AI-Powered Agricultural Platform</h3>
  <p>Empowering farmers with real-time market prices, service marketplace, crop advisory, and multilingual support</p>
</div>

## 🌾 Features

- **Real-Time Market Dashboard**: Live agricultural commodity prices with trend analysis
- **Service Marketplace**: Connect with equipment, labor, and agricultural service providers
- **AI Crop Advisory**: Analyze crop health using image recognition powered by Google Gemini AI
- **Chat Assistant**: Get instant answers to farming queries
- **Multilingual Support**: Available in English, Hindi, and Gujarati
- **Admin Dashboard**: Manage users, services, and market data

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nitish0018/Gramseva.git
   cd Gramseva
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   **To get your Gemini API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy and paste the key into your `.env` file

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

5. **Optional: Start the chat server** (for real-time chat features)
   ```bash
   npm run chat-server
   ```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API

## 📱 Usage

### User Features
1. **Market Dashboard**: View real-time prices and price trends for agricultural commodities
2. **Services**: Browse and book agricultural services
3. **Advisory**: Upload crop images for AI-powered health analysis
4. **Chat**: Get instant assistance from the AI chatbot
5. **Profile**: Manage your farmer profile and preferences

### Admin Features
Access the admin panel by navigating to `/#admin` or through the settings menu.

Default credentials (for development):
- Username: `admin`
- Password: `admin123`

## 🌐 Language Support

The application supports three languages:
- English
- हिंदी (Hindi)
- ગુજરાતી (Gujarati)

Change language from the settings menu or header.

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Notes

- The application uses mock data for demonstration purposes when the backend is not available
- Real-time features require the WebSocket server to be running
- AI features require a valid Gemini API key

## 📧 Contact

For questions or support, please open an issue on GitHub.


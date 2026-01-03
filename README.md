# 🧬 nodeFit AI

> **Privacy-First Health Intelligence Engine** — An AI-powered personal health dashboard that analyzes your lifestyle, wearable data, and environmental context to deliver personalized health insights.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?logo=vite)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285f4?logo=google)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [AI Models](#-ai-models)
- [Data Flow](#-data-flow)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)

---

## 🎯 Overview

**nodeFit AI** is a privacy-first health intelligence platform that runs entirely in your browser. Unlike traditional health apps that store your data on remote servers, nodeFit AI keeps all your sensitive health information locally using IndexedDB, ensuring complete data privacy.

### 🔐 Privacy Promise
- **Zero Cloud Storage** — All data stored locally in your browser
- **No Account Sync** — Your health data never leaves your device
- **Transparent AI** — Gemini API calls are direct, no middle server

---

## ✨ Key Features

| Feature | Description | Technology |
|---------|-------------|------------|
| 🧠 **AI Health Summary** | Personalized daily health insights and score | Gemini 2.5 Flash |
| 📸 **Food Scanner** | Photograph meals for instant calorie & nutrition analysis | Gemini Vision |
| 🌡️ **Weather + AQI** | Real-time environmental health advice | Open-Meteo API |
| 📊 **Health Metrics** | Track steps, sleep, heart rate, water intake | IndexedDB |
| 🎯 **Smart Tasks** | AI-generated daily health tasks based on your profile | Gemini 2.5 Flash |
| 🔥 **Streak System** | Gamified daily check-in with badges | Local Storage |
| 🌙 **Cycle Tracker** | Menstrual cycle logging and predictions | IndexedDB |
| 🎨 **Theme Toggle** | Google Material Design 3 dark/light themes | CSS Variables |

---

## 🛠️ Tech Stack

### Frontend Framework
```
┌─────────────────────────────────────────────────────────┐
│  React 18          │  Component-based UI architecture   │
│  Vite 7            │  Lightning-fast dev server & build │
│  React Router 7    │  Client-side SPA routing           │
└─────────────────────────────────────────────────────────┘
```

### AI & APIs
```
┌─────────────────────────────────────────────────────────┐
│  Gemini 2.5 Flash  │  Text generation, health insights  │
│  Gemini Vision     │  Food image analysis               │
│  Open-Meteo        │  Weather & Air Quality Index       │
│  Geolocation API   │  Browser location for weather      │
└─────────────────────────────────────────────────────────┘
```

### Data Layer
```
┌─────────────────────────────────────────────────────────┐
│  IndexedDB         │  Structured data (via Dexie.js)    │
│  LocalStorage      │  Session & theme preferences       │
│  No Cloud DB       │  100% local, privacy-first         │
└─────────────────────────────────────────────────────────┘
```

### Styling
```
┌─────────────────────────────────────────────────────────┐
│  CSS Variables     │  Dynamic theming system            │
│  Google Material 3 │  Color palette & design language   │
│  Google Sans       │  Primary typography                │
│  Lucide Icons      │  Consistent icon library           │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                         │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Landing │  │  Auth    │  │ Onboarding│  │Dashboard│  │ Scanner │ │
│  │  Page   │  │ (Login)  │  │  Wizard   │  │  (Main) │  │  (Food) │ │
│  └────┬────┘  └────┬─────┘  └─────┬─────┘  └────┬────┘  └────┬────┘ │
│       └────────────┴──────────────┴─────────────┴────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   AuthContext   │  │  ThemeContext   │  │   React Router      │  │
│  │  (User State)   │  │  (Dark/Light)   │  │   (Navigation)      │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
└───────────┴─────────────────────┴────────────────────┬──────────────┘
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    ▼                                       ▼
┌─────────────────────────────────────────────┐   ┌──────────────────────────────────┐
│              SERVICE LAYER                   │   │           EXTERNAL APIs          │
│  ┌────────────────┐  ┌────────────────────┐ │   │  ┌────────────────────────────┐  │
│  │ geminiService  │  │  locationService   │ │   │  │    Google Gemini API       │  │
│  │ (AI Requests)  │  │  (Weather/AQI)     │ │   │  │    (gemini-2.5-flash)      │  │
│  └────────┬───────┘  └─────────┬──────────┘ │   │  └────────────────────────────┘  │
│           │                    │            │   │  ┌────────────────────────────┐  │
│           ▼                    ▼            │   │  │    Open-Meteo API          │  │
│  ┌─────────────────────────────────────────┐│   │  │    (Weather + AQI)         │  │
│  │            storageService               ││   │  └────────────────────────────┘  │
│  │    (LocalStorage + IndexedDB proxy)     ││   └──────────────────────────────────┘
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      Dexie.js (IndexedDB)                       ││
│  │  ┌─────────┐ ┌──────────┐ ┌───────┐ ┌───────┐ ┌──────────────┐ ││
│  │  │  users  │ │ profiles │ │ meals │ │ tasks │ │   streaks    │ ││
│  │  │ (auth)  │ │ (health) │ │(food) │ │ (AI)  │ │   badges     │ ││
│  │  └─────────┘ └──────────┘ └───────┘ └───────┘ └──────────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Models

### Gemini 2.5 Flash
The application uses **Google's Gemini 2.5 Flash** model for all AI features:

| Use Case | Input | Output |
|----------|-------|--------|
| **Health Summary** | User profile, metrics, weather, AQI | JSON with summary, score, insights, do's/don'ts |
| **Food Analysis** | Food photo (base64) + user goal | JSON with calories, ingredients, health score |
| **Task Generation** | User profile + habits | JSON array of personalized daily tasks |

### Prompt Engineering
All prompts are designed to return **structured JSON** for reliable parsing:
```javascript
// Example prompt structure
const prompt = `
USER PROFILE: [age, gender, goal, habits...]
CURRENT DATA: [metrics, weather, AQI...]
Return ONLY valid JSON: { "summary": "...", "insights": [...] }
`;
```

---

## 🔄 Data Flow

### 1. User Registration Flow
```
Sign Up → Onboarding (5 steps) → Profile Saved → Dashboard
   │           │
   │           ├── Step 1: Basic Info (name, gender, age)
   │           ├── Step 2: Body Metrics (height, weight)
   │           ├── Step 3: Lifestyle (diet, water, caffeine, screen time)
   │           ├── Step 4: Health Data (activity, sleep, steps, heart rate)
   │           └── Step 5: Goals & Habits (goal, alcohol, smoking, substances)
   │
   └── User stored in IndexedDB → Profile stored in IndexedDB
```

### 2. Dashboard Data Flow
```
Dashboard Mount
      │
      ├─► Fetch Weather + AQI (Open-Meteo API)
      │         └─► Display environmental card with health advice
      │
      ├─► Load Profile from IndexedDB
      │         └─► Populate metrics (steps, sleep, heart rate)
      │
      └─► Generate AI Summary (Gemini API)
                └─► Display summary card, insights, do's/don'ts
```

### 3. Food Scanner Flow
```
Camera/Upload → Capture Image
      │
      └─► Convert to Base64
              │
              └─► Send to Gemini Vision API
                      │
                      ├─► Analyze: foodName, calories, ingredients
                      ├─► Check goal alignment
                      └─► Return JSON
                              │
                              └─► Save to IndexedDB (meals table)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nodefit-ai.git
cd nodefit-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Gemini API key to .env
VITE_GEMINI_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
nodefit-ai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AppShell.jsx     # Main layout with sidebar
│   │   ├── ThemeToggle.jsx  # Dark/light mode switch
│   │   ├── BadgeGrid.jsx    # Achievement badges display
│   │   └── StreakCounter.jsx# Daily streak animation
│   │
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx  # User authentication state
│   │   └── ThemeContext.jsx # Theme preference state
│   │
│   ├── lib/                 # Database & utilities
│   │   └── db.js            # Dexie.js database schema
│   │
│   ├── pages/               # Route components
│   │   ├── Landing.jsx      # Public landing page
│   │   ├── Signin.jsx       # Login form
│   │   ├── Signup.jsx       # Registration form
│   │   ├── Onboarding.jsx   # 5-step profile wizard
│   │   ├── Dashboard.jsx    # Main dashboard with AI
│   │   ├── FoodCamera.jsx   # Food scanner with camera
│   │   ├── FoodHistory.jsx  # Scanned meals history
│   │   ├── TasksPage.jsx    # AI-generated tasks
│   │   ├── CycleTracker.jsx # Menstrual cycle tracker
│   │   └── SettingsPage.jsx # Profile & preferences
│   │
│   ├── utils/               # Service modules
│   │   ├── geminiService.js # Gemini API wrapper
│   │   ├── locationService.js# Geolocation + weather
│   │   └── storageService.js # Storage utilities
│   │
│   ├── App.jsx              # Root component with routing
│   └── index.css            # Global styles + themes
│
├── .env                     # Environment variables
├── vercel.json              # Vercel deployment config
└── package.json             # Dependencies
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |

```bash
# .env file
VITE_GEMINI_API_KEY=AIza...your_key_here
```

---

## ☁️ Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 📊 Database Schema

```javascript
// Dexie.js Schema (lib/db.js)
{
  users: '++id, email',           // Authentication
  profiles: '++id, userId',       // Health profiles
  meals: '++id, profileId',       // Scanned foods
  tasks: '++id, profileId',       // AI-generated tasks
  streaks: '++id, &profileId',    // Daily check-ins
  badges: '++id, [profileId+badgeType]', // Achievements
  reports: '++id, profileId',     // Health reports
  cycles: '++id, profileId'       // Menstrual data
}
```

---

## 🎨 Design System

### Color Palette (Google Material Design 3)

| Token | Dark Theme | Light Theme |
|-------|------------|-------------|
| `--accent` | `#8ab4f8` (Google Blue) | `#1a73e8` |
| `--success` | `#81c995` | `#1e8e3e` |
| `--warning` | `#fdd663` | `#f9ab00` |
| `--error` | `#f28b82` | `#d93025` |

### Typography
- **Primary**: Google Sans
- **Fallback**: Inter, system fonts

---

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px (single column, hamburger menu)
- **Tablet**: 768px - 1024px (collapsible sidebar)
- **Desktop**: > 1024px (full sidebar)

---

## 🙏 Credits

- **AI**: [Google Gemini](https://ai.google.dev/)
- **Weather**: [Open-Meteo](https://open-meteo.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [Dexie.js](https://dexie.org/)
- **Design**: Google Material Design 3

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

<p align="center">
  Built with 💚 using React + Gemini AI
</p>

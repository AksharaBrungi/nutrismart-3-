# 🥗 NutriSmart - AI Powered Nutrition Analyzer

NutriSmart is an AI-powered nutrition analysis application that helps users identify food items, analyze nutritional values, track daily intake, and receive healthy recommendations using Google Gemini AI.

## 🚀 Features

- 🍎 AI-based food detection and recognition
- 📊 Detailed macro-nutritional analysis
  - Calories
  - Proteins
  - Carbohydrates
  - Fats
- 🎯 Daily nutrition tracking
- 📈 Dashboard analytics and progress monitoring
- 👤 User profile management
- 🔍 Reverse food search
- ✍️ Manual food entry option
- 💡 Healthy food recommendations
- 📷 Camera-based food scanning
- 🔐 User authentication and session management

---

## 🛠️ Technologies Used

### Frontend
- React.js
- TypeScript
- Vite
- HTML5
- CSS3

### Backend
- Node.js
- Express.js

### Database
- SQLite3

### AI Integration
- Google Gemini AI API

### Additional Libraries
- Recharts
- JWT Authentication
- bcryptjs
- Express Session

---

## 📂 Project Structure

```
NutriSmart/
│
├── components/
│   ├── DashboardAnalytics
│   ├── MacroTracker
│   ├── ProfileSettings
│   ├── DetectionOverlay
│   └── Authentication
│
├── lib/
│   └── imageUtils
│
├── App.tsx
├── server.ts
├── api.ts
├── geminiService.ts
└── package.json
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone <repository-url>
cd nutrismart
```

### Install dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file and add:

```env
GEMINI_API_KEY=your_api_key_here
```

### Run the application

```bash
npm run dev
```

The application will start on:

```bash
http://localhost:5173
```

---

## 🎯 How It Works

1. User uploads or scans food using camera.
2. Gemini AI detects food items.
3. Nutritional information is generated.
4. Daily intake is tracked and visualized.
5. Personalized health insights are provided.

---

## 🔮 Future Enhancements

- Meal planning system
- Barcode scanner integration
- Wearable device integration
- Mobile application support
- AI-based diet recommendations

---

## 👩‍💻 Developed By

**Akshara Brungi**

B.Tech CSE (AI & ML)

Passionate about AI, UI/UX Design, and Full Stack Development.

---

## 📜 License

This project is developed for educational and research purposes.

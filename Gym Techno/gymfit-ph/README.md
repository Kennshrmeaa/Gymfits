# GymFit PH 🏋️

**#1 Filipino Fitness Web App** — Personalized workout plans, nutrition tracking, BMI analytics, and AI coaching.

## 📁 Project Structure

```
gymfit-ph/
├── index.html          ← Main HTML (landing page + dashboard)
├── README.md           ← This file
├── css/
│   └── styles.css      ← All styles (layout, nav, components, dashboard)
└── js/
    ├── data.js         ← localStorage state, session management, toast
    ├── auth.js         ← Login, signup, logout, subscription modals
    ├── nav.js          ← Page routing (landing ↔ dashboard), mobile menus
    ├── bmi.js          ← BMI calculator, live preview, persistent save
    ├── workout.js      ← 3-level programs, weight recommendations, rest timer
    ├── nutrition.js    ← 55+ Filipino foods, meal logging, macro tracking
    ├── progress.js     ← BMI history charts, weight log, achievements
    ├── dashboard.js    ← Dashboard render, panel switcher, settings, streak
    ├── ai.js           ← AI coaching system, coach chat (Anthropic API)
    └── app.js          ← Entry point (DOMContentLoaded init)
```

## 🚀 How to Run

Just open `index.html` in any modern browser — no build step needed.

```bash
# Option 1: Direct open
open index.html

# Option 2: Local server (recommended to avoid CORS)
npx serve .
# or
python3 -m http.server 3000
```

Then visit `http://localhost:3000`

## ✨ Features

| Feature | Free | Premium (₱99/mo) |
|---------|------|-----------------|
| BMI Calculator & Tracker | ✅ | ✅ |
| Day 1–2 Workouts | ✅ | ✅ |
| AI Coach (3/day) | ✅ | Unlimited |
| Sample Meal Plan | ✅ | ✅ |
| Full 3-Level Programs | ❌ | ✅ |
| Custom Nutrition Plans | ❌ | ✅ |
| Online Coach Chat | ❌ | ✅ |
| Progress Tracking | ❌ | ✅ |
| Supplement Guide | ❌ | ✅ |

## 💪 Workout Programs

Three programs based on **Experience Level** (set during signup or in Settings):

- **Beginner** — 3 days/week, foundational movements, longer rest, form focus
- **Intermediate** — 4 days/week, push/pull split, higher volume, 4 sets
- **Advanced** — 5 days/week, 85–90% 1RM, 5×5 strength work

Each exercise shows a **personalised recommended weight** based on:
- Your bodyweight (from BMI Tracker)
- Your BMI category (overweight/obese = reduced lower-body weights)
- Your experience level (beginner ×1.0 → intermediate ×1.35 → advanced ×1.7)

## 🤖 AI Coaching

Powered by **Claude claude-sonnet-4-20250514** via the Anthropic API.

- **Landing AI**: 3 questions/day for free users, conversation history maintained
- **Dashboard AI**: Personalised with user's name, goal, BMI, weight, streak
- **Coach Chat**: 3 AI coaches (Marcus/Alyssa/Rico), each with unique persona and user context

> **Note**: The AI uses `anthropic-dangerous-direct-browser-access: true` header for direct browser API calls. In production, proxy API calls through a backend to keep your API key secure.

## 🥗 Nutrition

- 55+ Filipino foods with calories and macros
- Category filters: 🍚 Staples · 🍗 Proteins · 🥦 Veggies · 🍌 Fruits · 🥛 Drinks · 🍿 Snacks
- Quantity controls (1–20 servings) with live macro scaling
- Warning banner when calories, protein, carbs, or fat exceed daily targets
- Logs persist in localStorage per day

## 💾 Data Storage

All data is stored in `localStorage`:
- `bg_users` — all user accounts (name, email, goal, experience, BMI, workouts, nutrition logs)
- `bg_sess` — current active session
- `bg_quota` — daily AI message quota

## 🎨 Design

- **Theme**: Dark red/black (`#080000` background, `#E8001A` primary red)
- **Fonts**: Bebas Neue (display), Barlow + Barlow Condensed (body)
- **Responsive**: Mobile-first, works on all screen sizes

## 📦 No Dependencies

Pure vanilla HTML + CSS + JS. No frameworks, no build tools, no npm.
External resources loaded via CDN:
- Google Fonts (Bebas Neue, Barlow)
- Anthropic API (AI features)

## 🔒 Subscription Plans

| Plan | Price | Duration |
|------|-------|----------|
| Free Trial | ₱0 | 7 days |
| Premium Monthly | ₱99 | 30 days |
| Premium Annual | ₱799 | 365 days (save 33%) |

Payment methods: GCash · Maya · Credit/Debit Card · Bank Transfer

---

© 2025 GymFit PH · support@gymfit.ph · Made with ❤️ in the Philippines

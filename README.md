# BudgetFit

BudgetFit is a full-stack web application that helps users build realistic health plans around their personal budget. The project combines meal planning, workout planning, daily tracking, rewards, budgeting, and AI-assisted guidance in one experience.

The goal of BudgetFit is to make healthy routines feel practical instead of abstract. Users can define their profile, budget, and goals, then receive plans that account for both wellness needs and financial constraints.

## Core Features

- **User authentication** with email/password login, Google sign-in support, refresh tokens, and password reset flows.
- **Personal onboarding and profiles** for collecting user details such as body metrics, gender, goals, lifestyle context, and preferences.
- **Budget-aware planning** that connects health recommendations with user spending limits.
- **Meal and workout plan generation** powered by local meal and workout libraries.
- **Daily routine tracking** for following assigned meals, workouts, and habit tasks.
- **Dashboard analytics** for progress, budget usage, activity summaries, and personalized insights.
- **Rewards system** with vouchers, badges, task completions, and weekly reward logic.
- **AI assistant** for conversational support, weekly summaries, recommendations, and health-plan guidance.
- **Theme and language support** through dedicated frontend context providers.

## Project Structure

```text
FinalSS2/
|-- backend/                  # Express API, services, routes, database scripts, tests
|   |-- database/             # SQL schema, migrations, seed data, CSV import script
|   |-- src/
|   |   |-- config/           # App and database configuration
|   |   |-- controllers/      # Request handlers
|   |   |-- cron/             # Scheduled jobs
|   |   |-- middleware/       # Auth and request middleware
|   |   |-- routes/           # API route definitions
|   |   |-- services/         # Business logic
|   |   `-- utils/            # Shared backend utilities
|   `-- tests/                # Backend test coverage
|-- frontend/                 # React + Vite client application
|   `-- src/
|       |-- app/
|       |   |-- components/    # Shared UI and layout components
|       |   |-- lib/           # Frontend helpers
|       |   `-- screens/       # Main application screens
|       |-- assets/           # Static assets
|       `-- styles/           # Global styling
|-- meal_library_import.csv   # Meal library import data
|-- workout_library_import.csv # Workout library import data
`-- README.md
```

## Main Application Areas

### Frontend

The frontend is a React application built with Vite. It contains the user-facing screens for landing, authentication, onboarding, dashboard, plan viewing, daily routine tracking, budget breakdown, rewards, and settings.

Key screens include:

- `Landing`
- `Login`, `Register`, `ForgotPassword`, `ResetPassword`
- `Onboarding`
- `Dashboard`
- `Plan`
- `DailyRoutine`
- `Tracking`
- `BudgetBreakdown`
- `Rewards`
- `Settings`

Shared frontend behavior includes protected routes, guest routes, route transitions, theme switching, language switching, dashboard analytics, motivational popups, and an AI assistant bubble.

### Backend

The backend is a Node.js and Express API. It organizes application behavior into route, controller, and service layers.

Main backend modules include:

- `auth` for registration, login, Google authentication, refresh tokens, and password reset.
- `profile` for user profile and onboarding data.
- `budget` for user budget configuration and budget-related plan data.
- `plan` for meal and workout plan generation.
- `tracking` for daily progress and task completion.
- `dashboard` for summaries and analytics.
- `rewards` for badges, vouchers, and weekly rewards.
- `ai` for assistant responses and AI-powered summaries.

### Database

BudgetFit uses MySQL as its primary database. The `backend/database` folder contains schema files, migration scripts, seed data, and an import script for loading meal and workout libraries from CSV files.

The all-in-one SQL dump is stored at:

```text
backend/database/budgetfit_all_in_one.sql
```

Library import data is stored at:

```text
meal_library_import.csv
workout_library_import.csv
```

## Technology Stack

- **Frontend:** React, Vite, JavaScript, JSX, CSS
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Authentication:** JWT, refresh tokens, Google sign-in support
- **AI Integration:** Gemini-compatible assistant service configuration
- **API Documentation:** Swagger endpoint support

## API Surface

The backend exposes route groups for the main product domains:

```text
/api/auth
/api/profile
/api/budget
/api/plan
/api/tracking
/api/dashboard
/api/rewards
/api/ai
```

Swagger documentation is available when the backend is running:

```text
http://localhost:5000/api-docs
```

## Data Flow Overview

1. A user registers or signs in.
2. The user completes onboarding and profile setup.
3. Budget and health preferences are stored in MySQL.
4. The backend generates meal and workout plans using profile data, budget limits, and local library data.
5. The user follows daily tasks and tracks completion.
6. Dashboard and reward modules summarize progress and encourage consistency.
7. The AI assistant provides contextual guidance based on available user and plan data.

## Local Development Summary

This README focuses on the project overview. At a high level, local development requires:

- Node.js 18+
- npm
- MySQL 8.x
- Backend environment variables in `backend/.env`
- Frontend environment variables in `frontend/.env`

Typical local services:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Swagger:  http://localhost:5000/api-docs
```

## Project Purpose

BudgetFit is designed as a practical wellness companion for users who want healthier habits without ignoring real financial limits. Instead of treating fitness, nutrition, and budgeting as separate problems, the application brings them into a single planning and tracking workflow.

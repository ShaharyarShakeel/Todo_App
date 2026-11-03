# 📝 Todo App — Frontend

A responsive, full-featured Todo application built with **React**, **Redux Toolkit**, and **Vite**. Connects to a **FastAPI** backend for authentication and Todo CRUD operations.

---

## ✨ Features

- 🔐 **JWT Authentication** — Login and Sign Up with secure cookie-based token storage
- ✅ **Full Todo CRUD** — Create, Read, Update, Delete todos
- 🔔 **Toast Notifications** — Custom-built toast system (no external library)
- 🗂 **Redux Toolkit** — Centralized global state for auth and todos
- 🔄 **Cross-tab Logout Sync** — Logging out in one tab instantly logs out all open tabs
- 🔌 **Server Offline Screen** — Friendly error screen with a Retry button when backend is unreachable
- 💾 **Persistent Login** — User stays logged in across page refreshes via cookie + localStorage
- ⌨️ **Auto-focus on Edit** — Uses `useLayoutEffect` to focus the title input when editing
- 🌿 **Environment Variables** — API base URL managed via `.env`, never hardcoded

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| State Management | Redux Toolkit + React-Redux |
| Styling | Plain CSS (custom, no Tailwind) |
| Auth Storage | JWT in Cookie + Email in LocalStorage |
| API Communication | Fetch API (custom wrapper in `api.js`) |
| Backend | FastAPI (separate repository) |

---

## 📁 Project Structure

```
todo-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AuthPage.jsx        # Login & Signup form
│   │   ├── CreateTodoForm.jsx  # Form to create a new todo
│   │   ├── Dashboard.jsx       # Main authenticated view
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   └── TodoCard.jsx        # Individual todo with edit/delete
│   ├── context/
│   │   └── ToastContext.jsx    # Toast notification system
│   ├── store/
│   │   ├── store.js            # Redux store configuration
│   │   ├── authSlice.js        # Auth state + async thunks
│   │   └── todosSlice.js       # Todos state + async thunks
│   ├── api.js                  # Centralised API layer + cookie helpers
│   ├── App.jsx                 # Root component, routing logic
│   ├── main.jsx                # Entry point, Redux Provider setup
│   └── index.css               # Global styles
├── .env                        # Environment variables (not committed)
├── .env.example                # Template for required environment variables
├── .gitignore
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- The **FastAPI backend** running (see backend repository)

### Installation

**1. Clone the repository:**
```bash
git clone <repository-url>
cd todo-frontend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure environment variables:**
```bash
cp .env.example .env
```

Open `.env` and set your backend URL:
```env
BASE_URL=http://localhost:8000
```

**4. Start the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |

---

## 🏗 Architecture & Key Design Decisions

### Redux Store Shape
```
store
├── auth
│   ├── user: { email, access_token } | null
│   ├── status: 'idle' | 'loading' | 'failed'
│   └── error: string | null
└── todos
    ├── items: Todo[]
    ├── status: 'idle' | 'loading' | 'failed'
    └── error: string | null
```

### Auth Flow
1. User logs in → `loginUser` async thunk calls `/auth/login`
2. On success → JWT saved to cookie (1 day expiry), email saved to `localStorage`
3. On page reload → token restored from cookie, email from `localStorage` → auto-login
4. On logout → cookie and `localStorage` cleared, Redux state reset
5. On any `401` response → auto-logout triggered from any component

### Cross-Tab Logout
Uses the browser `storage` event. When `user_email` is removed from `localStorage` in one tab, all other tabs detect it and dispatch `logout()` automatically.

### Toast Notifications
Built from scratch using React Context (`ToastContext.jsx`):
- Four types: `success`, `error`, `warning`, `info`
- Auto-dismiss after 3.5 seconds
- Manual dismiss via × button
- Context value memoized with `useMemo` to prevent unnecessary re-renders

### Server Offline Handling
Dashboard has three distinct render states:
- **`loading`** — Full-page loading spinner (prevents form flicker on retry)
- **`failed`** — "Cannot connect to server" screen with a Retry button
- **`idle`** — Full dashboard with todo list and create form

---

## 🔑 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `BASE_URL` | URL of the FastAPI backend | `http://localhost:8000` |

> ⚠️ `.env` is in `.gitignore` and will never be committed. Use `.env.example` as your setup template.

---

## 🌐 API Endpoints Used

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/todos/` | Fetch all todos |
| `POST` | `/todos/` | Create a new todo |
| `PUT` | `/todos/:id` | Full update a todo |
| `PATCH` | `/todos/:id` | Partial update (toggle complete) |
| `DELETE` | `/todos/:id` | Delete a todo |


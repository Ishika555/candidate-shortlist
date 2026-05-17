# HireAI — Candidate Shortlisting System

A full-stack MERN application that filters and ranks job candidates using skill matching logic and OpenRouter AI.

---

## Project Structure

```
candidate-shortlist/
├── backend/
│   ├── controllers/
│   │   ├── candidateController.js   # CRUD logic for candidates
│   │   └── matchController.js       # Basic + AI shortlisting logic
│   ├── middleware/
│   │   └── errorHandler.js          # Global error handler
│   ├── models/
│   │   └── Candidate.js             # Mongoose schema
│   ├── routes/
│   │   ├── candidateRoutes.js       # /api/candidates endpoints
│   │   └── matchRoutes.js           # /api/match and /api/ai/* endpoints
│   ├── .env.example                 # Environment variable template
│   ├── package.json
│   └── server.js                    # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── CandidateCard.jsx    # Reusable candidate display card
    │   │   └── Sidebar.jsx          # Navigation sidebar
    │   ├── pages/
    │   │   ├── AddCandidatePage.jsx # Add new candidate form
    │   │   ├── AIShortlistPage.jsx  # AI-powered ranking page
    │   │   ├── CandidatesPage.jsx   # Candidate list with search
    │   │   ├── ChartsPage.jsx       # Analytics dashboard
    │   │   └── MatchPage.jsx        # Basic match page
    │   ├── styles/
    │   │   └── global.css           # Global CSS design system
    │   ├── utils/
    │   │   └── api.js               # Axios API client
    │   ├── App.jsx                  # Root component
    │   └── index.js                 # React entry point
    ├── .env.example
    └── package.json
```

---

## Prerequisites

Make sure these are installed before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | Comes with Node.js |
| MongoDB | Local or Atlas | https://www.mongodb.com |

---

## Local Setup (VS Code)

### Step 1 — Clone / open the project

Open the `candidate-shortlist/` folder in VS Code:
```
File → Open Folder → select candidate-shortlist/
```

### Step 2 — Set up the Backend

Open a terminal in VS Code (`Ctrl + `` ` ``):

```bash
# Navigate into the backend folder
cd backend

# Install all dependencies
npm install

# Create your .env file from the template
cp .env.example .env
```

Now open `backend/.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/candidate_shortlist
OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

> **Where to get your OpenRouter API key:**  
> Go to https://openrouter.ai/workspaces/default/keys → Create new key → Copy it.

Start the backend server:

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# OR production mode
npm start
```

You should see:
```
✅ Connected to MongoDB successfully.
🚀 Server running on http://localhost:5000
```

### Step 3 — Set up the Frontend

Open a **second terminal** in VS Code (`Ctrl + Shift + `` ` ``):

```bash
# Navigate into the frontend folder
cd frontend

# Install all dependencies
npm install

# Create your .env file
cp .env.example .env
```

The default `.env` is fine for local development:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React development server:

```bash
npm start
```

The browser will open automatically at **http://localhost:3000**

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/candidates` | Get all candidates (supports `?search=`) |
| `POST` | `/api/candidates` | Add a new candidate |
| `DELETE` | `/api/candidates/:id` | Delete a candidate |
| `POST` | `/api/match` | Basic skill-based shortlisting |
| `POST` | `/api/ai/shortlist` | AI-powered ranking via OpenRouter |
| `POST` | `/api/ai/interview-questions` | Generate AI interview questions |

### Example: Add Candidate
```bash
curl -X POST http://localhost:5000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul Sharma","email":"rahul@gmail.com","skills":["React","Node.js","MongoDB"],"experience":2}'
```

### Example: Basic Match
```bash
curl -X POST http://localhost:5000/api/match \
  -H "Content-Type: application/json" \
  -d '{"requiredSkills":["React","Node.js"],"minExperience":1}'
```

---

## Deploying to Render (Free Hosting)

### Step 1 — Push code to GitHub

```bash
# In the root candidate-shortlist/ folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/candidate-shortlist.git
git push -u origin main
```

---

### Step 2 — Deploy the Backend on Render

1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name:** `candidate-shortlist-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
4. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `OPENROUTER_API_KEY` | Your OpenRouter API key |
   | `PORT` | `5000` |
   | `CLIENT_URL` | Your frontend Render URL (add after frontend deploy) |
5. Click **Create Web Service**

Your backend URL will be: `https://candidate-shortlist-backend.onrender.com`

---

### Step 3 — Deploy the Frontend on Render

1. Go to https://render.com → **New** → **Static Site**
2. Connect the same GitHub repo
3. Configure:
   - **Name:** `candidate-shortlist-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Add **Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://candidate-shortlist-backend.onrender.com/api` |
5. Click **Create Static Site**

---

### Step 4 — Update CORS on Backend

Go back to your backend Render service → **Environment** → update:
```
CLIENT_URL = https://candidate-shortlist-frontend.onrender.com
```

Then click **Save Changes** (Render will redeploy automatically).

---

## MongoDB Atlas Setup (for cloud database)

1. Go to https://www.mongodb.com/atlas → Create free account
2. Create a new cluster (free M0 tier)
3. Database Access → Add a user with read/write permissions
4. Network Access → Add `0.0.0.0/0` (allows all IPs, required for Render)
5. Connect → Drivers → Copy the connection string
6. Replace `<password>` in the string with your actual password
7. Use this string as your `MONGO_URI`

Example:
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/candidate_shortlist?retryWrites=true&w=majority
```

---

## Useful VS Code Commands Summary

```bash
# Install backend dependencies
cd backend && npm install

# Run backend in dev mode
cd backend && npm run dev

# Install frontend dependencies  
cd frontend && npm install

# Run frontend dev server
cd frontend && npm start

# Build frontend for production
cd frontend && npm run build
```

---

## Features

- ✅ Add, view, search, and delete candidates
- ✅ Basic skill + experience matching with percentage scores
- ✅ AI-powered ranking with explanations (OpenRouter / GPT-4o-mini)
- ✅ Bonus: AI-generated interview questions per candidate
- ✅ Analytics dashboard with skill frequency and experience charts
- ✅ Dark professional UI with responsive design

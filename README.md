<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="src/ai-agent/frontend/public/brand/bankquest-logo-white.png">
    <img src="src/ai-agent/frontend/public/brand/bankquest-logo-dark.png" alt="BankQuest logo" width="110" height="110">
  </picture>
</p>

<h1 align="center">BankQuest: AI Financial Coach</h1>

<p align="center">Gemini-powered savings challenges, added as a new microservice to Google's Bank of Anthos on GKE.</p>

<p align="center">
  <a href="https://gketurns10.devpost.com/"><img alt="GKE Turns 10 Hackathon" src="https://img.shields.io/badge/hackathon-GKE%20Turns%2010-4285F4?style=flat-square&logo=googlecloud&logoColor=white"></a>
  <a href="https://www.youtube.com/watch?v=V7F3svisXFk"><img alt="Demo video" src="https://img.shields.io/badge/demo-video-FF0000?style=flat-square&logo=youtube&logoColor=white"></a>
  <a href="https://devpost.com/software/bankquest"><img alt="Devpost" src="https://img.shields.io/badge/Devpost-BankQuest-003E54?style=flat-square&logo=devpost&logoColor=white"></a>
  <a href="https://github.com/comp-Ryan/gke-hackathon-Financial-Coach/actions/workflows/terraform-validate-ci.yaml"><img alt="Terraform validate" src="https://img.shields.io/github/actions/workflow/status/comp-Ryan/gke-hackathon-Financial-Coach/terraform-validate-ci.yaml?branch=main&style=flat-square&label=terraform%20validate"></a>
  <a href="LICENSE"><img alt="Apache 2.0" src="https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square"></a>
</p>
<p align="center">
  <img alt="GKE" src="https://img.shields.io/badge/runs%20on-GKE-4285F4?style=flat-square&logo=kubernetes&logoColor=white">
  <a href="https://github.com/GoogleCloudPlatform/bank-of-anthos"><img alt="Bank of Anthos" src="https://img.shields.io/badge/base-Bank%20of%20Anthos-34A853?style=flat-square&logo=google&logoColor=white"></a>
  <a href="https://ai.google.dev"><img alt="Gemini 2.5 Flash" src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8E75B2?style=flat-square&logo=googlegemini&logoColor=white"></a>
  <img alt="Flask" src="https://img.shields.io/badge/Flask-Python-000000?style=flat-square&logo=flask">
  <img alt="React 18" src="https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white">
</p>

<p align="center">
  <a href="https://gketurns10.devpost.com/"><img src="src/ai-agent/frontend/public/brand/gke-turns-10.png" alt="GKE Turns 10 Hackathon" width="200"></a><br/>
  <sub>Built for the <a href="https://gketurns10.devpost.com/">GKE Turns 10 Hackathon</a> · Google Cloud · Sep 2025 · <a href="https://devpost.com/software/bankquest">Devpost entry</a></sub>
</p>

<p align="center"><b>Contributors</b></p>
<div align="center">
<table>
  <tr>
    <td align="center"><a href="https://github.com/comp-Ryan"><img src="https://github.com/comp-Ryan.png?size=120" width="72" height="72" alt="Ryan"></a><br/><sub><b>Ryan</b></sub><br/><sub><a href="https://github.com/comp-Ryan">@comp-Ryan</a></sub></td>
  </tr>
</table>
</div>

My part of this repo is the `src/ai-agent/` service. Everything else (accounts, ledger, frontend, Terraform, Kubernetes manifests) comes from Google's [Bank of Anthos](https://github.com/GoogleCloudPlatform/bank-of-anthos) sample, which is why the commit history has many other contributors.

## What This Does

- 🤖 **AI-Powered Challenges**: Uses Google Gemini to create personalized financial challenges
- 💰 **Goal Tracking**: Set and track financial goals with progress bars
- 📊 **Financial Insights**: Shows your balance, transactions, and spending patterns
- 🎯 **Achievement System**: Earn XP and unlock achievements
- 🔥 **Streaks and leaderboard**: daily streak messages and leaderboard context, written by Gemini
- 🏦 **Bank connection**: reads the real Bank of Anthos balance and history when it runs in the cluster, and falls back to demo data locally

## How it fits together

```mermaid
flowchart LR
  U[Browser] --> FE[React dashboard<br/>:3000]
  FE --> API[Flask AI agent<br/>:8080]
  API --> BR[balancereader]
  API --> TH[transactionhistory]
  API --> GM[Gemini 2.5 Flash]
  API --> DB[(SQLite<br/>goals, challenges,<br/>progress)]
  BR --> LD[(Bank of Anthos<br/>ledger)]
  TH --> LD
  classDef ai fill:#8E75B2,color:#fff,stroke:#8E75B2
  classDef code fill:#1f2937,color:#fff,stroke:#1f2937
  classDef boa fill:#34A853,color:#fff,stroke:#34A853
  class GM ai
  class FE,API code
  class BR,TH boa
```

## Where the numbers come from

```mermaid
flowchart TD
  R[GET /user-profile/:id] --> A{Authorization<br/>header sent?}
  A -- no --> E[401]
  A -- yes --> K{Bank of Anthos services<br/>reachable within 2 s?}
  K -- yes --> REAL[Real balance and<br/>transactions]
  K -- no --> FAKE[Demo balance and<br/>sample transactions]
  REAL --> G[Gemini writes the challenge]
  FAKE --> G
  classDef good fill:#15803d,color:#fff,stroke:#15803d
  classDef bad fill:#b91c1c,color:#fff,stroke:#b91c1c
  classDef warn fill:#b45309,color:#fff,stroke:#b45309
  class REAL good
  class E bad
  class FAKE warn
```

## Setting a goal

```mermaid
sequenceDiagram
  actor U as User
  participant FE as Dashboard
  participant API as AI agent
  participant G as Gemini
  participant B as Bank of Anthos
  U->>FE: "Save $500 for vacation"
  FE->>API: POST /goals/:id
  API->>G: Parse amount, emoji, category
  API-->>FE: Goal saved
  FE->>API: GET /challenges/:id
  API->>B: Balance + transactions
  API->>G: Write challenges from spending
  G-->>FE: Personalized challenges
  U->>FE: Complete one, earn XP
```

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API key

### Step 1: Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (you'll need it later)

### Step 2: Run the Backend
```bash
# Navigate to backend folder
cd src/ai-agent/backend

# Install Python dependencies
pip install -r requirements.in

# Create environment file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run the backend
python main.py
```
Backend will start on: http://localhost:8080

### Step 3: Run the Frontend
```bash
# Open new terminal, navigate to frontend folder
cd src/ai-agent/frontend

# Install Node.js dependencies
npm install

# Run the frontend
npm start
```
Frontend will start on: http://localhost:3000

### Step 4: Use the App
1. Open http://localhost:3000 in your browser
2. The app will automatically connect to the backend
3. Try setting a financial goal like "Save $500 for vacation"
4. Get AI-generated challenges based on your goal

## Project Structure

```
src/ai-agent/
├── backend/           # Flask API + AI
│   ├── main.py       # Main server
│   ├── gemini_client.py  # AI integration
│   └── database.py   # Data storage
├── frontend/         # React app
│   ├── src/components/  # UI components
│   └── src/services/    # API calls
└── k8s/             # Kubernetes files (optional)
```

## Configuration

### Backend Environment Variables
Create a `.env` file in `src/ai-agent/backend/`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Environment Variables
The frontend automatically connects to `http://localhost:8080` for the backend.

## API Endpoints

- `GET /user-profile/{user_id}` - Get user financial info
- `GET /challenges/{user_id}` - Generate AI challenge
- `POST /goals/{user_id}` - Set financial goal
- `GET /goals/{user_id}` - Get current goal
- `GET /achievements/{user_id}` - AI-written badges and milestones
- `GET /streak-message/{user_id}` - Daily streak message
- `GET /leaderboard-context/{user_id}` - Leaderboard insight
- `GET /additional-tasks/{user_id}` - Quick micro-tasks
- `POST /generate-emoji` - Pick an emoji for a goal
- `GET /ready`, `GET /version` - Health and version

## Demo Mode

The app runs in demo mode by default with fake data:
- User ID: `demo_user`
- Balance: $1,500
- Sample transactions included

## Troubleshooting

**Backend won't start?**
- Check if port 8080 is available
- Make sure you have the Gemini API key set

**Frontend can't connect?**
- Ensure backend is running on port 8080
- Check browser console for errors

**AI challenges not working?**
- Verify your Gemini API key is correct
- Check backend logs for API errors

## Tech Stack

- **Backend**: Python + Flask + SQLite
- **Frontend**: React + Axios
- **AI**: Google Gemini 2.5 Flash
- **Database**: SQLite

## License

Apache 2.0, inherited from Bank of Anthos (see [LICENSE](LICENSE)). Built for the GKE Turns 10 Hackathon.
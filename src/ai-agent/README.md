<<<<<<< HEAD
# AI Financial Coach - GKE Deployment

A full-stack financial coaching application built with React frontend and Flask backend, deployed on Google Kubernetes Engine (GKE).

## Architecture

- **Frontend**: React.js application served via nginx
- **Backend**: Flask API with AI-powered challenge generation
- **AI Integration**: Google Gemini API for personalized financial challenges
- **Database**: SQLite with persistent storage via Kubernetes volumes
- **Deployment**: Kubernetes with LoadBalancer services

## Features

- Personalized financial challenges based on user's balance and spending
- AI-powered goal recommendations and motivational messages
- Interactive dashboard with progress tracking
- Leaderboard and achievement system
- Responsive web interface

## Setup Instructions

### Prerequisites

1. Google Cloud Platform account with GKE enabled
2. Docker installed locally
3. kubectl configured for your GKE cluster
4. Google Gemini API key

### Environment Variables

Create a `.env` file in the backend directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
DB_PATH=/app/ai_agent.db
```

### Build and Deploy

1. **Build Docker images**:
   ```bash
   # Backend
   cd src/ai-agent/backend
   docker build -t your-registry/ai-agent:latest .
   docker push your-registry/ai-agent:latest

   # Frontend
   cd src/ai-agent/frontend
   docker build -t your-registry/ai-agent-frontend:latest .
   docker push your-registry/ai-agent-frontend:latest
   ```

2. **Update image references**:
   - Update `src/ai-agent/k8s/base/ai-agent.yaml` with your registry
   - Update `src/ai-agent/frontend/ai-agent-frontend.yaml` with your registry

3. **Deploy to GKE**:
   ```bash
   kubectl apply -f src/ai-agent/k8s/base/
   kubectl apply -f src/ai-agent/frontend/
   ```

4. **Configure secrets**:
   ```bash
   kubectl create secret generic gemini-secret --from-literal=api-key=your_gemini_api_key
   ```

### Local Development

1. **Backend**:
   ```bash
   cd src/ai-agent/backend
   pip install -r requirements.in
   python main.py
   ```

2. **Frontend**:
   ```bash
   cd src/ai-agent/frontend
   npm install
   npm start
   ```

## API Endpoints

- `GET /user-profile/{user_id}` - Get user financial profile
- `GET /challenges/{user_id}` - Generate personalized challenge
- `POST /goals/{user_id}` - Set financial goal
- `GET /achievements/{user_id}` - Get user achievements
- `GET /leaderboard-context/{user_id}` - Get leaderboard insights

## Configuration

### Frontend Environment Variables

- `REACT_APP_AI_AGENT_URL`: Backend API URL
- `REACT_APP_BANK_URL`: Bank service URL

### Backend Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key
- `DB_PATH`: SQLite database path

## Security Notes

- Never commit API keys or sensitive tokens to version control
- Use Kubernetes secrets for sensitive configuration
- Configure CORS appropriately for production
- Use HTTPS in production environments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for educational purposes as part of a GKE hackathon.
=======
# AI Financial Coach

An intelligent financial coaching system that integrates with Bank of Anthos to provide personalized financial challenges using AI.

## Architecture

This project consists of two main components organized in separate directories:

```
src/ai-agent/
├── backend/           # Flask API + AI Logic
│   ├── main.py           # Flask web server
│   ├── gemini_client.py  # Gemini AI integration
│   ├── database.py       # SQLite database operations
│   ├── Dockerfile        # Backend containerization
│   └── requirements.in   # Python dependencies
├── frontend/          # React Web Application
│   ├── src/             # React components and logic
│   ├── public/          # Static assets
│   └── package.json     # Node.js dependencies
└── k8s/              # Kubernetes deployment manifests
```

## Components

### Backend (Flask + AI)
- **Flask API Server**: Provides REST endpoints for goals and challenges
- **Gemini AI Integration**: Uses Google's Gemini 2.5 Flash for intelligent goal parsing and challenge generation
- **SQLite Database**: Persistent storage for user goals, challenges, and progress
- **JWT Authentication**: Secure integration with Bank of Anthos services

### Frontend (React)
- **Modern React App**: Clean, responsive user interface
- **Dual Connection Mode**: Demo mode for testing, custom mode for real Bank of Anthos instances
- **Real-time AI Interaction**: Displays AI-generated challenges and parses financial goals
- **Progress Tracking**: Visual progress bars and achievement system

## Features

🎯 **Smart Goal Setting**
- AI-powered goal parsing (extracts amounts, emojis, categories)
- Visual progress tracking with animated progress bars
- Goal persistence across sessions

🤖 **Personalized AI Challenges**
- Real-time challenge generation based on spending patterns
- Difficulty levels (Easy, Medium, Hard) with XP rewards
- Contextual tips and recommendations

💰 **Bank Integration** 
- Connects to Bank of Anthos APIs for real financial data
- JWT-based authentication for secure API access
- Fallback mock data for demo purposes

📊 **Analytics & Progress**
- Transaction analysis for personalized insights
- Achievement system with XP tracking
- Financial context display (balance, spending, transaction count)

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.in
python main.py
```
Backend runs on: http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on: http://localhost:3000

## Deployment

### Local Development
1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm start`
3. Access at http://localhost:3000

### Container Deployment
```bash
# Build backend
cd backend
docker build -t ai-financial-coach-backend .

# Build frontend  
cd frontend
docker build -t ai-financial-coach-frontend .
```

### Kubernetes Deployment
```bash
kubectl apply -f k8s/
```

## Configuration

### Backend Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI functionality
- `PORT`: Backend server port (default: 8080)
- `DB_PATH`: SQLite database file path (default: ai_agent.db)

### Frontend Environment Variables  
- `REACT_APP_AI_AGENT_URL`: Backend API URL (default: http://localhost:8080)

## API Endpoints

### Goals
- `POST /goals/{user_id}` - Set user financial goal
- `GET /goals/{user_id}` - Get user's current goal

### Challenges  
- `GET /challenges/{user_id}` - Get personalized AI challenge

### Health
- `GET /ready` - Health check endpoint
- `GET /version` - Application version

## Integration with Bank of Anthos

This AI coach integrates with Bank of Anthos through:
- **Balance API**: `GET /balances/{user_id}` 
- **Transaction API**: `GET /transactions/{user_id}`
- **JWT Authentication**: Uses Bank of Anthos JWT tokens for secure access

## Technology Stack

**Backend:**
- Python 3.10+ with Flask
- Google Gemini 2.5 Flash API
- SQLite database
- JWT authentication
- Docker containerization

**Frontend:**
- React 18+ with modern hooks
- Axios for API communication  
- Responsive CSS with animations
- Progressive Web App capabilities

**Infrastructure:**
- Kubernetes deployment manifests
- Docker multi-stage builds
- Environment-based configuration

## Development

### Adding New Features
1. **Backend**: Add new endpoints in `main.py`, AI logic in `gemini_client.py`
2. **Frontend**: Add new components in `src/components/`, API calls in `src/services/api.js`
3. **Database**: Extend schema in `database.py`

### Testing
- Backend: Add unit tests for new API endpoints
- Frontend: Test components with different API responses
- Integration: Test full flow with real Bank of Anthos data

## Contributing

1. Follow the organized directory structure
2. Keep backend and frontend concerns separated  
3. Document new API endpoints and components
4. Test with both demo and real Bank of Anthos data

## License

This project extends Bank of Anthos and follows the same Apache 2.0 license terms.
>>>>>>> d0e866a498243d821f8d358895ff6268792f5cd0

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
# AI Financial Coach Frontend

A React-based frontend for the AI Financial Coach that connects to Bank of Anthos and provides personalized financial challenges.

## Features

- 🎯 **Smart Goal Tracking** - Set and track financial goals with AI parsing
- 🤖 **AI-Powered Challenges** - Get personalized challenges based on your financial data
- 📊 **Progress Visualization** - See your progress with beautiful charts and progress bars
- 💰 **Bank Integration** - Connect to Bank of Anthos for real financial data
- 🎨 **Modern UI** - Clean, responsive design with smooth animations

## Quick Start

### Prerequisites
- Node.js 16+ installed
- Bank of Anthos running (for real data) or use demo mode
- AI Agent backend running on port 8080

### Installation

1. **Install dependencies:**
```bash
cd src/ai-agent/frontend
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Open your browser:**
```
http://localhost:3000
```

## Usage

### Demo Mode (Recommended for first try)
1. Select "Try Demo" on the connection screen
2. Click "Start Demo" - no setup required!
3. Experience all features with pre-configured test data

### Custom Connection
1. Select "Connect Your Own"
2. Enter your Bank of Anthos URL
3. Enter your User ID
4. Get JWT token from Bank of Anthos:
   - Open Bank of Anthos in browser and login
   - Open Dev Tools (F12) → Network tab
   - Find any API request → Copy Authorization header
   - Paste the full "Bearer ..." token
5. Click "Connect to AI Coach"

## Configuration

### Environment Variables
Create a `.env` file in the frontend directory:
```bash
REACT_APP_AI_AGENT_URL=http://localhost:8080
REACT_APP_BANK_URL=http://your-bank-url
```

### Default Configuration
- **AI Agent URL:** `http://localhost:8080`
- **Default User:** `1011226111` (Bank of Anthos test user)
- **Default Bank URL:** `http://34.186.146.83`

## Components

### `BankConnection`
- Handles demo vs custom connection modes
- Manages JWT token input
- Validates connection settings

### `Dashboard`
- Main application container
- Manages navigation between components
- Handles disconnect functionality

### `GoalBar`
- Displays main financial goal
- Shows progress with animated progress bar
- Allows goal setting and updating
- Uses AI to parse goal text (amount, emoji, category)

### `ChallengeList`
- Shows AI-generated personalized challenges
- Displays difficulty, XP rewards, and tips
- Allows fetching new challenges
- Shows financial context (balance, spending, transactions)

## API Integration

The frontend communicates with two APIs:

### AI Agent API (Primary)
- `GET /goals/{userId}` - Fetch user's goal
- `POST /goals/{userId}` - Set new goal
- `GET /challenges/{userId}` - Get personalized challenge
- `GET /ready` - Health check

### Bank of Anthos API (Optional)
- `GET /balances/{userId}` - Get account balance
- `GET /transactions/{userId}` - Get transaction history

## Building for Production

```bash
npm run build
```

This creates a `build/` directory with optimized production files.

## Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

**"Cannot connect to AI Agent"**
- Ensure AI Agent backend is running on port 8080
- Check if CORS is properly configured
- Verify JWT token is valid

**"Challenge loading failed"**
- Check AI Agent logs for errors
- Verify Gemini API key is configured
- Try demo mode to test frontend functionality

**"Goal parsing not working"**
- Ensure Gemini API is accessible
- Check API key configuration in backend
- Use fallback parsing if Gemini fails

### CORS Configuration

If running on different ports, add to your AI Agent backend:

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

## Development

### Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── BankConnection.js
│   │   ├── Dashboard.js
│   │   ├── GoalBar.js
│   │   └── ChallengeList.js
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── index.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

### Adding New Features

1. **New Components:** Add to `src/components/`
2. **API Calls:** Add to `src/services/api.js`
3. **Styles:** Add to `src/styles/index.css`
4. **State Management:** Consider adding Redux for complex state

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Bank of Anthos AI extension and follows the same licensing terms.
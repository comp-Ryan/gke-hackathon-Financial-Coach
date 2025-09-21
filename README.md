# AI Financial Coach

A simple financial coaching app that uses AI to generate personalized money challenges.

## What This Does

- 🤖 **AI-Powered Challenges**: Uses Google Gemini to create personalized financial challenges
- 💰 **Goal Tracking**: Set and track financial goals with progress bars
- 📊 **Financial Insights**: Shows your balance, transactions, and spending patterns
- 🎯 **Achievement System**: Earn XP and unlock achievements

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

Educational project - feel free to use and modify!
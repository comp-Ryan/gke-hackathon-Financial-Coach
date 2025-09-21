import os, requests, re
from flask import Flask, jsonify, request
from flask_cors import CORS
from gemini_client import GeminiClient
from database import init_db, set_goal as db_set_goal, get_latest_goal, save_challenge

def parse_goal(goal_text):
    """Use Gemini AI to parse goal text"""
    gemini = GeminiClient()
    return gemini.parse_goal(goal_text)


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for frontend requests
    CORS(app, origins=["http://localhost:3000"])
    
    # Initialize database on startup
    init_db()
    
    @app.route('/ready', methods=['GET'])
    def readiness():
        return 'ok', 200
    
    @app.route('/version', methods=['GET'])
    def version():
        return os.environ.get('VERSION', '1.0.0'), 200
    
    # Set user goal endpoint - now with database
    @app.route('/goals/<user_id>', methods=['POST'])
    def set_goal(user_id):
        try:
            goal_data = request.get_json(silent=True) or {}
            goal_text = (goal_data.get('goal') or '').strip()
            
            if not goal_text:
                return jsonify({"error": "Goal is required"}), 400
            
            # Parse goal for frontend display
            parsed_goal = parse_goal(goal_text)
            
            # Store goal in database
            db_set_goal(user_id, goal_text)
            
            return jsonify({
                "message": "Goal set successfully",
                "user_id": user_id,
                "goal": goal_text,
                "parsed_goal": parsed_goal
            }), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to set goal: {str(e)}"}), 500
    
    # Get user goal endpoint - now with database
    @app.route('/goals/<user_id>', methods=['GET'])
    def get_goal(user_id):
        try:
            goal_row = get_latest_goal(user_id)
            
            if not goal_row:
                return jsonify({
                    "goal": None,
                    "created_at": None,
                    "status": None,
                    "parsed_goal": None
                }), 200
            
            # Parse goal for frontend display
            parsed_goal = parse_goal(goal_row["goal_text"])
            
            return jsonify({
                "goal": goal_row["goal_text"],
                "created_at": goal_row["created_at"],
                "status": goal_row["status"],
                "parsed_goal": parsed_goal
            }), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to get goal: {str(e)}"}), 500
    
    @app.route('/challenges/<user_id>', methods=['GET'])
    def get_challenge(user_id):
        try:
            # Get JWT token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"error": "Authorization header required"}), 401
            
            headers = {"Authorization": auth_header}
            
            # Get balance and transactions with authentication
            balance_response = requests.get(f"http://balancereader:8080/balances/{user_id}", headers=headers)
            balance = balance_response.json() if balance_response.status_code == 200 else 0

            history_response = requests.get(f"http://transactionhistory:8080/transactions/{user_id}", headers=headers)
            transactions = history_response.json() if history_response.status_code == 200 else []

            recent_transactions = transactions[:20]

            # Get user's goal from database
            goal_row = get_latest_goal(user_id)
            user_goal = goal_row["goal_text"] if goal_row else None

            # Validate transaction data and calculate spending safely
            valid_transactions = [t for t in recent_transactions if isinstance(t, dict) and 'amount' in t]
            recent_spending = sum(t.get('amount', 0) for t in valid_transactions)

            user_profile = {
                'balance': balance,
                'transactions': valid_transactions,
                'transaction_count': len(transactions),
                'recent_spending': recent_spending
            }
            
            # Generate AI challenge with user's goal
            gemini = GeminiClient()
            challenge_data = gemini.generate_challenge(user_profile, user_goal)

            # Save challenge to database
            save_challenge(user_id, challenge_data)

            return jsonify({
                "challenge": challenge_data["challenge"],
                "difficulty": challenge_data["difficulty"],
                "category": challenge_data["category"],
                "xp_reward": challenge_data["xp_reward"],
                "time_to_complete": challenge_data["time_to_complete"],
                "goal_recommendation": challenge_data["goal_recommendation"],
                "tips": challenge_data["tips"],
                "user_goal": user_goal,
                "user_balance": balance,
                "transaction_count": len(transactions),
                "recent_spending": recent_spending
            }), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to get user data: {str(e)}"}), 500
    
    @app.route('/achievements/<user_id>', methods=['GET'])
    def get_achievements(user_id):
        """Get AI-generated achievement badges for user"""
        try:
            # Get user stats from query parameters or database
            xp = int(request.args.get('xp', 0))
            level = int(request.args.get('level', 1))
            completed_challenges = int(request.args.get('completed_challenges', 0))
            streak = int(request.args.get('streak', 0))
            days_active = int(request.args.get('days_active', 1))
            goals_set = int(request.args.get('goals_set', 0))
            
            user_stats = {
                'xp': xp,
                'level': level,
                'completed_challenges': completed_challenges,
                'streak': streak,
                'days_active': days_active,
                'goals_set': goals_set
            }
            
            gemini = GeminiClient()
            achievements_data = gemini.generate_achievements(user_stats)
            
            return jsonify(achievements_data), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to generate achievements: {str(e)}"}), 500
    
    @app.route('/streak-message/<user_id>', methods=['GET'])
    def get_streak_message(user_id):
        """Get AI-generated motivational streak message"""
        try:
            current_streak = int(request.args.get('current_streak', 0))
            longest_streak = int(request.args.get('longest_streak', 0))
            last_challenge = request.args.get('last_challenge', 'None')
            recent_progress = request.args.get('recent_progress', 'New user')
            
            streak_data = {
                'current_streak': current_streak,
                'longest_streak': longest_streak,
                'last_challenge': last_challenge,
                'recent_progress': recent_progress
            }
            
            gemini = GeminiClient()
            streak_message = gemini.generate_streak_message(streak_data)
            
            return jsonify(streak_message), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to generate streak message: {str(e)}"}), 500
    
    @app.route('/leaderboard-context/<user_id>', methods=['GET'])
    def get_leaderboard_context(user_id):
        """Get AI-generated leaderboard insights and motivation"""
        try:
            position = int(request.args.get('position', 1))
            xp = int(request.args.get('xp', 0))
            level = int(request.args.get('level', 1))
            weekly_challenges = int(request.args.get('weekly_challenges', 0))
            
            user_stats = {
                'xp': xp,
                'level': level,
                'weekly_challenges': weekly_challenges
            }
            
            gemini = GeminiClient()
            leaderboard_context = gemini.generate_leaderboard_context(user_stats, position)
            
            return jsonify(leaderboard_context), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to generate leaderboard context: {str(e)}"}), 500

    @app.route('/generate-emoji', methods=['POST'])
    def generate_emoji():
        """Generate an appropriate emoji for a financial goal using Gemini"""
        try:
            data = request.get_json()
            goal = data.get('goal', '')
            
            if not goal:
                return jsonify({'emoji': '💰'})
            
            gemini = GeminiClient()
            emoji = gemini.generate_goal_emoji(goal)
            
            return jsonify({'emoji': emoji})
            
        except Exception as e:
            print(f"Error generating emoji: {e}")
            # Return default emoji
            return jsonify({'emoji': '💰'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
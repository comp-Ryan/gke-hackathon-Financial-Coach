import os, requests
from flask import Flask, jsonify, request
from gemini_client import GeminiClient

# Simple in-memory storage (replace with database later)
user_goals = {}


def create_app():
    app = Flask(__name__)
    
    @app.route('/ready', methods=['GET'])
    def readiness():
        return 'ok', 200
    
    @app.route('/version', methods=['GET'])
    def version():
        return os.environ.get('VERSION', '1.0.0'), 200
    
    # NEW: Set user goal endpoint
    @app.route('/goals/<user_id>', methods=['POST'])
    def set_goal(user_id):
        try:
            goal_data = request.get_json()
            goal = goal_data.get('goal', '')
            
            if not goal:
                return jsonify({"error": "Goal is required"}), 400
            
            # Store goal for user
            user_goals[user_id] = {
                'goal': goal,
                'created_at': request.headers.get('X-Timestamp', 'unknown')
            }
            
            return jsonify({
                "message": "Goal set successfully",
                "goal": goal,
                "user_id": user_id
            }), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to set goal: {str(e)}"}), 500
    
    # NEW: Get user goal endpoint
    @app.route('/goals/<user_id>', methods=['GET'])
    def get_goal(user_id):
        goal = user_goals.get(user_id)
        if goal:
            return jsonify(goal), 200
        else:
            return jsonify({"goal": None, "message": "No goal set"}), 200
    
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

            # Get user's goal from storage
            user_goal = user_goals.get(user_id, {}).get('goal', None)

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
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
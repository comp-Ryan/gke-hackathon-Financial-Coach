import os, requests, re
from flask import Flask, jsonify, request
from flask_cors import CORS
from gemini_client import GeminiClient
from database import init_db, set_goal as db_set_goal, get_latest_goal, save_challenge

def generate_static_achievements(user_stats):
    """Generate static achievements when AI fails"""
    achievements = []
    
    # Basic achievements that everyone can get
    achievements.append({
        "id": "first_login",
        "name": "Welcome Aboard!",
        "emoji": "👋",
        "description": "You've started your financial journey",
        "unlocked": True,
        "unlocked_message": "Welcome to BankQuest! Your financial adventure begins now!"
    })
    
    # Level-based achievements
    if user_stats.get('level', 1) >= 2:
        achievements.append({
            "id": "level_up",
            "name": "Rising Star",
            "emoji": "⭐",
            "description": "Reached level 2",
            "unlocked": True,
            "unlocked_message": "You're leveling up your financial game!"
        })
    else:
        achievements.append({
            "id": "level_up",
            "name": "Rising Star",
            "emoji": "⭐",
            "description": "Reach level 2",
            "unlocked": False
        })
    
    # Challenge-based achievements
    if user_stats.get('completed_challenges', 0) >= 1:
        achievements.append({
            "id": "first_challenge",
            "name": "Challenge Accepted",
            "emoji": "🎯",
            "description": "Completed your first challenge",
            "unlocked": True,
            "unlocked_message": "Great job completing your first challenge!"
        })
    else:
        achievements.append({
            "id": "first_challenge",
            "name": "Challenge Accepted",
            "emoji": "🎯",
            "description": "Complete your first challenge",
            "unlocked": False
        })
    
    if user_stats.get('completed_challenges', 0) >= 5:
        achievements.append({
            "id": "challenge_master",
            "name": "Challenge Master",
            "emoji": "🏆",
            "description": "Completed 5 challenges",
            "unlocked": True,
            "unlocked_message": "You're becoming a financial challenge master!"
        })
    else:
        achievements.append({
            "id": "challenge_master",
            "name": "Challenge Master",
            "emoji": "🏆",
            "description": "Complete 5 challenges",
            "unlocked": False
        })
    
    # Streak-based achievements
    if user_stats.get('streak', 0) >= 3:
        achievements.append({
            "id": "streak_starter",
            "name": "Streak Starter",
            "emoji": "🔥",
            "description": "Built a 3-day streak",
            "unlocked": True,
            "unlocked_message": "You're on fire with that 3-day streak!"
        })
    else:
        achievements.append({
            "id": "streak_starter",
            "name": "Streak Starter",
            "emoji": "🔥",
            "description": "Build a 3-day streak",
            "unlocked": False
        })
    
    if user_stats.get('streak', 0) >= 7:
        achievements.append({
            "id": "week_warrior",
            "name": "Week Warrior",
            "emoji": "💪",
            "description": "Built a 7-day streak",
            "unlocked": True,
            "unlocked_message": "Amazing! A full week of consistent financial habits!"
        })
    else:
        achievements.append({
            "id": "week_warrior",
            "name": "Week Warrior",
            "emoji": "💪",
            "description": "Build a 7-day streak",
            "unlocked": False
        })
    
    # Goal-based achievements
    if user_stats.get('goals_set', 0) >= 1:
        achievements.append({
            "id": "goal_setter",
            "name": "Goal Setter",
            "emoji": "🎯",
            "description": "Set your first financial goal",
            "unlocked": True,
            "unlocked_message": "Excellent! You've set your first financial goal!"
        })
    else:
        achievements.append({
            "id": "goal_setter",
            "name": "Goal Setter",
            "emoji": "🎯",
            "description": "Set your first financial goal",
            "unlocked": False
        })
    
    # XP-based achievements
    if user_stats.get('xp', 0) >= 100:
        achievements.append({
            "id": "xp_collector",
            "name": "XP Collector",
            "emoji": "💎",
            "description": "Earned 100+ XP",
            "unlocked": True,
            "unlocked_message": "You're collecting XP like a pro!"
        })
    else:
        achievements.append({
            "id": "xp_collector",
            "name": "XP Collector",
            "emoji": "💎",
            "description": "Earn 100+ XP",
            "unlocked": False
        })
    
    # Calculate next milestone
    unlocked_count = len([a for a in achievements if a.get('unlocked', False)])
    total_count = len(achievements)
    
    next_milestone = None
    if unlocked_count < total_count:
        # Find next unlockable achievement
        for achievement in achievements:
            if not achievement.get('unlocked', False):
                next_milestone = {
                    "name": achievement['name'],
                    "emoji": achievement['emoji'],
                    "description": achievement['description'],
                    "progress": unlocked_count / total_count,
                    "requirement": f"Currently {unlocked_count}/{total_count} achievements unlocked"
                }
                break
    
    return {
        "achievements": achievements,
        "next_milestone": next_milestone
    }

def parse_goal(goal_text):
    """Parse goal text with AI fallback to regex"""
    try:
        gemini = GeminiClient()
        parsed = gemini.parse_goal(goal_text)
        if parsed and 'error' not in parsed:
            return parsed
    except Exception as e:
        print(f"AI goal parsing failed: {e}")
    
    # Fallback to regex parsing
    import re
    
    # Extract amount - try multiple patterns
    amount = 0
    amount_match = re.search(r'\$([0-9,]+)', goal_text)
    if amount_match:
        amount = int(amount_match.group(1).replace(',', ''))
    else:
        # Pattern 2: 500 dollars, 1000 dollars
        dollar_match = re.search(r'([0-9,]+)\s*dollars?', goal_text, re.IGNORECASE)
        if dollar_match:
            amount = int(dollar_match.group(1).replace(',', ''))
        else:
            # Pattern 3: just numbers like "save 500 for"
            number_match = re.search(r'(?:save|need|want|goal)\s*([0-9,]+)', goal_text, re.IGNORECASE)
            if number_match:
                amount = int(number_match.group(1).replace(',', ''))
    
    # Simple emoji detection
    emoji_match = re.search(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]', goal_text)
    emoji = emoji_match.group(0) if emoji_match else "💰"
    
    # Extract description
    desc_patterns = [r'for (\w+)', r'to (\w+)', r'towards (\w+)']
    description = "goal"
    for pattern in desc_patterns:
        match = re.search(pattern, goal_text, re.IGNORECASE)
        if match:
            description = match.group(1).strip()
            break
    
    # Determine category
    category = "general"
    if "vacation" in goal_text.lower():
        category = "vacation"
    elif "emergency" in goal_text.lower():
        category = "emergency"
    elif "debt" in goal_text.lower():
        category = "debt"
    elif "invest" in goal_text.lower():
        category = "investing"
    elif "save" in goal_text.lower():
        category = "saving"
    
    return {
        "amount": amount,
        "emoji": emoji,
        "description": description,
        "category": category,
        "raw_text": goal_text
    }


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for frontend requests - allow all origins for development
    CORS(app, origins="*", supports_credentials=True)
    
    # Initialize database on startup
    try:
        print("Initializing database...")
        init_db()
        print("Database initialized successfully")
        # Test database connection
        test_goal = get_latest_goal("test_user")
        print(f"Database test query result: {test_goal}")
    except Exception as e:
        print(f"Database initialization error: {str(e)}")
        print("Continuing without database (will cause errors)")
    
    @app.route('/ready', methods=['GET'])
    def readiness():
        return 'ok', 200
    
    @app.route('/user-profile/<user_id>', methods=['GET'])
    def get_user_profile(user_id):
        try:
            print(f"DEBUG: Getting user profile for user_id: {user_id}")
            
            # Get JWT token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                print("DEBUG: No Authorization header")
                return jsonify({"error": "Authorization header required"}), 401
            
            headers = {"Authorization": auth_header}
            print(f"DEBUG: Using headers: {headers}")
            
            # Check if running locally (no Kubernetes services available)
            try:
                # Try to get balance and transactions with authentication
                print("DEBUG: Calling balancereader service...")
                balance_response = requests.get(f"http://balancereader:8080/balances/{user_id}", headers=headers, timeout=2)
                print(f"DEBUG: Balance response status: {balance_response.status_code}")
                balance_raw = balance_response.json() if balance_response.status_code == 200 else 0
                # Convert from cents to dollars
                balance = balance_raw / 100 if isinstance(balance_raw, (int, float)) else 0
                print(f"DEBUG: Balance (raw): {balance_raw}, Balance (converted): {balance}")
                
                print("DEBUG: Calling transactionhistory service...")
                history_response = requests.get(f"http://transactionhistory:8080/transactions/{user_id}", headers=headers, timeout=2)
                print(f"DEBUG: History response status: {history_response.status_code}")
                transactions = history_response.json() if history_response.status_code == 200 else []
                print(f"DEBUG: Transactions count: {len(transactions)}")
                
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                print(f"DEBUG: Running locally - using fake data: {e}")
                # Use fake data for local testing
                import random
                balance = random.choice([1500.0, 2500.0, 5000.0, 7500.0])
                transactions = [
                    {"amount": random.choice([-15.99, -8.50, -25.00, -12.75]), "description": random.choice(["Coffee", "Lunch", "Gas", "Groceries"])},
                    {"amount": random.choice([-45.00, -32.99, -67.50]), "description": random.choice(["Shopping", "Entertainment", "Dining"])},
                    {"amount": random.choice([-120.00, -89.99, -156.75]), "description": random.choice(["Utilities", "Phone bill", "Subscription"])}
                ]
                print(f"DEBUG: Using fake balance: {balance}, fake transactions: {len(transactions)}")
            
            # For demo purposes, if balance is 0 and user_id is 'demo_user', give them some demo balance
            if balance == 0 and user_id == 'demo_user':
                balance = 1500.00  # Demo balance for testing
                print(f"DEBUG: Setting demo balance for user {user_id}: {balance}")

            # For demo purposes, if no transactions and user_id is 'demo_user', add some demo transactions
            if len(transactions) == 0 and user_id == 'demo_user':
                transactions = [
                    {"amount": 2500, "fromAccountNum": "demo_user", "toAccountNum": "demo_user", "description": "Initial deposit"},
                    {"amount": -150, "fromAccountNum": "demo_user", "toAccountNum": "1011226112", "description": "Coffee purchase"},
                    {"amount": -75, "fromAccountNum": "demo_user", "toAccountNum": "1011226113", "description": "Lunch"}
                ]
                print(f"DEBUG: Setting demo transactions for user {user_id}: {len(transactions)} transactions")

            recent_transactions = transactions[:5]  # Get last 5 transactions for display

            # Get user's goal from database
            goal_row = get_latest_goal(user_id)
            user_goal = goal_row["goal_text"] if goal_row else None

            # Validate transaction data and convert amounts from cents to dollars
            valid_transactions = []
            for t in recent_transactions:
                if isinstance(t, dict) and 'amount' in t:
                    # Convert amount from cents to dollars
                    t_copy = t.copy()
                    if isinstance(t_copy['amount'], (int, float)):
                        t_copy['amount'] = t_copy['amount'] / 100
                    valid_transactions.append(t_copy)
            
            # Get user name from JWT token
            import jwt
            try:
                token = auth_header.replace('Bearer ', '')
                decoded = jwt.decode(token, options={"verify_signature": False})
                user_name = decoded.get('name', 'User')
            except:
                user_name = 'User'

            result = {
                "user_name": user_name,
                "balance": balance,
                "recent_transactions": valid_transactions,
                "user_goal": user_goal,
                "transaction_count": len(transactions)
            }
            print(f"DEBUG: Returning result: {result}")
            return jsonify(result), 200
            
        except Exception as e:
            print(f"DEBUG: Exception in get_user_profile: {str(e)}")
            return jsonify({"error": f"Failed to get user profile: {str(e)}"}), 500
    
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
            print(f"Attempting to get goal for user: {user_id}")
            goal_row = get_latest_goal(user_id)
            print(f"Goal row result: {goal_row}")
            
            if not goal_row:
                print("No goal found, returning None")
                return jsonify({
                    "goal": None,
                    "created_at": None,
                    "status": None,
                    "parsed_goal": None
                }), 200
            
            # Parse goal for frontend display
            parsed_goal = parse_goal(goal_row["goal_text"])
            print(f"Parsed goal: {parsed_goal}")
            
            return jsonify({
                "goal": goal_row["goal_text"],
                "created_at": goal_row["created_at"],
                "status": goal_row["status"],
                "parsed_goal": parsed_goal
            }), 200
            
        except Exception as e:
            print(f"Error in get_goal: {str(e)}")
            print(f"Exception type: {type(e)}")
            # Return a safe fallback instead of 500 error
            return jsonify({
                "goal": None,
                "created_at": None,
                "status": None,
                "parsed_goal": None,
                "error": str(e)
            }), 200
    
    @app.route('/challenges/<user_id>', methods=['GET'])
    def get_challenge(user_id):
        try:
            # Get JWT token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"error": "Authorization header required"}), 401
            
            headers = {"Authorization": auth_header}
            
            # Check if running locally (no Kubernetes services available)
            try:
                # Try to get balance and transactions with authentication
                balance_response = requests.get(f"http://balancereader:8080/balances/{user_id}", headers=headers, timeout=2)
                balance_raw = balance_response.json() if balance_response.status_code == 200 else 0
                # Convert from cents to dollars
                balance = balance_raw / 100 if isinstance(balance_raw, (int, float)) else 0
                
                history_response = requests.get(f"http://transactionhistory:8080/transactions/{user_id}", headers=headers, timeout=2)
                transactions = history_response.json() if history_response.status_code == 200 else []
                
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                print(f"DEBUG: Running locally - using fake data: {e}")
                # Use fake data for local testing
                import random
                balance = random.choice([1500.0, 2500.0, 5000.0, 7500.0])
                transactions = [
                    {"amount": random.choice([-15.99, -8.50, -25.00, -12.75]), "description": random.choice(["Coffee", "Lunch", "Gas", "Groceries"])},
                    {"amount": random.choice([-45.00, -32.99, -67.50]), "description": random.choice(["Shopping", "Entertainment", "Dining"])},
                    {"amount": random.choice([-120.00, -89.99, -156.75]), "description": random.choice(["Utilities", "Phone bill", "Subscription"])}
                ]
                print(f"DEBUG: Using fake balance: {balance}, fake transactions: {len(transactions)}")
            
            # For demo purposes, if balance is 0 and user_id is 'demo_user', give them some demo balance
            if balance == 0 and user_id == 'demo_user':
                balance = 1500.00  # Demo balance for testing
                print(f"DEBUG: Setting demo balance for user {user_id}: {balance}")

            # For demo purposes, if no transactions and user_id is 'demo_user', add some demo transactions
            if len(transactions) == 0 and user_id == 'demo_user':
                transactions = [
                    {"amount": 2500, "fromAccountNum": "demo_user", "toAccountNum": "demo_user", "description": "Initial deposit"},
                    {"amount": -150, "fromAccountNum": "demo_user", "toAccountNum": "1011226112", "description": "Coffee purchase"},
                    {"amount": -75, "fromAccountNum": "demo_user", "toAccountNum": "1011226113", "description": "Lunch"}
                ]
                print(f"DEBUG: Setting demo transactions for user {user_id}: {len(transactions)} transactions")

            recent_transactions = transactions[:20]

            # Get user's goal from database
            goal_row = get_latest_goal(user_id)
            user_goal = goal_row["goal_text"] if goal_row else None

            # Validate transaction data and calculate spending safely (convert amounts from cents to dollars)
            valid_transactions = []
            recent_spending = 0
            for t in recent_transactions:
                if isinstance(t, dict) and 'amount' in t:
                    # Convert amount from cents to dollars
                    t_copy = t.copy()
                    if isinstance(t_copy['amount'], (int, float)):
                        t_copy['amount'] = t_copy['amount'] / 100
                    valid_transactions.append(t_copy)
                    recent_spending += t_copy['amount']

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
                "title": challenge_data.get("title", ""),
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
        """Get achievement badges for user (AI-generated with fallback)"""
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
            
            # Try AI first, fallback to static achievements
            try:
                gemini = GeminiClient()
                achievements_data = gemini.generate_achievements(user_stats)
                if achievements_data and 'error' not in achievements_data:
                    return jsonify(achievements_data), 200
            except Exception as ai_error:
                print(f"AI achievements failed: {ai_error}")
            
            # Fallback to static achievements based on user stats
            achievements = generate_static_achievements(user_stats)
            return jsonify(achievements), 200
            
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

    @app.route('/additional-tasks/<user_id>', methods=['GET'])
    def get_additional_tasks(user_id):
        try:
            # Get JWT token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"error": "Authorization header required"}), 401
            
            headers = {"Authorization": auth_header}
            
            # Get user context for task generation
            balance_response = requests.get(f"http://balancereader:8080/balances/{user_id}", headers=headers)
            balance = balance_response.json() if balance_response.status_code == 200 else 0

            history_response = requests.get(f"http://transactionhistory:8080/transactions/{user_id}", headers=headers)
            transactions = history_response.json() if history_response.status_code == 200 else []

            # Get user goal from database
            goal_row = get_latest_goal(user_id)
            user_goal = goal_row["goal_text"] if goal_row else None

            # Generate additional tasks using Gemini
            gemini = GeminiClient()
            user_context = {
                'balance': balance,
                'recent_transactions': transactions[:10],  # Last 10 transactions
                'user_goal': user_goal
            }
            
            tasks = gemini.generate_additional_tasks(user_context)
            
            return jsonify({"tasks": tasks}), 200
            
        except Exception as e:
            return jsonify({"error": f"Failed to generate additional tasks: {str(e)}"}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
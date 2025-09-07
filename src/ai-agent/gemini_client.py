import requests
import os
import logging
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiClient:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.logger = logging.getLogger(__name__)
    
    def generate_challenge(self, user_profile, user_goal=None):
        balance = user_profile.get('balance', 0)
        transactions = user_profile.get('transactions', [])
        transaction_count = user_profile.get('transaction_count', 0)
        recent_spending = user_profile.get('recent_spending', 0)

        prompt = f"""
        Create a personalized financial challenge for a user with:
        - Current balance: ${balance}
        - Recent spending: ${recent_spending}
        - Recent transactions: {transactions}
        - Full transaction count: {transaction_count}
        - User goal: {user_goal if user_goal else "No specific goal set"}

        Return a JSON response with this exact structure:
        {{
            "challenge": "Specific actionable challenge text",
            "difficulty": "easy|medium|hard",
            "category": "save_money|invest_money|spend_less|track_expenses|earn_more",
            "xp_reward": 50,
            "time_to_complete": "1 day|1 week|1 month",
            "goal_recommendation": "How this challenge helps achieve their goal",
            "tips": ["Tip 1", "Tip 2", "Tip 3"]
        }}

        Categories:
        - save_money: Challenges about building savings
        - invest_money: Challenges about investing or growing money
        - spend_less: Challenges about reducing expenses
        - track_expenses: Challenges about monitoring spending
        - earn_more: Challenges about increasing income

        If user has a specific goal (like "buy a laptop for $1000"), make the challenge directly related to achieving that goal.
        Make the challenge specific to their spending patterns and financial situation.
        """
        
        try:
            response = requests.post(
                f"{self.base_url}/models/gemini-2.5-flash:generateContent",
                headers={
                    "x-goog-api-key": self.api_key,
                    "Content-Type": "application/json"
                },
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "maxOutputTokens": 200,
                        "temperature": 0.7
                    }
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                challenge_text = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Try to parse JSON response
                try:
                    challenge_data = json.loads(challenge_text.strip())
                    return challenge_data
                except json.JSONDecodeError:
                    # If JSON parsing fails, return structured fallback
                    return self._get_fallback_challenge(user_profile, user_goal)
            else:
                self.logger.error(f"Gemini API error: {response.text}")
                return self._get_fallback_challenge(user_profile, user_goal)
                
        except Exception as e:
            self.logger.error(f"Error calling Gemini API: {e}")
            return self._get_fallback_challenge(user_profile, user_goal)
    
    def _get_fallback_challenge(self, user_profile, user_goal=None):
        balance = user_profile.get('balance', 0)
        transaction_count = user_profile.get('transaction_count', 0)
        recent_spending = user_profile.get('recent_spending', 0)
        
        if balance > 1000:
            return {
                "challenge": f"Great! You have ${balance}. Try saving $100 this week!",
                "difficulty": "easy",
                "category": "save_money",
                "xp_reward": 50,
                "time_to_complete": "1 week",
                "goal_recommendation": "This helps build your emergency fund",
                "tips": ["Set up automatic transfers", "Track your progress daily", "Celebrate small wins"]
            }
        elif transaction_count > 10:
            return {
                "challenge": f"You've made {transaction_count} transactions. Try reducing to 5 this week!",
                "difficulty": "medium",
                "category": "spend_less",
                "xp_reward": 75,
                "time_to_complete": "1 week",
                "goal_recommendation": "Fewer transactions mean less impulse spending",
                "tips": ["Plan purchases in advance", "Use a shopping list", "Wait 24 hours before buying"]
            }
        elif recent_spending > 500:
            return {
                "challenge": f"You spent ${recent_spending} recently. Try to spend under $200 this week!",
                "difficulty": "hard",
                "category": "spend_less",
                "xp_reward": 100,
                "time_to_complete": "1 week",
                "goal_recommendation": "Reducing spending helps you reach your financial goals faster",
                "tips": ["Cook at home more", "Cancel unused subscriptions", "Find free entertainment"]
            }
        else:
            return {
                "challenge": "Track every expense for the next 3 days!",
                "difficulty": "easy",
                "category": "track_expenses",
                "xp_reward": 25,
                "time_to_complete": "3 days",
                "goal_recommendation": "Understanding your spending is the first step to financial control",
                "tips": ["Use a spending app", "Keep receipts", "Review daily"]
            }
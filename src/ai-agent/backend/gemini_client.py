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
                },
                timeout=10
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
    
    def parse_goal(self, goal_text):
        try:
            prompt = f"""
            Parse this financial goal text and extract key information:
            Goal: "{goal_text}"
            
            Return a JSON response with this exact structure:
            {{
                "amount": <number without $ symbol, or 0 if no amount found>,
                "emoji": "<most relevant emoji for this goal, or 💰 if none found>",
                "description": "<short description of what the goal is for, or 'goal' if unclear>",
                "category": "<saving, investing, budgeting, debt, emergency, vacation, or general>",
                "raw_text": "{goal_text}"
            }}
            
            Examples:
            - "Save $500 for vacation 🏖️" → {{"amount": 500, "emoji": "🏖️", "description": "vacation", "category": "vacation", "raw_text": "Save $500 for vacation 🏖️"}}
            - "Build emergency fund 💪" → {{"amount": 0, "emoji": "💪", "description": "emergency fund", "category": "emergency", "raw_text": "Build emergency fund 💪"}}
            - "Pay off credit card debt" → {{"amount": 0, "emoji": "💳", "description": "credit card debt", "category": "debt", "raw_text": "Pay off credit card debt"}}
            """
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }]
            }
            
            response = requests.post(
                f"{self.base_url}/models/gemini-2.5-flash:generateContent?key={self.api_key}",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Clean up the response text
                response_text = response_text.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                response_text = response_text.strip()
                
                parsed_goal = json.loads(response_text)
                return parsed_goal
            else:
                self.logger.error(f"Gemini API error for goal parsing: {response.text}")
                return self._get_fallback_goal_parsing(goal_text)
                
        except Exception as e:
            self.logger.error(f"Error parsing goal with Gemini: {e}")
            return self._get_fallback_goal_parsing(goal_text)

    def _get_fallback_goal_parsing(self, goal_text):
        """Fallback goal parsing if Gemini fails"""
        import re
        
        # Extract amount
        amount_match = re.search(r'\$([0-9,]+)', goal_text)
        amount = int(amount_match.group(1).replace(',', '')) if amount_match else 0
        
        # Simple emoji detection
        emoji_match = re.search(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]', goal_text)
        emoji = emoji_match.group(0) if emoji_match else "💰"
        
        # Extract description
        desc_patterns = [
            r'for (\w+)', r'to (\w+)', r'towards (\w+)'
        ]
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
    
    def generate_achievements(self, user_stats):
        """Generate personalized achievement badges based on user progress"""
        prompt = f"""
        Generate personalized achievement badges for a user with these stats:
        - Current XP: {user_stats.get('xp', 0)}
        - Current Level: {user_stats.get('level', 1)}
        - Completed Challenges: {user_stats.get('completed_challenges', 0)}
        - Current Streak: {user_stats.get('streak', 0)}
        - Days Active: {user_stats.get('days_active', 0)}
        - Total Goals Set: {user_stats.get('goals_set', 0)}

        Return a JSON response with this exact structure:
        {{
            "achievements": [
                {{
                    "id": "first_goal",
                    "name": "Goal Setter",
                    "emoji": "🎯",
                    "description": "Set your first financial goal",
                    "unlocked": true,
                    "unlocked_message": "Congratulations! You've taken the first step toward financial success!"
                }}
            ],
            "next_milestone": {{
                "name": "Next Achievement",
                "emoji": "🏆",
                "description": "What they need to do next",
                "progress": 0.7,
                "requirement": "Complete 5 more challenges"
            }}
        }}

        Create 6-8 achievements that feel personal and motivating. Make some unlocked based on their current stats.
        Include creative achievement names and make the unlocked_message feel personal and encouraging.
        """
        
        return self._make_request(prompt)
    
    def generate_streak_message(self, streak_data):
        """Generate motivational streak messages"""
        prompt = f"""
        Generate a personalized motivational message for a user's financial habit streak:
        - Current streak: {streak_data.get('current_streak', 0)} days
        - Longest streak: {streak_data.get('longest_streak', 0)} days
        - Last challenge completed: {streak_data.get('last_challenge', 'None')}
        - Recent progress: {streak_data.get('recent_progress', 'New user')}

        Return a JSON response with this exact structure:
        {{
            "motivational_message": "You're building amazing financial habits! Keep it up!",
            "streak_milestone": "Special message if they hit a milestone",
            "next_goal": "Focus on completing one challenge this week",
            "emoji": "🔥",
            "encouragement_level": "high"
        }}

        Make the message personal, encouraging, and specific to financial habits.
        If streak is 0, focus on starting fresh. If high streak, celebrate their consistency.
        """
        
        return self._make_request(prompt)
    
    def generate_leaderboard_context(self, user_stats, leaderboard_position):
        """Generate personalized leaderboard messages and insights"""
        prompt = f"""
        Generate personalized leaderboard insights for a user:
        - Current position: #{leaderboard_position}
        - User XP: {user_stats.get('xp', 0)}
        - User level: {user_stats.get('level', 1)}
        - Challenges completed this week: {user_stats.get('weekly_challenges', 0)}

        Return a JSON response with this exact structure:
        {{
            "position_message": "You're doing great! Currently ranked #{leaderboard_position}",
            "improvement_tip": "Complete more challenges to climb higher", 
            "weekly_goal": "Try to complete 3 challenges this week",
            "competitor_insight": "You're on track to advance your financial skills",
            "motivation_boost": "Every challenge completed makes you financially stronger!"
        }}

        Make it encouraging regardless of position. Focus on personal growth over competition.
        """
        
        return self._make_request(prompt)
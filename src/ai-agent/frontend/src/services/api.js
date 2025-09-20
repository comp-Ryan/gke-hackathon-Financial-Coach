import axios from 'axios';

class BankAPI {
  constructor(config) {
    this.bankUrl = config.bankUrl;
    this.jwtToken = config.jwtToken;
    this.userId = config.userId;
    
    // AI agent URL - in production this would be your deployed AI agent
    this.aiAgentUrl = process.env.REACT_APP_AI_AGENT_URL || 'http://localhost:8080';
    
    // Create axios instance with default headers
    this.apiClient = axios.create({
      headers: {
        'Authorization': `Bearer ${this.jwtToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  // AI Agent API calls
  async getGoal() {
    try {
      const response = await this.apiClient.get(`${this.aiAgentUrl}/goals/${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goal:', error);
      return { goal: null, parsed_goal: null };
    }
  }

  async setGoal(goal) {
    try {
      const response = await this.apiClient.post(`${this.aiAgentUrl}/goals/${this.userId}`, { goal });
      return response.data;
    } catch (error) {
      console.error('Error setting goal:', error);
      throw error;
    }
  }

  async getChallenge() {
    try {
      const response = await this.apiClient.get(`${this.aiAgentUrl}/challenges/${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      // Return mock challenge if API fails
      return {
        challenge: "Track your expenses for 3 days!",
        difficulty: "easy",
        category: "budgeting",
        xp_reward: 25,
        time_to_complete: "3 days",
        goal_recommendation: "Start with understanding your spending patterns",
        tips: ["Use a spending app", "Keep receipts", "Review daily"],
        user_balance: 0,
        recent_spending: 0,
        transaction_count: 0,
        user_goal: null
      };
    }
  }

  // Bank of Anthos API calls (optional for additional features)
  async getBalance() {
    try {
      const response = await this.apiClient.get(`${this.bankUrl}/balances/${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  async getTransactions() {
    try {
      const response = await this.apiClient.get(`${this.bankUrl}/transactions/${this.userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  // AI-powered gamification endpoints
  async getAchievements(userStats) {
    try {
      const params = new URLSearchParams(userStats).toString();
      const response = await this.apiClient.get(`${this.aiAgentUrl}/achievements/${this.userId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI achievements:', error);
      // Fallback to basic achievements
      return {
        achievements: [
          { id: 'first_goal', name: 'Getting Started', emoji: '🎯', description: 'Set your first goal', unlocked: true },
        ],
        next_milestone: { name: 'Challenge Master', emoji: '🏆', description: 'Complete 5 challenges', progress: 0.2 }
      };
    }
  }

  async getStreakMessage(streakData) {
    try {
      const params = new URLSearchParams(streakData).toString();
      const response = await this.apiClient.get(`${this.aiAgentUrl}/streak-message/${this.userId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI streak message:', error);
      return {
        motivational_message: "You're building great financial habits!",
        streak_milestone: "Keep up the great work!",
        next_goal: "Complete a challenge today",
        emoji: "🔥",
        encouragement_level: "medium"
      };
    }
  }

  async getLeaderboardContext(userStats, position) {
    try {
      const params = new URLSearchParams({ ...userStats, position }).toString();
      const response = await this.apiClient.get(`${this.aiAgentUrl}/leaderboard-context/${this.userId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI leaderboard context:', error);
      return {
        position_message: `You're ranked #${position}!`,
        improvement_tip: "Complete more challenges to advance",
        weekly_goal: "Try to complete 3 challenges this week",
        competitor_insight: "You're making great progress",
        motivation_boost: "Every challenge makes you stronger!"
      };
    }
  }

  // Health check
  async testConnection() {
    try {
      const response = await this.apiClient.get(`${this.aiAgentUrl}/ready`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default BankAPI;
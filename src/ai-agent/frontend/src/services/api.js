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
      timeout: 30000, // Increased to 30 seconds
      retry: 3,
      retryDelay: 1000
    });
  }

  // AI Agent API calls
  async getGoal() {
    try {
      const response = await this.apiClient.get(`${this.aiAgentUrl}/goals/${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goal:', error);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        console.warn('Goal API request timed out - using fallback');
      } else if (error.response?.status >= 500) {
        console.warn('Goal API server error - using fallback');
      }
      
      return { 
        goal: null, 
        parsed_goal: null,
        error: error.message,
        timeout: error.code === 'ECONNABORTED'
      };
    }
  }

  async setGoal(goal) {
    try {
      const response = await this.apiClient.post(`${this.aiAgentUrl}/goals/${this.userId}`, { goal });
      return response.data;
    } catch (error) {
      console.error('Error setting goal:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'ECONNABORTED') {
        const timeoutError = new Error('Request timed out. The server is taking too long to respond. Please try again.');
        timeoutError.code = 'TIMEOUT';
        timeoutError.userFriendly = true;
        throw timeoutError;
      } else if (error.response?.status >= 500) {
        const serverError = new Error('Server error. Please try again in a moment.');
        serverError.code = 'SERVER_ERROR';
        serverError.userFriendly = true;
        throw serverError;
      } else if (!navigator.onLine) {
        const networkError = new Error('No internet connection. Please check your network.');
        networkError.code = 'NETWORK_ERROR';
        networkError.userFriendly = true;
        throw networkError;
      }
      
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

  async getAdditionalTasks() {
    try {
      const response = await this.apiClient.get(`${this.aiAgentUrl}/additional-tasks/${this.userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching additional tasks:', error);
      // Return fallback tasks if API fails
      return {
        tasks: [
          {
            id: 1,
            icon: "💡",
            title: "Review Subscriptions",
            description: "Check for unused monthly subscriptions"
          },
          {
            id: 2,
            icon: "📊",
            title: "Analyze Spending", 
            description: "Review last week's top categories"
          },
          {
            id: 3,
            icon: "🎯",
            title: "Daily Save",
            description: "Skip one purchase, save $5-10"
          }
        ]
      };
    }
  }

  async getUserProfile() {
    try {
      console.log('DEBUG: Calling user profile API:', `${this.aiAgentUrl}/user-profile/${this.userId}`);
      const response = await this.apiClient.get(`${this.aiAgentUrl}/user-profile/${this.userId}`);
      console.log('DEBUG: User profile API response:', response.data);
      console.log('DEBUG: Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error; // Re-throw to show the actual error instead of hiding it
    }
  }
}

export default BankAPI;
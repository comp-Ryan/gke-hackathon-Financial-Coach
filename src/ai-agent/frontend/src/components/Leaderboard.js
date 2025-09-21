import React, { useState, useEffect } from 'react';

function Leaderboard({ userXP, userLevel, bankAPI, completedChallenges = 0 }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [aiContext, setAIContext] = useState({
    position_message: "Welcome to the leaderboard!",
    improvement_tip: "Complete challenges to climb higher",
    weekly_goal: "Try to complete 3 challenges this week",
    competitor_insight: "You're making great progress",
    motivation_boost: "Keep up the great work!"
  });
  const [, setUserPosition] = useState(3); // Position in leaderboard

  useEffect(() => {
    // Mock leaderboard data - in production this would come from your database
    const mockData = [
      { id: 1, name: 'Sarah Chen', level: userLevel + 2, xp: userXP + 250, badge: '💰' },
      { id: 2, name: 'Alex Johnson', level: userLevel + 1, xp: userXP + 120, badge: '🏆' },
      { id: 3, name: 'You', level: userLevel, xp: userXP, badge: '⭐', isCurrentUser: true },
      { id: 4, name: 'Emma Davis', level: Math.max(1, userLevel - 1), xp: Math.max(0, userXP - 80), badge: '🎯' },
      { id: 5, name: 'Mike Wilson', level: Math.max(1, userLevel - 1), xp: Math.max(0, userXP - 150), badge: '📈' }
    ];
    
    // Sort by XP descending
    const sorted = mockData.sort((a, b) => b.xp - a.xp);
    setLeaderboardData(sorted);
    
    // Find user position
    const position = sorted.findIndex(user => user.isCurrentUser) + 1;
    setUserPosition(position);
    
    // Fetch AI context
    const fetchAIContext = async () => {
      if (!bankAPI) return;
      
      const userStats = {
        xp: userXP,
        level: userLevel,
        weekly_challenges: Math.min(completedChallenges, 7) // Simulate weekly challenges
      };
      
      try {
        const context = await bankAPI.getLeaderboardContext(userStats, position);
        setAIContext(context);
      } catch (error) {
        console.error('Failed to fetch AI leaderboard context:', error);
      }
    };
    
    fetchAIContext();
  }, [userXP, userLevel, bankAPI, completedChallenges]);

  return (
    <div className="leaderboard-section">
      <div className="section-header">
        <h2>🏆 Leaderboard</h2>
        <p>{aiContext.position_message}</p>
      </div>
      
      {/* AI-generated insights */}
      <div className="ai-insights">
        <div className="insight-card">
          <h4>💡 Improvement Tip</h4>
          <p>{aiContext.improvement_tip}</p>
        </div>
        <div className="insight-card">
          <h4>🎯 Weekly Goal</h4>
          <p>{aiContext.weekly_goal}</p>
        </div>
        <div className="insight-card">
          <h4>🚀 Motivation</h4>
          <p>{aiContext.motivation_boost}</p>
        </div>
      </div>
      
      <div className="leaderboard-list">
        {(leaderboardData || []).map((user, index) => (
          <div 
            key={user.id} 
            className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
          >
            <div className="rank">#{index + 1}</div>
            <div className="user-info">
              <span className="badge">{user.badge}</span>
              <span className="name">{user.name}</span>
            </div>
            <div className="stats">
              <span className="level">L{user.level}</span>
              <span className="xp">{user.xp} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
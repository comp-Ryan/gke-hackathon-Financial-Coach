import React, { useState, useEffect, useCallback } from 'react';

function ChallengeList({ bankAPI, onXPGained, onChallengeCompleted }) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingNew, setFetchingNew] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  const fetchChallenge = useCallback(async () => {
    setLoading(true);
    setChallengeCompleted(false);
    try {
      const data = await bankAPI.getChallenge();
      setChallenge(data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      // Set a fallback challenge
      setChallenge({
        challenge: "Track your expenses for 3 days",
        difficulty: "easy",
        category: "budgeting",
        xp_reward: 25,
        time_to_complete: "3 days",
        goal_recommendation: "Start with understanding your spending patterns",
        tips: ["Use a spending app", "Keep receipts", "Review daily"],
        user_balance: 1500,
        recent_spending: 120,
        transaction_count: 8,
        user_goal: null
      });
    } finally {
      setLoading(false);
    }
  }, [bankAPI]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const handleNewChallenge = async () => {
    setFetchingNew(true);
    try {
      await fetchChallenge();
    } finally {
      setFetchingNew(false);
    }
  };

  const handleCompleteChallenge = () => {
    setChallengeCompleted(true);
    if (onXPGained && challenge?.xp_reward) {
      onXPGained(challenge.xp_reward);
    }
  };

  const getDifficultyLevel = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return { level: 'Easy', color: '#28a745' };
      case 'medium': return { level: 'Medium', color: '#ffc107' };
      case 'hard': return { level: 'Hard', color: '#dc3545' };
      default: return { level: 'Easy', color: '#28a745' };
    }
  };

  if (loading) {
    return (
      <div className="challenges-section">
        <h2>Today's Challenge</h2>
        <div className="loading">Generating your personalized challenge...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="challenges-section">
        <h2>Today's Challenge</h2>
        <div className="loading">Unable to load challenge. Please try again.</div>
        <button className="challenge-btn secondary" onClick={handleNewChallenge}>
          Retry
        </button>
      </div>
    );
  }

  const difficultyInfo = getDifficultyLevel(challenge.difficulty);

  return (
    <div className="challenges-section">
      <div className="section-header">
        <h2>Today's Challenge</h2>
        <button 
          className="challenge-btn secondary small" 
          onClick={handleNewChallenge}
          disabled={fetchingNew}
        >
          {fetchingNew ? 'Loading...' : 'New Challenge'}
        </button>
      </div>
      
      <div className="challenge-card">
        <div className="challenge-header">
          <h3 className="challenge-title">{challenge.challenge}</h3>
          <div className="challenge-meta">
            <span className="difficulty-badge" style={{ backgroundColor: difficultyInfo.color }}>
              {difficultyInfo.level}
            </span>
            <span className="xp-badge">
              {challenge.xp_reward} XP
            </span>
          </div>
        </div>
        
        <div className="challenge-details">
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{challenge.time_to_complete}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{challenge.category?.replace('_', ' ')}</span>
          </div>
        </div>
        
        {challenge.goal_recommendation && (
          <div className="recommendation">
            <h4>AI Recommendation</h4>
            <p>{challenge.goal_recommendation}</p>
          </div>
        )}
        
        {challenge.tips && challenge.tips.length > 0 && (
          <div className="tips">
            <h4>Tips to Succeed</h4>
            <ul>
              {(challenge?.tips || []).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="financial-context">
          <h4>Your Financial Context</h4>
          <div className="context-grid">
            <div className="context-item">
              <span className="context-label">Balance</span>
              <span className="context-value">${challenge.user_balance || 0}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Recent Spending</span>
              <span className="context-value">${challenge.recent_spending || 0}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Transactions</span>
              <span className="context-value">{challenge.transaction_count || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="challenge-actions">
          {!challengeCompleted ? (
            <button 
              className="challenge-btn primary" 
              onClick={handleCompleteChallenge}
            >
              Complete Challenge (+{challenge.xp_reward} XP)
            </button>
          ) : (
            <div className="completed-message">
              Challenge Completed! +{challenge.xp_reward} XP earned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChallengeList;
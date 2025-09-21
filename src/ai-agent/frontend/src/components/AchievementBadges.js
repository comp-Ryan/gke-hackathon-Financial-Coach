import React, { useState, useEffect } from 'react';

function AchievementBadges({ userXP, userLevel, completedChallenges = 0, bankAPI }) {
  const [achievementsData, setAchievementsData] = useState({ achievements: [], next_milestone: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!bankAPI) return;
      
      const userStats = {
        xp: userXP,
        level: userLevel,
        completed_challenges: completedChallenges,
        streak: parseInt(localStorage.getItem('currentStreak') || '0'),
        days_active: Math.floor((Date.now() - new Date(localStorage.getItem('firstVisit') || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        goals_set: localStorage.getItem('goalsSet') ? parseInt(localStorage.getItem('goalsSet')) : 0
      };
      
      try {
        const data = await bankAPI.getAchievements(userStats);
        setAchievementsData(data);
      } catch (error) {
        console.error('Failed to fetch AI achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userXP, userLevel, completedChallenges, bankAPI]);

  if (loading) {
    return (
      <div className="achievements-section">
        <div className="section-header">
          <h2>🏅 Loading Achievements...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-section">
      <div className="section-header">
        <h2>🏅 Achievements</h2>
        <p>Unlock badges by completing challenges and reaching milestones!</p>
      </div>
      
      <div className="badges-grid">
        {(achievementsData?.achievements || []).map(badge => (
          <div 
            key={badge.id} 
            className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}
            title={badge.description}
          >
            <div className="badge-emoji">{badge.emoji}</div>
            <div className="badge-name">{badge.name}</div>
            {!badge.unlocked && <div className="lock-overlay">🔒</div>}
            {badge.unlocked && badge.unlocked_message && (
              <div className="badge-tooltip">{badge.unlocked_message}</div>
            )}
          </div>
        ))}
      </div>
      
      {achievementsData?.next_milestone && (
        <div className="next-milestone">
          <h4>{achievementsData.next_milestone.emoji} {achievementsData.next_milestone.name}</h4>
          <p>{achievementsData.next_milestone.description}</p>
          <p><em>{achievementsData.next_milestone.requirement}</em></p>
        </div>
      )}
      
      <div className="progress-summary">
        <p>🎖️ Unlocked: <strong>{(achievementsData?.achievements || []).filter(a => a.unlocked).length}/{(achievementsData?.achievements || []).length}</strong> achievements</p>
      </div>
    </div>
  );
}

export default AchievementBadges;
import React, { useState, useEffect } from 'react';

function AchievementBadges({ userXP, userLevel, completedChallenges = 0, bankAPI, compact = false }) {
  const [achievementsData, setAchievementsData] = useState({ achievements: [], next_milestone: null });
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAchievements = async () => {
      // Fallback achievement data if API fails
      const fallbackAchievements = {
        achievements: [
          {
            id: 'welcome_aboard',
            name: 'Welcome Aboard!',
            emoji: '👋',
            description: 'Started your financial journey with BankQuest',
            unlocked: userXP > 0,
            unlocked_message: 'Welcome to BankQuest! Your financial journey begins now.',
            requirement: 'Complete any action'
          },
          {
            id: 'rising_star',
            name: 'Rising Star',
            emoji: '⭐',
            description: 'Earned your first 100 XP',
            unlocked: userXP >= 100,
            unlocked_message: 'Great progress! You\'re building momentum.',
            requirement: 'Earn 100 XP'
          },
          {
            id: 'challenge_accepted',
            name: 'Challenge Accepted',
            emoji: '🎯',
            description: 'Complete your first challenge',
            unlocked: completedChallenges > 0,
            unlocked_message: 'Excellent! You completed your first challenge.',
            requirement: 'Complete 1 challenge'
          },
          {
            id: 'challenge_master',
            name: 'Challenge Master',
            emoji: '🏆',
            description: 'Complete 5 challenges',
            unlocked: completedChallenges >= 5,
            unlocked_message: 'Amazing dedication to improving your finances!',
            requirement: 'Complete 5 challenges'
          },
          {
            id: 'streak_starter',
            name: 'Streak Starter',
            emoji: '🔥',
            description: 'Maintain a 3-day streak',
            unlocked: parseInt(localStorage.getItem('currentStreak') || '0') >= 3,
            unlocked_message: 'Consistency is key to financial success!',
            requirement: 'Maintain 3-day streak'
          },
          {
            id: 'week_warrior',
            name: 'Week Warrior',
            emoji: '💪',
            description: 'Stay active for a full week',
            unlocked: parseInt(localStorage.getItem('currentStreak') || '0') >= 7,
            unlocked_message: 'A full week of dedication! You\'re on fire!',
            requirement: 'Maintain 7-day streak'
          },
          {
            id: 'level_up',
            name: 'Level Up',
            emoji: '📈',
            description: 'Reach Level 3',
            unlocked: userLevel >= 3,
            unlocked_message: 'Level 3 achieved! You\'re making real progress.',
            requirement: 'Reach Level 3'
          },
          {
            id: 'goal_setter',
            name: 'Goal Setter',
            emoji: '💰',
            description: 'Set your first financial goal',
            unlocked: localStorage.getItem('goalsSet') && parseInt(localStorage.getItem('goalsSet')) > 0,
            unlocked_message: 'Smart thinking! Setting goals is crucial for success.',
            requirement: 'Set 1 financial goal'
          }
        ],
        next_milestone: null
      };
      
      if (!bankAPI) {
        setAchievementsData(fallbackAchievements);
        setLoading(false);
        return;
      }
      
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
        // Use fallback data if API fails
        setAchievementsData(fallbackAchievements);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userXP, userLevel, completedChallenges, bankAPI]);

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAchievement(null);
  };

  const getProgressPercentage = (achievement) => {
    if (achievement.unlocked) return 100;
    
    // Calculate progress based on achievement type
    const userStats = {
      xp: userXP,
      level: userLevel,
      completed_challenges: completedChallenges,
      streak: parseInt(localStorage.getItem('currentStreak') || '0'),
      days_active: Math.floor((Date.now() - new Date(localStorage.getItem('firstVisit') || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      goals_set: localStorage.getItem('goalsSet') ? parseInt(localStorage.getItem('goalsSet')) : 0
    };

    // Simple progress calculation based on achievement requirements
    if (achievement.requirement && achievement.requirement.includes('XP')) {
      const required = parseInt(achievement.requirement.match(/(\d+)/)?.[1] || '0');
      return Math.min((userStats.xp / required) * 100, 100);
    }
    if (achievement.requirement && achievement.requirement.includes('level')) {
      const required = parseInt(achievement.requirement.match(/(\d+)/)?.[1] || '0');
      return Math.min((userStats.level / required) * 100, 100);
    }
    if (achievement.requirement && achievement.requirement.includes('challenge')) {
      const required = parseInt(achievement.requirement.match(/(\d+)/)?.[1] || '0');
      return Math.min((userStats.completed_challenges / required) * 100, 100);
    }
    if (achievement.requirement && achievement.requirement.includes('streak')) {
      const required = parseInt(achievement.requirement.match(/(\d+)/)?.[1] || '0');
      return Math.min((userStats.streak / required) * 100, 100);
    }
    
    return 25; // Default progress for locked achievements
  };

  if (loading) {
    return (
      <div className="achievements-section">
        <div className="section-header">
          <h2>Loading Achievements...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`achievements-section ${compact ? 'compact' : ''}`}>
      <div className="section-header">
        <h2>Achievements</h2>
        <span className="achievements-count">
          {(achievementsData?.achievements || []).filter(a => a.unlocked).length}/{(achievementsData?.achievements || []).length} completed
        </span>
      </div>
      
      <div className="badges-grid">
        {(achievementsData?.achievements || []).map(badge => (
          <div 
            key={badge.id} 
            className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'} clickable`}
            title={`Click to view details: ${badge.description}`}
            onClick={() => handleAchievementClick(badge)}
          >
            <div className="badge-emoji">{badge.emoji}</div>
            <div className="badge-name">{badge.name}</div>
            {!badge.unlocked && (
              <div className="achievement-progress-mini">
                <div className="progress-bar-mini">
                  <div 
                    className="progress-fill-mini" 
                    style={{ width: `${getProgressPercentage(badge)}%` }}
                  />
                </div>
                <div className="lock-overlay">🔒</div>
              </div>
            )}
            {badge.unlocked && (
              <div className="completed-checkmark">✅</div>
            )}
          </div>
        ))}
      </div>

      {/* Achievement Details Modal */}
      {showModal && selectedAchievement && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="achievement-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <span className="modal-achievement-icon">{selectedAchievement.emoji}</span>
                <h3>{selectedAchievement.name}</h3>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className="achievement-modal-body">
              <div className="achievement-status-section">
                <div className="status-badge">
                  {selectedAchievement.unlocked ? (
                    <span className="status-unlocked">✅ Unlocked</span>
                  ) : (
                    <span className="status-locked">🔒 Locked</span>
                  )}
                </div>
                
                <div className="achievement-progress-section">
                  <h4>Progress</h4>
                  <div className="progress-bar-detailed">
                    <div 
                      className="progress-fill-detailed" 
                      style={{ width: `${getProgressPercentage(selectedAchievement)}%` }}
                    />
                  </div>
                  <p className="progress-text-detailed">
                    {Math.round(getProgressPercentage(selectedAchievement))}% Complete
                  </p>
                </div>
              </div>
              
              <div className="achievement-description-section">
                <h4>Description</h4>
                <p>{selectedAchievement.description}</p>
              </div>
              
              {selectedAchievement.requirement && (
                <div className="achievement-requirement-section">
                  <h4>How to Unlock</h4>
                  <p className="requirement-text">{selectedAchievement.requirement}</p>
                </div>
              )}
              
              {selectedAchievement.unlocked && selectedAchievement.unlocked_message && (
                <div className="achievement-unlocked-section">
                  <h4>🎉 Achievement Unlocked!</h4>
                  <p className="unlocked-message">{selectedAchievement.unlocked_message}</p>
                </div>
              )}
              
              {!selectedAchievement.unlocked && (
                <div className="achievement-tips-section">
                  <h4>💡 Tips</h4>
                  <ul>
                    {selectedAchievement.requirement && selectedAchievement.requirement.includes('challenge') && (
                      <li>Complete more challenges to progress towards this achievement</li>
                    )}
                    {selectedAchievement.requirement && selectedAchievement.requirement.includes('XP') && (
                      <li>Earn more XP by completing challenges and tasks</li>
                    )}
                    {selectedAchievement.requirement && selectedAchievement.requirement.includes('level') && (
                      <li>Level up by earning XP to unlock this achievement</li>
                    )}
                    {selectedAchievement.requirement && selectedAchievement.requirement.includes('streak') && (
                      <li>Maintain your daily streak to unlock this achievement</li>
                    )}
                    <li>Check back regularly to track your progress</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AchievementBadges;

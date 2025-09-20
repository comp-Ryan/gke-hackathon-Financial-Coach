import React, { useState } from 'react';
import GoalBar from './GoalBar';
import ChallengeList from './ChallengeList';
import Leaderboard from './Leaderboard';
import AchievementBadges from './AchievementBadges';
import StreakTracker from './StreakTracker';

function Dashboard({ bankAPI }) {
  const [userLevel, setUserLevel] = useState(() => {
    return parseInt(localStorage.getItem('userLevel') || '1', 10);
  });
  const [userXP, setUserXP] = useState(() => {
    return parseInt(localStorage.getItem('userXP') || '0', 10);
  });
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    return parseInt(localStorage.getItem('completedChallenges') || '0', 10);
  });
  const [notification, setNotification] = useState(null);

  // Track first visit for days active calculation
  if (!localStorage.getItem('firstVisit')) {
    localStorage.setItem('firstVisit', new Date().toISOString());
  }

  const xpForLevel = (level) => level * 100; // 100 XP per level
  const nextLevelXP = xpForLevel(userLevel + 1);

  const addXP = (xpGained) => {
    const newXP = userXP + xpGained;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    setUserXP(newXP);
    localStorage.setItem('userXP', newXP.toString());
    
    if (newLevel > userLevel) {
      setUserLevel(newLevel);
      localStorage.setItem('userLevel', newLevel.toString());
      setNotification(`Level Up! You are now Level ${newLevel}`);
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification(`+${xpGained} XP earned!`);
      setTimeout(() => setNotification(null), 2000);
    }
  };

  return (
    <div className="app">
      {/* Simple Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-title">Financial Coach</h1>
          <div className="nav-info">
            <span className="level-badge">Level {userLevel}</span>
            <span className="xp-text">{userXP}/{nextLevelXP} XP</span>
          </div>
        </div>
      </nav>

      {/* XP Notification */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <GoalBar bankAPI={bankAPI} />
        <ChallengeList 
          bankAPI={bankAPI} 
          onXPGained={addXP} 
          onChallengeCompleted={() => {
            const newCount = completedChallenges + 1;
            setCompletedChallenges(newCount);
            localStorage.setItem('completedChallenges', newCount.toString());
          }} 
        />
        
        {/* Gamification Grid */}
        <div className="gamification-grid">
          <div className="gamification-main">
            <Leaderboard 
              userXP={userXP} 
              userLevel={userLevel} 
              bankAPI={bankAPI}
              completedChallenges={completedChallenges}
            />
          </div>
          <div className="gamification-sidebar">
            <StreakTracker 
              bankAPI={bankAPI}
              completedChallenges={completedChallenges}
            />
            <AchievementBadges 
              userXP={userXP} 
              userLevel={userLevel} 
              completedChallenges={completedChallenges}
              bankAPI={bankAPI}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
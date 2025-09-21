import React, { useState, useEffect } from 'react';
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
  const [showGoalWidget, setShowGoalWidget] = useState(() => {
    return localStorage.getItem('showGoalWidget') !== 'false';
  });
  
  // Real user data from backend
  const [userProfile, setUserProfile] = useState({
    user_name: 'Loading...',
    balance: 0,
    recent_transactions: [],
    user_goal: null,
    transaction_count: 0
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Track first visit for days active calculation
  if (!localStorage.getItem('firstVisit')) {
    localStorage.setItem('firstVisit', new Date().toISOString());
  }

  // Fetch real user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (bankAPI) {
        try {
          setProfileLoading(true);
          const profileData = await bankAPI.getUserProfile();
          setUserProfile(profileData);
          console.log('Fetched user profile:', profileData);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [bankAPI]);

  // Register console commands
  useEffect(() => {
    const toggleGoalWidget = () => {
      const newVisibility = !showGoalWidget;
      setShowGoalWidget(newVisibility);
      localStorage.setItem('showGoalWidget', newVisibility.toString());
      console.log(`Goal widget ${newVisibility ? 'shown' : 'hidden'}`);
    };

    const hideGoalWidget = () => {
      setShowGoalWidget(false);
      localStorage.setItem('showGoalWidget', 'false');
      console.log('Goal widget hidden');
    };

    const showGoalWidget = () => {
      setShowGoalWidget(true);
      localStorage.setItem('showGoalWidget', 'true');
      console.log('Goal widget shown');
    };

    // Make commands globally available
    window.toggleGoals = toggleGoalWidget;
    window.hideGoals = hideGoalWidget;
    window.showGoals = showGoalWidget;

    // Log available commands
    console.log('🎯 BankQuest Console Commands:');
    console.log('- toggleGoals() - Toggle financial goals widget visibility');
    console.log('- hideGoals() - Hide financial goals widget');
    console.log('- showGoals() - Show financial goals widget');

    // Cleanup on unmount
    return () => {
      delete window.toggleGoals;
      delete window.hideGoals;
      delete window.showGoals;
    };
  }, [showGoalWidget]);

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
          <div className="nav-brand">
            <img src="/bankquest-logo.png" alt="BankQuest Logo" className="nav-logo" />
            <h1 className="nav-title">BankQuest</h1>
          </div>
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
      <main className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-left">
            <ChallengeList 
              bankAPI={bankAPI} 
              userProfile={userProfile}
              onXPGained={addXP} 
              onChallengeCompleted={() => {
                const newCount = completedChallenges + 1;
                setCompletedChallenges(newCount);
                localStorage.setItem('completedChallenges', newCount.toString());
              }}
            />
          </div>
          <div className="dashboard-middle">
            <StreakTracker 
              bankAPI={bankAPI}
              completedChallenges={completedChallenges}
              compact={true}
            />
            <Leaderboard 
              userXP={userXP} 
              userLevel={userLevel} 
              bankAPI={bankAPI}
              completedChallenges={completedChallenges}
            />
          </div>
          <div className="dashboard-right">
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">👤</div>
                </div>
                <div className="profile-info">
                  <h3>{profileLoading ? 'Loading...' : userProfile.user_name}</h3>
                  <p>Level {userLevel} • {userXP} XP</p>
                  {!profileLoading && (
                    <p className="balance-display">Balance: ${userProfile.balance.toLocaleString()}</p>
                  )}
                </div>
              </div>
              
              <div className="recent-transactions">
                <h4>Recent Activity</h4>
                <div className="transaction-list">
                  {profileLoading ? (
                    <div className="transaction-item">
                      <span className="transaction-desc">Loading transactions...</span>
                    </div>
                  ) : userProfile.recent_transactions.length > 0 ? (
                    userProfile.recent_transactions.slice(0, 3).map((transaction, index) => {
                      // Determine if this is an incoming (positive) or outgoing (negative) transaction
                      const isIncoming = transaction.fromAccountNum !== '1011226111';
                      const displayAmount = isIncoming ? transaction.amount : -transaction.amount;
                      const isPositive = displayAmount > 0;
                      
                      return (
                        <div key={index} className="transaction-item">
                          <span className="transaction-desc">
                            {isIncoming ? `Transfer from ${transaction.fromAccountNum}` : 
                             `Transfer to ${transaction.toAccountNum}`}
                          </span>
                          <span className={`transaction-amount ${isPositive ? 'positive' : 'negative'}`}>
                            {isPositive ? '+' : ''}${displayAmount.toFixed(2)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="transaction-item">
                      <span className="transaction-desc">No recent transactions</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <AchievementBadges 
              userXP={userXP} 
              userLevel={userLevel} 
              completedChallenges={completedChallenges}
              bankAPI={bankAPI}
              compact={true}
            />
          </div>
        </div>
      </main>

      {/* Sticky Goal Indicator - Bottom Right */}
      {showGoalWidget && <GoalBar bankAPI={bankAPI} sticky={true} />}
      
    </div>
  );
}

export default Dashboard;
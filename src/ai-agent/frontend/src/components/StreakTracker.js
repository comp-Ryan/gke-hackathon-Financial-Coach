import React, { useState, useEffect } from 'react';

function StreakTracker({ bankAPI, completedChallenges = 0 }) {
  const [currentStreak, setCurrentStreak] = useState(() => {
    return parseInt(localStorage.getItem('currentStreak') || '0', 10);
  });
  const [lastActiveDate, setLastActiveDate] = useState(() => {
    return localStorage.getItem('lastActiveDate') || '';
  });
  const [longestStreak, setLongestStreak] = useState(() => {
    return parseInt(localStorage.getItem('longestStreak') || '0', 10);
  });
  const [aiMessage, setAIMessage] = useState({
    motivational_message: "Start your financial journey today!",
    streak_milestone: "",
    next_goal: "Complete your first challenge",
    emoji: "✨",
    encouragement_level: "medium"
  });

  const today = new Date().toDateString();

  useEffect(() => {
    const fetchAIMessage = async () => {
      if (!bankAPI) return;
      
      const streakData = {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_challenge: localStorage.getItem('lastChallenge') || 'None',
        recent_progress: completedChallenges > 0 ? `Completed ${completedChallenges} challenges` : 'New user'
      };
      
      try {
        const message = await bankAPI.getStreakMessage(streakData);
        setAIMessage(message);
      } catch (error) {
        console.error('Failed to fetch AI streak message:', error);
      }
    };

    // Check if user was active yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActiveDate !== today) {
      if (lastActiveDate === yesterday.toDateString()) {
        // Continue streak
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > longestStreak) {
          setLongestStreak(newStreak);
          localStorage.setItem('longestStreak', newStreak.toString());
        }
      } else if (lastActiveDate !== today) {
        // Reset streak if more than a day passed
        setCurrentStreak(1);
      }
      
      setLastActiveDate(today);
      localStorage.setItem('currentStreak', currentStreak.toString());
      localStorage.setItem('lastActiveDate', today);
    }
    
    fetchAIMessage();
  }, [bankAPI, completedChallenges, currentStreak, longestStreak, lastActiveDate, today]);

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '✨';
  };

  // Moved to AI-generated messages, keeping for fallback
  // const getMotivationalMessage = (streak) => {
  //   if (streak >= 30) return "You're on fire! Incredible dedication!";
  //   if (streak >= 14) return "Two weeks strong! Keep it up!";
  //   if (streak >= 7) return "One week streak! You're building great habits!";
  //   if (streak >= 3) return "Nice momentum! Keep going!";
  //   if (streak >= 1) return "Great start! Come back tomorrow!";
  //   return "Start your streak today!";
  // };

  return (
    <div className="streak-section">
      <div className="streak-display">
        <div className="streak-emoji">{getStreakEmoji(currentStreak)}</div>
        <div className="streak-info">
          <div className="streak-number">{currentStreak}</div>
          <div className="streak-label">Day Streak</div>
        </div>
      </div>
      
      <div className="streak-message">
        <p>{aiMessage.motivational_message}</p>
        {aiMessage.streak_milestone && (
          <p><strong>{aiMessage.streak_milestone}</strong></p>
        )}
        <p><em>{aiMessage.next_goal}</em></p>
      </div>
      
      <div className="streak-stats">
        <div className="stat">
          <span className="stat-label">Longest Streak:</span>
          <span className="stat-value">{longestStreak} days</span>
        </div>
      </div>
      
      {/* Visual streak calendar */}
      <div className="streak-calendar">
        {[...Array(7)].map((_, i) => {
          const dayOffset = 6 - i;
          const date = new Date();
          date.setDate(date.getDate() - dayOffset);
          const isActive = dayOffset < currentStreak;
          
          return (
            <div 
              key={i} 
              className={`calendar-day ${isActive ? 'active' : ''}`}
              title={date.toDateString()}
            >
              <div className="day-label">{date.toLocaleDateString('en', { weekday: 'short' })}</div>
              <div className="day-dot">{isActive ? '🔥' : '⚪'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StreakTracker;
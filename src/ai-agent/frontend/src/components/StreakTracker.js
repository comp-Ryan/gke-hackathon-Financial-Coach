import React, { useState, useEffect } from 'react';

function StreakTracker({ bankAPI, completedChallenges = 0, compact = false }) {
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
  
  // Debug feature for testing streak progression

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

  // Get the actual streak to display
  const displayStreak = currentStreak;
  
  // Calculate gradient from white to orange based on progression to 7
  const getGradientIntensity = (streak) => {
    const maxStreak = 7;
    const intensity = Math.min(streak / maxStreak, 1); // 0 to 1
    
    if (streak === 0) {
      // White background for streak 0
      return {
        backgroundColor: 'white',
        gradient: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        intensity: 0,
        textColor: '#2c3e50'
      };
    }
    
    // Gradient from light orange to intense orange-red
    const white = [255, 255, 255];      // #ffffff (start)
    const lightOrange = [255, 183, 77]; // #ffb74d (middle)
    const darkOrange = [255, 87, 34];   // #ff5722 (end)
    
    let r, g, b;
    if (intensity <= 0.5) {
      // White to light orange
      const localIntensity = intensity * 2; // 0 to 1
      r = Math.round(white[0] + (lightOrange[0] - white[0]) * localIntensity);
      g = Math.round(white[1] + (lightOrange[1] - white[1]) * localIntensity);
      b = Math.round(white[2] + (lightOrange[2] - white[2]) * localIntensity);
    } else {
      // Light orange to dark orange
      const localIntensity = (intensity - 0.5) * 2; // 0 to 1
      r = Math.round(lightOrange[0] + (darkOrange[0] - lightOrange[0]) * localIntensity);
      g = Math.round(lightOrange[1] + (darkOrange[1] - lightOrange[1]) * localIntensity);
      b = Math.round(lightOrange[2] + (darkOrange[2] - lightOrange[2]) * localIntensity);
    }
    
    return {
      backgroundColor: `rgb(${r}, ${g}, ${b})`,
      gradient: `linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.max(r-20, 0)}, ${Math.max(g-20, 0)}, ${Math.max(b-20, 0)}) 100%)`,
      intensity: intensity,
      textColor: intensity < 0.3 ? '#2c3e50' : 'white'
    };
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '✨';
  };
  
  // Debug functions

  // Moved to AI-generated messages, keeping for fallback
  // const getMotivationalMessage = (streak) => {
  //   if (streak >= 30) return "You're on fire! Incredible dedication!";
  //   if (streak >= 14) return "Two weeks strong! Keep it up!";
  //   if (streak >= 7) return "One week streak! You're building great habits!";
  //   if (streak >= 3) return "Nice momentum! Keep going!";
  //   if (streak >= 1) return "Great start! Come back tomorrow!";
  //   return "Start your streak today!";
  // };

  const gradientStyle = getGradientIntensity(displayStreak);

  if (compact) {
    return (
      <div 
        className="streak-section compact" 
        style={{ 
          background: gradientStyle.gradient,
          color: gradientStyle.textColor
        }}
      >
        <div className="streak-compact-header">
          <h4 style={{ color: gradientStyle.textColor }}>{getStreakEmoji(displayStreak)} {displayStreak} Day Streak</h4>
        </div>
        <div className="streak-calendar compact">
          {[...Array(7)].map((_, i) => {
            const dayOffset = 6 - i;
            const date = new Date();
            date.setDate(date.getDate() - dayOffset);
            const isActive = dayOffset < displayStreak;
            
            return (
              <div 
                key={i} 
                className={`calendar-day small ${isActive ? 'active' : ''}`}
              >
                <div 
                  className="day-label" 
                  style={{ color: gradientStyle.textColor }}
                >
                  {date.toLocaleDateString('en', { weekday: 'narrow' })}
                </div>
                <div className="day-dot">{isActive ? '🔥' : '⚪'}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="streak-section"
      style={{ 
        background: gradientStyle.gradient,
        color: gradientStyle.textColor
      }}
    >
      <div className="streak-display">
        <div className="streak-emoji">{getStreakEmoji(displayStreak)}</div>
        <div className="streak-info">
          <div className="streak-number" style={{ color: gradientStyle.textColor }}>{displayStreak}</div>
          <div className="streak-label" style={{ color: gradientStyle.textColor }}>
            Day Streak
          </div>
        </div>
      </div>
      
      <div className="streak-message">
        <p style={{ color: gradientStyle.textColor }}>{aiMessage.motivational_message}</p>
        {aiMessage.streak_milestone && (
          <p style={{ color: gradientStyle.textColor }}><strong>{aiMessage.streak_milestone}</strong></p>
        )}
        <p style={{ color: gradientStyle.textColor }}><em>{aiMessage.next_goal}</em></p>
      </div>
      
      <div className="streak-stats">
        <div className="stat">
          <span className="stat-label" style={{ color: gradientStyle.textColor }}>Longest Streak:</span>
          <span className="stat-value" style={{ color: gradientStyle.textColor }}>{longestStreak} days</span>
        </div>
        <div className="stat">
          <span className="stat-label" style={{ color: gradientStyle.textColor }}>Progress to 7:</span>
          <span className="stat-value" style={{ color: gradientStyle.textColor }}>{Math.round(gradientStyle.intensity * 100)}%</span>
        </div>
      </div>
      
      {/* Visual streak calendar */}
      <div className="streak-calendar">
        {[...Array(7)].map((_, i) => {
          const dayOffset = 6 - i;
          const date = new Date();
          date.setDate(date.getDate() - dayOffset);
          const isActive = dayOffset < displayStreak;
          
          return (
            <div 
              key={i} 
              className={`calendar-day ${isActive ? 'active' : ''}`}
              title={date.toDateString()}
            >
              <div 
                className="day-label" 
                style={{ color: gradientStyle.textColor }}
              >
                {date.toLocaleDateString('en', { weekday: 'short' })}
              </div>
              <div className="day-dot">{isActive ? '🔥' : '⚪'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StreakTracker;
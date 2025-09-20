import React, { useState, useEffect } from 'react';

function GoalBar({ bankAPI }) {
  const [goal, setGoal] = useState(null);
  const [parsedGoal, setParsedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  const [settingGoal, setSettingGoal] = useState(false);
  const [progress, setProgress] = useState(() => {
    return parseInt(localStorage.getItem('goalProgress') || '0', 10);
  });

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    setLoading(true);
    try {
      const data = await bankAPI.getGoal();
      setGoal(data.goal);
      setParsedGoal(data.parsed_goal);
    } catch (error) {
      console.error('Error fetching goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetGoal = async () => {
    if (!newGoal.trim()) return;
    
    setSettingGoal(true);
    try {
      await bankAPI.setGoal(newGoal);
      await fetchGoal();
      setNewGoal('');
      setProgress(0); // Reset progress for new goal
      localStorage.setItem('goalProgress', '0');
    } catch (error) {
      console.error('Error setting goal:', error);
      alert('Failed to set goal. Please try again.');
    } finally {
      setSettingGoal(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSetGoal();
    }
  };

  const updateProgress = (newProgress) => {
    setProgress(newProgress);
    localStorage.setItem('goalProgress', newProgress.toString());
  };

  if (loading) {
    return (
      <div className="goal-section">
        <div className="loading">Loading your financial goal...</div>
      </div>
    );
  }

  if (!goal || !parsedGoal) {
    return (
      <div className="goal-section">
        <div className="goal-header">
          <h2>Set Your Financial Goal</h2>
          <p>Define a specific target to work towards</p>
        </div>
        
        <div className="goal-input-group">
          <input
            type="text"
            className="goal-input"
            placeholder="e.g., Save $500 for vacation"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="goal-btn primary" 
            onClick={handleSetGoal}
            disabled={settingGoal || !newGoal.trim()}
          >
            {settingGoal ? 'Setting...' : 'Set Goal'}
          </button>
        </div>
      </div>
    );
  }

  const savedAmount = Math.floor((parsedGoal.amount * progress) / 100);
  const description = parsedGoal.description || 'goal';
  const amount = parsedGoal.amount || 0;

  return (
    <div className="goal-section">
      <div className="goal-header">
        <h2>Current Goal</h2>
        <p>Save ${amount} for {description}</p>
      </div>
      
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          <div className="progress-text">
            {progress}% Complete
          </div>
        </div>
        
        <div className="progress-details">
          <span className="saved-amount">${savedAmount} saved</span>
          <span className="remaining-amount">${amount - savedAmount} remaining</span>
        </div>
      </div>

      <div className="progress-controls">
        <button 
          className="progress-btn"
          onClick={() => updateProgress(Math.max(0, progress - 5))}
          disabled={progress <= 0}
        >
          -5%
        </button>
        <button 
          className="progress-btn"
          onClick={() => updateProgress(Math.min(100, progress + 5))}
          disabled={progress >= 100}
        >
          +5%
        </button>
      </div>

      <div className="goal-actions">
        <input
          type="text"
          className="goal-input"
          placeholder="Update your goal..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="goal-btn secondary" 
          onClick={handleSetGoal}
          disabled={settingGoal || !newGoal.trim()}
        >
          {settingGoal ? 'Updating...' : 'Update Goal'}
        </button>
      </div>
    </div>
  );
}

export default GoalBar;
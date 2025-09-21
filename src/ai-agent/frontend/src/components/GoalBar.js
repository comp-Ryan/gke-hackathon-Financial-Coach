import React, { useState, useEffect, useCallback } from 'react';

function GoalBar({ bankAPI, sticky = false }) {
  const [goal, setGoal] = useState(null);
  const [parsedGoal, setParsedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showGoalManager, setShowGoalManager] = useState(false);
  const [savedGoals, setSavedGoals] = useState(() => {
    const saved = localStorage.getItem('savedGoals');
    return saved ? JSON.parse(saved) : [];
  });
  const [newGoalInput, setNewGoalInput] = useState('');
  const [settingGoal, setSettingGoal] = useState(false);
  const [progress, setProgress] = useState(() => {
    return parseInt(localStorage.getItem('goalProgress') || '0', 10);
  });
  const [savedAmount, setSavedAmount] = useState(() => {
    return parseInt(localStorage.getItem('savedAmount') || '0', 10);
  });
  const [amountInput, setAmountInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const fetchGoal = useCallback(async () => {
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
  }, [bankAPI]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const handleSetGoal = async () => {
    if (!newGoal.trim()) return;
    
    setSettingGoal(true);
    try {
      // Get the parsed goal data directly from the API call
      const goalData = await bankAPI.setGoal(newGoal);
      await fetchGoal();
      
      // Auto-save to goals list when setting a goal with emoji
      const emoji = await getGoalEmoji(newGoal);
      
      // Use the fresh parsed goal from the API response, not the state
      const apiParsedData = goalData.parsed_goal || { description: newGoal, amount: 0 };
      const finalParsedData = { ...apiParsedData, emoji };
      console.log('Saving new goal:', newGoal, 'Final parsed data:', finalParsedData);
      
      // Mark this as the active goal in the saved goals
      const newSavedGoal = {
        id: Date.now().toString(),
        text: newGoal,
        parsed: finalParsedData,
        createdAt: new Date().toISOString(),
        isActive: true,
        savedAmount: 0,
        progress: 0,
        completed: false
      };
      
      // Update all existing goals to inactive and add the new active one
      const updatedGoals = savedGoals.map(g => ({ ...g, isActive: false }));
      updatedGoals.push(newSavedGoal);
      setSavedGoals(updatedGoals);
      localStorage.setItem('savedGoals', JSON.stringify(updatedGoals));
      
      setNewGoal('');
      setProgress(0); // Reset progress for new goal
      setSavedAmount(0); // Reset saved amount for new goal
      localStorage.setItem('goalProgress', '0');
      localStorage.setItem('savedAmount', '0');
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

  const updateSavedAmount = (amount, isAddition = true) => {
    const goalAmount = parsedGoal?.amount || 1;
    let newSavedAmount = isAddition ? savedAmount + amount : savedAmount - amount;
    
    // Don't allow negative saved amounts
    newSavedAmount = Math.max(0, newSavedAmount);
    // Don't allow saving more than the goal
    newSavedAmount = Math.min(newSavedAmount, goalAmount);
    
    const newProgress = Math.round((newSavedAmount / goalAmount) * 100);
    
    setSavedAmount(newSavedAmount);
    setProgress(newProgress);
    
    localStorage.setItem('savedAmount', newSavedAmount.toString());
    localStorage.setItem('goalProgress', newProgress.toString());
    
    // Check if goal is completed
    const isCompleted = newSavedAmount >= goalAmount && goalAmount > 0;
    
    // Update the specific goal in savedGoals
    const updatedGoals = savedGoals.map(g => 
      g.isActive ? { ...g, savedAmount: newSavedAmount, progress: newProgress, completed: isCompleted } : g
    );
    setSavedGoals(updatedGoals);
    localStorage.setItem('savedGoals', JSON.stringify(updatedGoals));
    
    // Celebrate completion!
    if (isCompleted && !savedGoals.find(g => g.isActive)?.completed) {
      setTimeout(() => {
        alert('🎉 Congratulations! You completed your goal! 🎉');
      }, 500);
    }
  };

  const handleSaveMoneyInput = () => {
    const amount = parseInt(amountInput) || 0;
    if (amount > 0) {
      updateSavedAmount(amount, true);
      setAmountInput('');
    }
  };

  const handleLostMoneyInput = () => {
    const amount = parseInt(amountInput) || 0;
    if (amount > 0) {
      updateSavedAmount(amount, false);
      setAmountInput('');
    }
  };

  const handleCancelGoal = async () => {
    setShowCancelConfirm(false);
    setGoal(null);
    setParsedGoal(null);
    setProgress(0);
    setSavedAmount(0);
    localStorage.removeItem('goalProgress');
    localStorage.removeItem('savedAmount');
    
    // Mark current goal as inactive in saved goals
    const updatedGoals = savedGoals.map(g => ({
      ...g,
      isActive: false
    }));
    setSavedGoals(updatedGoals);
    localStorage.setItem('savedGoals', JSON.stringify(updatedGoals));
    
    // If there are other saved goals, show the goal manager automatically
    if (updatedGoals.length > 0) {
      setShowGoalManager(true);
      setExpanded(true); // Ensure modal stays expanded to show goal manager
    } else {
      // No goals left, close everything
      setShowGoalManager(false);
      setExpanded(false);
    }
    
    // Could also call API to delete goal from backend if needed
  };

  const saveGoalToList = (goalText, parsedData) => {
    const goalId = Date.now().toString();
    const newSavedGoal = {
      id: goalId,
      text: goalText,
      parsed: parsedData,
      createdAt: new Date().toISOString(),
      isActive: false,
      savedAmount: 0,
      progress: 0,
      completed: false
    };
    
    const updatedGoals = [...savedGoals, newSavedGoal];
    setSavedGoals(updatedGoals);
    localStorage.setItem('savedGoals', JSON.stringify(updatedGoals));
  };

  const deleteGoalFromList = (goalId) => {
    const goalToDelete = savedGoals.find(g => g.id === goalId);
    const updatedGoals = savedGoals.filter(g => g.id !== goalId);
    
    console.log('Deleting goal:', goalToDelete?.text, 'Remaining goals:', updatedGoals.length);
    
    setSavedGoals(updatedGoals);
    localStorage.setItem('savedGoals', JSON.stringify(updatedGoals));
    
    // If we deleted the active goal, set another goal as active or clear active goal
    if (goalToDelete?.isActive) {
      if (updatedGoals.length > 0) {
        // Set the first available goal as active
        const newActiveGoal = updatedGoals[0];
        setActiveGoal(newActiveGoal);
      } else {
        // No goals left, clear everything and close goal manager
        setGoal(null);
        setParsedGoal(null);
        setProgress(0);
        setSavedAmount(0);
        setShowGoalManager(false);
        setExpanded(false);
        localStorage.removeItem('goalProgress');
        localStorage.removeItem('savedAmount');
      }
    }
    
    // If no goals left at all, also clear everything (in case non-active goal was deleted)
    if (updatedGoals.length === 0) {
      setGoal(null);
      setParsedGoal(null);
      setProgress(0);
      setSavedAmount(0);
      setShowGoalManager(false);
      setExpanded(false);
      localStorage.removeItem('goalProgress');
      localStorage.removeItem('savedAmount');
    }
    
    setShowDeleteConfirm(null);
  };

  const setActiveGoal = async (savedGoal) => {
    try {
      const data = await bankAPI.setGoal(savedGoal.text);
      setGoal(savedGoal.text);
      
      // Use saved parsed goal data if available, otherwise use fresh API data
      const goalParsedData = savedGoal.parsed || data.parsed_goal || { description: savedGoal.text, amount: 0 };
      setParsedGoal(goalParsedData);
      console.log('Setting active goal:', savedGoal.text, 'Parsed data:', goalParsedData);
      setShowGoalManager(false);
      
      // Restore saved amount and progress for this goal
      const goalSavedAmount = savedGoal.savedAmount || 0;
      const goalProgress = savedGoal.progress || 0;
      
      setSavedAmount(goalSavedAmount);
      setProgress(goalProgress);
      localStorage.setItem('savedAmount', goalSavedAmount.toString());
      localStorage.setItem('goalProgress', goalProgress.toString());
      
      // Mark this goal as active in saved goals
      const updatedGoals = savedGoals.map(g => ({
        ...g,
        isActive: g.id === savedGoal.id
      }));
      setSavedGoals(updatedGoals);
      localStorage.setItem('savedGoals', JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error setting active goal:', error);
    }
  };

  const getGoalEmoji = async (goalText) => {
    setIsGeminiLoading(true);
    try {
      // Simple emoji generation prompt for Gemini
      const response = await fetch(`${bankAPI.aiAgentUrl}/generate-emoji`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: goalText
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.emoji || '💰';
      }
    } catch (error) {
      console.error('Error getting emoji:', error);
    } finally {
      setIsGeminiLoading(false);
    }
    
    // Fallback emoji logic
    const lowerGoal = goalText.toLowerCase();
    if (lowerGoal.includes('vacation') || lowerGoal.includes('travel')) return '🌴';
    if (lowerGoal.includes('car') || lowerGoal.includes('vehicle')) return '🚗';
    if (lowerGoal.includes('house') || lowerGoal.includes('home')) return '🏠';
    if (lowerGoal.includes('wedding')) return '💍';
    if (lowerGoal.includes('emergency')) return '🛡️';
    if (lowerGoal.includes('phone') || lowerGoal.includes('laptop') || lowerGoal.includes('computer')) return '📱';
    if (lowerGoal.includes('education') || lowerGoal.includes('school')) return '🎓';
    return '💰';
  };

  const addNewGoalToList = async () => {
    if (!newGoalInput.trim()) return;
    
    try {
      const emoji = await getGoalEmoji(newGoalInput);
      // Parse the goal through the backend to get proper amount
      const data = await bankAPI.setGoal(newGoalInput);
      const backendParsedData = data.parsed_goal || { description: newGoalInput, amount: 0 };
      const finalParsedData = { ...backendParsedData, emoji };
      console.log('Adding goal to list:', newGoalInput, 'Backend parsed data:', backendParsedData, 'Final parsed data:', finalParsedData);
      saveGoalToList(newGoalInput, finalParsedData);
      setNewGoalInput('');
    } catch (error) {
      // Save even if parsing fails
      const emoji = await getGoalEmoji(newGoalInput);
      saveGoalToList(newGoalInput, { description: newGoalInput, amount: 0, emoji });
      setNewGoalInput('');
    }
  };

  if (loading) {
    // Don't show loading state for sticky mode
    if (sticky) return null;
    return (
      <div className="goal-section">
        <div className="loading">Loading your financial goal...</div>
      </div>
    );
  }

  if (!goal || !parsedGoal) {
    // Sticky mode shows goal manager if there are saved goals, otherwise goal setting interface
    if (sticky) {
      return (
        <div className={`goal-sticky no-goal ${expanded ? 'expanded' : 'collapsed'}`}>
          <div className="goal-sticky-header" onClick={() => setExpanded(!expanded)}>
            <div className="goal-sticky-compact">
              <span className="goal-sticky-title">💰 Set Financial Goal</span>
              <p className="goal-sticky-subtitle">Track your savings progress</p>
            </div>
            <button className="goal-sticky-toggle">
              {expanded ? '▼' : '▲'}
            </button>
          </div>
          
          {expanded && !showGoalManager && (
            <div className="goal-sticky-expanded">
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
            className="goal-btn primary small" 
            onClick={handleSetGoal}
            disabled={settingGoal || !newGoal.trim() || isGeminiLoading}
          >
            {settingGoal ? 'Setting...' : isGeminiLoading ? '🤖 Generating...' : 'Set Goal'}
          </button>
              </div>
              
              {savedGoals.length > 0 && (
                <div className="goal-actions-buttons">
                  <button 
                    className="goal-btn secondary small"
                    onClick={() => setShowGoalManager(true)}
                  >
                    Choose from {savedGoals.length} Saved Goal{savedGoals.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {expanded && showGoalManager && (
            <div className="goal-manager">
              {/* Progress bar with back button */}
              <div className="goal-manager-progress">
                <div className="goal-sticky-progress">
                  <div className="goal-sticky-bar">
                    <div 
                      className="goal-sticky-fill" 
                      style={{ width: `0%` }}
                    />
                  </div>
                  <span className="goal-sticky-text">Tasks</span>
                </div>
                <button 
                  className="goal-manager-back"
                  onClick={() => setShowGoalManager(false)}
                >
                  ← Back to Goals
                </button>
              </div>
              
              <div className="goal-list-clean">
                {savedGoals.length === 0 ? (
                  <p className="no-goals">No saved goals yet</p>
                ) : (
                  savedGoals.map(savedGoal => (
                    <div key={savedGoal.id} className={`goal-item-clean ${savedGoal.isActive ? 'active' : ''}`}>
                      <div className="goal-item-info">
                        <span className="goal-item-title">
                          {savedGoal.parsed?.emoji || '💰'} {savedGoal.text}
                        </span>
                        <span className="goal-item-price">
                          ${savedGoal.savedAmount || 0} / ${savedGoal.parsed?.amount || 0}
                        </span>
                      </div>
                      <div className="goal-item-buttons">
                        <button
                          className="goal-btn-clean primary"
                          onClick={() => setActiveGoal(savedGoal)}
                        >
                          Active
                        </button>
                        <button
                          className="goal-btn-clean delete"
                          onClick={() => setShowDeleteConfirm(savedGoal.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="add-goal-section">
                <input
                  type="text"
                  className="goal-input small"
                  placeholder="Add new goal..."
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewGoalToList()}
                />
                <button
                  className="goal-btn primary small"
                  onClick={addNewGoalToList}
                  disabled={!newGoalInput.trim() || isGeminiLoading}
                >
                  {isGeminiLoading ? '🤖 Generating...' : 'Add Goal'}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
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
            disabled={settingGoal || !newGoal.trim() || isGeminiLoading}
          >
            {settingGoal ? 'Setting...' : isGeminiLoading ? '🤖 Generating...' : 'Set Goal'}
          </button>
        </div>
      </div>
    );
  }

  const description = parsedGoal.description || 'goal';
  const amount = parsedGoal.amount || 0;
  const isCompleted = savedAmount >= amount && amount > 0;

  // Sticky mode - compact version
  if (sticky) {
    return (
      <div className={`goal-sticky ${expanded ? 'expanded' : 'collapsed'} ${isCompleted ? 'completed' : ''}`}>
        <div className="goal-sticky-header" onClick={() => setExpanded(!expanded)}>
          <div className="goal-sticky-compact">
            <span className="goal-sticky-title">
              {isCompleted ? '✅' : '💰'} {isCompleted ? `${description} - Completed!` : description}
            </span>
            <div className="goal-sticky-progress">
              <div className="goal-sticky-bar">
                <div 
                  className="goal-sticky-fill" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="goal-sticky-text">{progress}%</span>
            </div>
          </div>
          <button className="goal-sticky-toggle">
            {expanded ? '▼' : '▲'}
          </button>
        </div>
        
        {expanded && !showGoalManager && (
          <div className="goal-sticky-expanded">
            <div className="goal-sticky-details">
              {isCompleted ? (
                <p>🎉 Goal Completed! You saved ${amount} for {description}!</p>
              ) : (
                <p>Save ${amount} for {description}</p>
              )}
              <div className="progress-details">
                {isCompleted ? (
                  <span className="completion-message">✅ Fully funded!</span>
                ) : (
                  <>
                    <span className="saved-amount">${savedAmount} saved</span>
                    <span className="remaining-amount">${amount - savedAmount} remaining</span>
                  </>
                )}
              </div>
            </div>
            
            {!isCompleted && (
              <div className="progress-controls">
                <input
                  type="number"
                  className="amount-input"
                  placeholder="Amount $"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  min="0"
                />
                <div className="amount-buttons">
                  <button 
                    className="progress-btn small save"
                    onClick={handleSaveMoneyInput}
                    disabled={!amountInput || parseInt(amountInput) <= 0}
                  >
                    💰 Saved
                  </button>
                  <button 
                    className="progress-btn small lost"
                    onClick={handleLostMoneyInput}
                    disabled={!amountInput || parseInt(amountInput) <= 0}
                  >
                    💸 Lost
                  </button>
                </div>
              </div>
            )}
            
            {isCompleted && (
              <div className="completion-controls">
                <p className="completion-celebration">🎉 Amazing work! Your goal is complete! 🎉</p>
              </div>
            )}
            
            <div className="goal-actions-buttons">
              {!isCompleted && (
                <>
                  <button 
                    className="goal-btn secondary small"
                    onClick={() => setShowGoalManager(true)}
                  >
                    Choose Other Goals
                  </button>
                  <button 
                    className="goal-btn cancel small"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    Cancel Goal
                  </button>
                </>
              )}
              {isCompleted && (
                <button 
                  className="goal-btn secondary small"
                  onClick={() => setShowGoalManager(true)}
                >
                  ✅ Goal Complete - Choose Another?
                </button>
              )}
            </div>
          </div>
        )}
        
          {expanded && showGoalManager && (
            <div className="goal-manager">
              {/* Progress bar at top */}
              <div className="goal-manager-progress">
                <div className="goal-sticky-progress">
                  <div className="goal-sticky-bar">
                    <div 
                      className="goal-sticky-fill" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="goal-sticky-text">Tasks</span>
                </div>
                <button 
                  className="goal-manager-back"
                  onClick={() => setShowGoalManager(false)}
                >
                  ← Back to Goals
                </button>
              </div>
              
              <div className="goal-list-clean">
                {savedGoals.length === 0 ? (
                  <p className="no-goals">No saved goals yet</p>
                ) : (
                  savedGoals.map(savedGoal => (
                    <div key={savedGoal.id} className={`goal-item-clean ${savedGoal.isActive ? 'active' : ''} ${savedGoal.completed ? 'completed' : ''}`}>
                      <div className="goal-item-info">
                        <span className="goal-item-title">
                          {savedGoal.completed ? '✅' : (savedGoal.parsed?.emoji || '💰')} {savedGoal.text}
                        </span>
                        <span className="goal-item-price">
                          {savedGoal.completed ? '✅ Completed!' : `$${savedGoal.savedAmount || 0} / $${savedGoal.parsed?.amount || 0}`}
                        </span>
                      </div>
                      <div className="goal-item-buttons">
                        <button
                          className={`goal-btn-clean ${savedGoal.completed ? 'completed' : (savedGoal.isActive ? 'active' : 'primary')}`}
                          onClick={() => setActiveGoal(savedGoal)}
                          disabled={savedGoal.isActive || savedGoal.completed}
                        >
                          {savedGoal.completed ? 'Completed' : (savedGoal.isActive ? 'Active' : 'Set Active')}
                        </button>
                        <button
                          className="goal-btn-clean delete"
                          onClick={() => setShowDeleteConfirm(savedGoal.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="add-goal-section">
                <input
                  type="text"
                  className="goal-input small"
                  placeholder="Add new goal..."
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewGoalToList()}
                />
                <button
                  className="goal-btn primary small"
                  onClick={addNewGoalToList}
                  disabled={!newGoalInput.trim() || isGeminiLoading}
                >
                  {isGeminiLoading ? '🤖 Generating...' : 'Add Goal'}
                </button>
              </div>
            </div>
          )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
            <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🗑️ Delete Goal</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this goal?</p>
                <p><strong>{savedGoals.find(g => g.id === showDeleteConfirm)?.text}</strong></p>
                <p><small>This action cannot be undone.</small></p>
              </div>
              <div className="modal-actions">
                <button 
                  className="goal-btn secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className="goal-btn cancel"
                  onClick={() => deleteGoalFromList(showDeleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Goal Confirmation Modal */}
        {showCancelConfirm && (
          <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
            <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>❌ Cancel Goal</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel your current goal?</p>
                <p><strong>{goal}</strong></p>
                <p><small>Progress will be saved, but this goal will no longer be active.</small></p>
              </div>
              <div className="modal-actions">
                <button 
                  className="goal-btn secondary"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep Goal
                </button>
                <button 
                  className="goal-btn cancel"
                  onClick={handleCancelGoal}
                >
                  Cancel Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular mode - full version  
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
        <input
          type="number"
          className="amount-input"
          placeholder="Amount $"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          min="0"
        />
        <div className="amount-buttons">
          <button 
            className="progress-btn save"
            onClick={handleSaveMoneyInput}
            disabled={!amountInput || parseInt(amountInput) <= 0}
          >
            💰 Saved
          </button>
          <button 
            className="progress-btn lost"
            onClick={handleLostMoneyInput}
            disabled={!amountInput || parseInt(amountInput) <= 0}
          >
            💸 Lost
          </button>
        </div>
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
        <div className="goal-actions-buttons">
          <button 
            className="goal-btn secondary" 
            onClick={handleSetGoal}
            disabled={settingGoal || !newGoal.trim()}
          >
            {settingGoal ? 'Updating...' : 'Update Goal'}
          </button>
          <button 
            className="goal-btn secondary"
            onClick={() => setShowGoalManager(!showGoalManager)}
          >
            Choose Other Goals
          </button>
          <button 
            className="goal-btn cancel" 
            onClick={() => setShowCancelConfirm(true)}
          >
            Cancel Goal
          </button>
        </div>
      </div>
    </div>
  );
}

export default GoalBar;
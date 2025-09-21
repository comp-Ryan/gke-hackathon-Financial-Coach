import React, { useState, useEffect, useCallback } from 'react';

function AdditionalTasks({ bankAPI }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('completedTasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchAdditionalTasks = async () => {
      if (!bankAPI) {
        // Use rich fallback data immediately if no bankAPI
        setTasks(getRichFallbackTasks());
        setLoading(false);
        return;
      }
      
      try {
        // This would call a new endpoint for additional tasks
        const data = await bankAPI.getAdditionalTasks();
        const apiTasks = data.tasks || [];
        
        // Check if API returned tasks have the required detail fields
        const hasRichData = apiTasks.length > 0 && apiTasks.every(task => 
          task.details && task.timeRequired && task.difficulty && task.estimatedSavings
        );
        
        if (hasRichData) {
          setTasks(apiTasks);
        } else {
          // Use rich fallback data if API data is incomplete
          setTasks(getRichFallbackTasks());
        }
      } catch (error) {
        console.error('Error fetching additional tasks:', error);
        // Use rich fallback data on error
        setTasks(getRichFallbackTasks());
      } finally {
        setLoading(false);
      }
    };

    const getRichFallbackTasks = () => [
      {
        id: 1,
        icon: "💡",
        title: "Review Subscriptions",
        description: "Check for unused monthly subscriptions",
        details: "Review all your recurring subscriptions and cancel any that you no longer use or need. Many people forget about subscriptions they signed up for and continue paying for services they don't use.",
        tips: [
          "Check your bank statements for recurring charges",
          "Use apps like Truebill or Honey to find subscriptions",
          "Cancel unused streaming services, gym memberships, or software subscriptions",
          "Set reminders to review subscriptions quarterly"
        ],
        estimatedSavings: "$50-200/month",
        timeRequired: "15-30 minutes",
        difficulty: "Easy"
      },
      {
        id: 2,
        icon: "📊",
        title: "Analyze Spending",
        description: "Review last week's top spending categories",
        details: "Understand where your money is going by analyzing your spending patterns from the past week. This awareness is the first step toward better financial control.",
        tips: [
          "Categorize your expenses (food, entertainment, utilities, etc.)",
          "Identify your top 3 spending categories",
          "Look for patterns in impulse purchases",
          "Compare this week to previous weeks"
        ],
        estimatedSavings: "Better awareness",
        timeRequired: "10-15 minutes",
        difficulty: "Easy"
      },
      {
        id: 3,
        icon: "🎯",
        title: "Set Mini-Goal",
        description: "Save $10 today by skipping one purchase",
        details: "Challenge yourself to save a small amount today by making a conscious spending decision. Small daily savings add up to significant amounts over time.",
        tips: [
          "Skip that coffee shop visit and make coffee at home",
          "Bring lunch instead of buying it",
          "Postpone that impulse online purchase for 24 hours",
          "Walk or bike instead of taking a rideshare"
        ],
        estimatedSavings: "$10-25/day",
        timeRequired: "All day mindfulness",
        difficulty: "Medium"
      }
    ];

    fetchAdditionalTasks();
  }, [bankAPI]);

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      // Close task modal if the deleted task was currently open
      if (selectedTask && selectedTask.id === taskToDelete.id) {
        closeTaskModal();
      }
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const handleCompleteTask = (taskId) => {
    const newCompletedTasks = [...completedTasks, taskId];
    setCompletedTasks(newCompletedTasks);
    localStorage.setItem('completedTasks', JSON.stringify(newCompletedTasks));
    setShowTaskModal(false);
  };

  const isTaskCompleted = (taskId) => {
    return completedTasks.includes(taskId);
  };

  if (loading) {
    return (
      <div className="additional-tasks">
        <h3>Loading tasks...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="additional-tasks">
        <h3>Additional Tasks</h3>
        <div className="task-list">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`task-item compact ${isTaskCompleted(task.id) ? 'completed' : ''}`} 
              onClick={() => openTaskModal(task)}
            >
              <div className="task-icon">{task.icon}</div>
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-desc">{task.description}</div>
              </div>
              <div className="task-status">
                {isTaskCompleted(task.id) ? (
                  <span className="task-completed-icon">✓</span>
                ) : (
                  <span className="task-expand-icon">👁️</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="modal-overlay" onClick={closeTaskModal}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <span className="modal-task-icon">{selectedTask.icon}</span>
                <h3>{selectedTask.title}</h3>
              </div>
              <button className="modal-close" onClick={closeTaskModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body task-modal-body">
              <div className="task-details-section">
                <h4>Overview</h4>
                <p>{selectedTask?.details || 'No details available'}</p>
              </div>

              <div className="task-info-grid">
                <div className="task-info-item">
                  <span className="info-label">Time Required:</span>
                  <span className="info-value">{selectedTask?.timeRequired || 'Not specified'}</span>
                </div>
                <div className="task-info-item">
                  <span className="info-label">Difficulty:</span>
                  <span className="info-value">{selectedTask?.difficulty || 'Not specified'}</span>
                </div>
                <div className="task-info-item">
                  <span className="info-label">Potential Savings:</span>
                  <span className="info-value">{selectedTask?.estimatedSavings || 'Not specified'}</span>
                </div>
              </div>
              
              {selectedTask?.tips && selectedTask.tips.length > 0 && (
                <div className="task-tips-section">
                  <h4>How to Complete This Task</h4>
                  <ul>
                    {selectedTask.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <div className="modal-footer-actions">
                {!isTaskCompleted(selectedTask.id) ? (
                  <>
                    <button 
                      className="task-btn delete" 
                      onClick={() => handleDeleteTask(selectedTask)}
                    >
                      Delete Task
                    </button>
                    <button 
                      className="task-btn completed" 
                      onClick={() => handleCompleteTask(selectedTask.id)}
                    >
                      Mark as Completed
                    </button>
                  </>
                ) : (
                  <div className="task-completed-message">
                    ✅ Task Completed! Great job!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && taskToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteTask}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Task</h3>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete this task?</p>
              <p><strong>{taskToDelete.title}</strong></p>
              <small>This action cannot be undone.</small>
            </div>
            
            <div className="modal-actions">
              <button 
                className="goal-btn cancel" 
                onClick={cancelDeleteTask}
              >
                Cancel
              </button>
              <button 
                className="goal-btn primary" 
                onClick={confirmDeleteTask}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChallengeList({ bankAPI, userProfile, onXPGained, onChallengeCompleted }) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingNew, setFetchingNew] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteChallenge = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChallenge = () => {
    // Reset challenge to trigger fetching a new one
    setChallenge(null);
    setShowDeleteConfirm(false);
    setShowModal(false);
    fetchChallenge();
  };

  const cancelDeleteChallenge = () => {
    setShowDeleteConfirm(false);
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
    <>
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
        
        {/* Compact Challenge Card */}
        <div className="challenge-card compact">
          <div className="challenge-compact-header" onClick={() => setShowModal(true)}>
            <div className="challenge-compact-content">
              <h3 className="challenge-compact-title">
                {challenge.title || challenge.challenge}
              </h3>
              <div className="challenge-compact-meta">
                <span className="xp-badge-compact">
                  {challenge.xp_reward} XP
                </span>
                <span className="expand-icon">👁️</span>
              </div>
            </div>
          </div>

          {/* Action buttons - Always visible */}
          <div className="challenge-compact-actions">
            {!challengeCompleted ? (
              <button 
                className="challenge-btn primary compact" 
                onClick={handleCompleteChallenge}
              >
                Complete (+{challenge.xp_reward} XP)
              </button>
            ) : (
              <div className="completed-message compact">
                ✓ Completed! +{challenge.xp_reward} XP
              </div>
            )}
          </div>
        </div>

        {/* Additional AI-Generated Tasks */}
        <AdditionalTasks bankAPI={bankAPI} />
      </div>

      {/* Challenge Details Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="challenge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{challenge.title || challenge.challenge}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="challenge-full-text">
                <h4>Challenge Details</h4>
                <p>{challenge.challenge}</p>
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
                <div className="detail-row">
                  <span className="detail-label">Difficulty:</span>
                  <span className="detail-value" style={{ color: difficultyInfo.color }}>
                    {difficultyInfo.level}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reward:</span>
                  <span className="detail-value">{challenge.xp_reward} XP</span>
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
                    <span className="context-value">${userProfile?.balance || 0}</span>
                  </div>
                  <div className="context-item">
                    <span className="context-label">Recent Spending</span>
                    <span className="context-value">${challenge.recent_spending || 0}</span>
                  </div>
                  <div className="context-item">
                    <span className="context-label">Transactions</span>
                    <span className="context-value">{userProfile?.transaction_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="modal-footer-actions">
                <button 
                  className="challenge-btn delete" 
                  onClick={handleDeleteChallenge}
                >
                  Delete Challenge
                </button>
                {!challengeCompleted ? (
                  <button 
                    className="challenge-btn primary" 
                    onClick={() => {
                      handleCompleteChallenge();
                      setShowModal(false);
                    }}
                  >
                    Complete Challenge (+{challenge.xp_reward} XP)
                  </button>
                ) : (
                  <button 
                    className="challenge-btn secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={cancelDeleteChallenge}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Challenge</h3>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete this challenge?</p>
              <p><strong>{challenge?.challenge}</strong></p>
              <small>This will fetch a new challenge for you.</small>
            </div>
            
            <div className="modal-actions">
              <button 
                className="goal-btn cancel" 
                onClick={cancelDeleteChallenge}
              >
                Cancel
              </button>
              <button 
                className="goal-btn primary" 
                onClick={confirmDeleteChallenge}
              >
                Delete & Get New Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChallengeList;
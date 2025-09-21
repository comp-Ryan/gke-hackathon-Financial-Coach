import React, { useState } from 'react';

  function BankConnection({ onConnect }) {
    const [mode, setMode] = useState('demo'); // 'demo' or 'custom'
    const [config, setConfig] = useState({
      userId: 'demo_user',
      bankUrl: 'http://localhost:8080',
      // Default JWT token - replace with your actual token
      jwtToken: 'your_jwt_token_here'
    });

  const handleConnect = () => {
    onConnect(config);
  };

  return (
    <div className="bank-connection">
      <div className="connection-header">
        <div className="connection-brand">
          <img src="/bankquest-logo.png" alt="BankQuest Logo" className="connection-logo" />
          <h1>BankQuest</h1>
        </div>
        <p>Embark on your financial adventure with AI-powered quests!</p>
      </div>

      <div className="connection-modes">
        <div className="mode-selector">
          <button 
            className={mode === 'demo' ? 'active' : ''}
            onClick={() => setMode('demo')}
          >
            🚀 Try Demo
          </button>
          <button 
            className={mode === 'custom' ? 'active' : ''}
            onClick={() => setMode('custom')}
          >
            🔧 Connect Your Own
          </button>
        </div>

        {mode === 'demo' ? (
          <div className="demo-mode">
            <div className="demo-info">
              <h3>✨ Demo Mode</h3>
              <p>Experience the AI coach with test Bank of Anthos data</p>
              <ul>
                <li>Pre-configured test account (testuser)</li>
                <li>Sample transaction history</li>
                <li>AI-generated personalized challenges</li>
                <li>No setup required - just click and go!</li>
              </ul>
            </div>
            
            <button className="connect-btn demo" onClick={handleConnect}>
              Start Demo 🚀
            </button>
          </div>
        ) : (
          <div className="custom-mode">
            <div className="custom-info">
              <h3>🔧 Custom Connection</h3>
              <p>Connect to your own Bank of Anthos instance</p>
            </div>

            <div className="form-group">
              <label>Bank of Anthos URL:</label>
              <input 
                type="text"
                value={config.bankUrl}
                onChange={(e) => setConfig({...config, bankUrl: e.target.value})}
                placeholder="http://your-bank-url"
              />
            </div>

            <div className="form-group">
              <label>User ID:</label>
              <input 
                type="text"
                value={config.userId}
                onChange={(e) => setConfig({...config, userId: e.target.value})}
                placeholder="1011226111"
              />
            </div>

            <div className="form-group">
              <label>JWT Token:</label>
              <textarea 
                value={config.jwtToken}
                onChange={(e) => setConfig({...config, jwtToken: e.target.value})}
                placeholder="eyJhbGciOiJSUzI1NiI..."
                rows="4"
              />
              <small>
                <strong>How to get your JWT token:</strong><br/>
                1. Open your Bank of Anthos instance and login<br/>
                2. Open browser dev tools (F12) → Network tab<br/>
                3. Refresh page or click around<br/>
                4. Find any API request → Copy Authorization header value<br/>
                5. Paste the full "Bearer ..." token here
              </small>
            </div>

            <button className="connect-btn custom" onClick={handleConnect}>
              Connect to AI Coach 🔗
            </button>
          </div>
        )}
      </div>

      <div className="features-preview">
        <h3>What You'll Get:</h3>
        <div className="feature-grid">
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span>Smart Goal Tracking</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <span>AI-Powered Challenges</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏅</span>
            <span>Achievement System</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>Progress Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankConnection;
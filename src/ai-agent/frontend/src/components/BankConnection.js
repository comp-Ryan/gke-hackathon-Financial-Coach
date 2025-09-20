import React, { useState } from 'react';

function BankConnection({ onConnect }) {
  const [mode, setMode] = useState('demo'); // 'demo' or 'custom'
  const [config, setConfig] = useState({
    userId: '1011226111',
    bankUrl: 'http://34.186.146.83',
    // Default JWT token (the one we got from testing)
    jwtToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdHVzZXIiLCJhY2N0IjoiMTAxMTIyNjExMSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3NTczMDMxNjMsImV4cCI6MTc1NzMwNjc2M30.urIhISrT_GX1gKkKgryob8mosjhY2ZVbrE_6T6jVh6-GUtnxlGzO8wir_XbQqS1RCMk3F1R01o1aF_ga7xpS5GDbvgi_9jMx-hzhj9yBp2nRbfsGFUosegKV0BmHitMOxsi8mj26SZBNSDgQOZwAAGC7xNQn7q5DsARo6GggvoVU0CUWgAG1DFtjfSWhJnTSYtnkbnsCSucyGIkp3t6epkXHK-9cp31Wzaq0Ng_IckLjc4xqnnV93DLRjWLLZ8cxc2DK_eIT6gpVljupOdpWyf9rRPYzr_YRB5b-2WPaVzblfAygUKCbgpPg-uAbr9GsiDUehByh3Abv2xsXydT5HgLAcZu1yy06LMBW7Zm5M99KPWNKagobndHbwqBOoVpQj95pJLG9MJsuN2DKnMZPmh7KtrclThIvj2GXG3PjtUE2TzqiczcDTMJJ_FVwFoSql6gG87_NsIrt7sKqB27r-xkEBSKOAftwlMK7pL7wjX0lEAh6oL60dJylAUrdGERF6f-S6NovIdYBDVFlwiWRikPvhe7jW07UqGJkGj396zMNExXl6EqNhddCTG8FVD8QnA0YJm4agr2RRRbTlRBuvNo2g_J9NYMsQXtSh9_L1tfNtjc9eVt60IivyqWwRQWQpgXgLPnNU_N5Q9pLBlmrZWy1EvkC-ECrGvPphJY0xzI'
  });

  const handleConnect = () => {
    onConnect(config);
  };

  return (
    <div className="bank-connection">
      <div className="connection-header">
        <h1>🏦 AI Financial Coach</h1>
        <p>Get personalized financial challenges powered by AI</p>
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
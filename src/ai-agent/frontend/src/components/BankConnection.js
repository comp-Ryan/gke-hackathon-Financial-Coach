import React, { useState } from 'react';

function BankConnection({ onConnect }) {
  const [mode, setMode] = useState('demo'); // 'demo' or 'custom'
  const [config, setConfig] = useState({
    userId: '1011226111',
    bankUrl: 'http://34.186.146.83',
    // Default JWT token (the one we got from testing)
    jwtToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdHVzZXIiLCJhY2N0IjoiMTAxMTIyNjExMSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3NTg0MzU0NzIsImV4cCI6MTc1ODQzOTA3Mn0.IMYzqIQPb4Sjc3grw_H-vQ_pZJBE_blDTOCq_xrbpnv64JVRz9MLi8tKYZuw78HzSgacDnSAUYGZHn9WIcHq9mmBw-YjSTnuGmUYcWv4Nvc_DVeDawY96bt4TvSVYwot8c61fNxL3tu0H2ksOAMsvOUJ7GaNV6rt2cILjtHV2OzwF-BQo3EwdmEVUmgvEwC0dVCquVAj40eHRBCZrA6WjGJNQUAsgK56Y15XsNkt6AziNdpIt-lMFhSC941ipJ_6C6QO8EfJ0oHtFHij7E3hijCaQ_RL2rOJYoG_vKNk7nl6nSksoGqFlXUG4iVXGwvoX3JCGeXqHBOs0eRgzjLTMk0md03HBd2wIJoj49i9yJ8Llw0AYZg59in53KoNEwRYquNu1bjUcH6jLPR47Yb-hzAWebDc_68l3PAMfqi5AjLvNPigu7zkmaG2c5zEjrECIiRy8DZ79mykTgTXLU2e_zNbQGtE3PKO_mKIWz9rkh3E1vXmW5RO4Hs_9jYBGGvCI_bX9qHcGDmw1gSdR9sE1OXyODtmot7rGa9sqdBnNYPD0h2O2R5v4h1uQMkonxk0zWieH5sNSQzfBUfVnl-3xcoN6-6jPOsZp1ecggcznRg60fWrSpLzLBzFz5kYZOgqstJgRHLjTnl0RDPMX_dKEN006yrT-0nRwQT32MhaUjg'
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
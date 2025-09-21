import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BankAPI from './services/api';

function App() {
  const [bankAPI, setBankAPI] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      // Default demo configuration - always load dashboard
      const defaultConfig = {
        userId: 'demo_user',
        bankUrl: 'http://localhost:8080',
        jwtToken: 'your_jwt_token_here'
      };
    
    setBankAPI(new BankAPI(defaultConfig));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#333'
      }}>
        Loading BankQuest...
      </div>
    );
  }

  return <Dashboard bankAPI={bankAPI} />;
}

export default App;
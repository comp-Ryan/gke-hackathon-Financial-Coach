noimport React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BankAPI from './services/api';

function App() {
  const [bankAPI, setBankAPI] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default demo configuration - always load dashboard
    const defaultConfig = {
      userId: '1011226111',
      bankUrl: 'http://34.186.146.83',
      jwtToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdHVzZXIiLCJhY2N0IjoiMTAxMTIyNjExMSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3NTczMDMxNjMsImV4cCI6MTc1NzMwNjc2M30.urIhISrT_GX1gKkKgryob8mosjhY2ZVbrE_6T6jVh6-GUtnxlGzO8wir_XbQqS1RCMk3F1R01o1aF_ga7xpS5GDbvgi_9jMx-hzhj9yBp2nRbfsGFUosegKV0BmHitMOxsi8mj26SZBNSDgQOZwAAGC7xNQn7q5DsARo6GggvoVU0CUWgAG1DFtjfSWhJnTSYtnkbnsCSucyGIkp3t6epkXHK-9cp31Wzaq0Ng_IckLjc4xqnnV93DLRjWLLZ8cxc2DK_eIT6gpVljupOdpWyf9rRPYzr_YRB5b-2WPaVzblfAygUKCbgpPg-uAbr9GsiDUehByh3Abv2xsXydT5HgLAcZu1yy06LMBW7Zm5M99KPWNKagobndHbwqBOoVpQj95pJLG9MJsuN2DKnMZPmh7KtrclThIvj2GXG3PjtUE2TzqiczcDTMJJ_FVwFoSql6gG87_NsIrt7sKqB27r-xkEBSKOAftwlMK7pL7wjX0lEAh6oL60dJylAUrdGERF6f-S6NovIdYBDVFlwiWRikPvhe7jW07UqGJkGj396zMNExXl6EqNhddCTG8FVD8QnA0YJm4agr2RRRbTlRBuvNo2g_J9NYMsQXtSh9_L1tfNtjc9eVt60IivyqWwRQWQpgXgLPnNU_N5Q9pLBlmrZWy1EvkC-ECrGvPphJY0xzI'
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
        Loading Financial Coach...
      </div>
    );
  }

  return <Dashboard bankAPI={bankAPI} />;
}

export default App;
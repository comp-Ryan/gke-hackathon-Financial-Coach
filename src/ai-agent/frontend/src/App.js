import React, { useState, useEffect } from 'react';
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
      jwtToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdHVzZXIiLCJhY2N0IjoiMTAxMTIyNjExMSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3NTg0MzU0NzIsImV4cCI6MTc1ODQzOTA3Mn0.IMYzqIQPb4Sjc3grw_H-vQ_pZJBE_blDTOCq_xrbpnv64JVRz9MLi8tKYZuw78HzSgacDnSAUYGZHn9WIcHq9mmBw-YjSTnuGmUYcWv4Nvc_DVeDawY96bt4TvSVYwot8c61fNxL3tu0H2ksOAMsvOUJ7GaNV6rt2cILjtHV2OzwF-BQo3EwdmEVUmgvEwC0dVCquVAj40eHRBCZrA6WjGJNQUAsgK56Y15XsNkt6AziNdpIt-lMFhSC941ipJ_6C6QO8EfJ0oHtFHij7E3hijCaQ_RL2rOJYoG_vKNk7nl6nSksoGqFlXUG4iVXGwvoX3JCGeXqHBOs0eRgzjLTMk0md03HBd2wIJoj49i9yJ8Llw0AYZg59in53KoNEwRYquNu1bjUcH6jLPR47Yb-hzAWebDc_68l3PAMfqi5AjLvNPigu7zkmaG2c5zEjrECIiRy8DZ79mykTgTXLU2e_zNbQGtE3PKO_mKIWz9rkh3E1vXmW5RO4Hs_9jYBGGvCI_bX9qHcGDmw1gSdR9sE1OXyODtmot7rGa9sqdBnNYPD0h2O2R5v4h1uQMkonxk0zWieH5sNSQzfBUfVnl-3xcoN6-6jPOsZp1ecggcznRg60fWrSpLzLBzFz5kYZOgqstJgRHLjTnl0RDPMX_dKEN006yrT-0nRwQT32MhaUjg'
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